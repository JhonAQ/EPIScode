import { execFile } from "node:child_process";
import path from "node:path";
import { config } from "../config";

/** Un proceso por lote; los textos viajan exclusivamente como JSON por stdin. */
export async function embedTexts(texts: string[]): Promise<number[][]> {
  if (!Array.isArray(texts) || texts.some((text) => typeof text !== "string")) {
    throw new Error("Embeddings locales: se esperaba una lista de textos.");
  }
  if (texts.length === 0) return [];

  const root = process.cwd();
  const python = path.join(root, ".venv", process.platform === "win32" ? "Scripts/python.exe" : "bin/python");
  const script = path.join(root, "scripts", "embed_local.py");
  const output = await new Promise<string>((resolve, reject) => {
    const child = execFile(python, ["-I", script, config.embeddings.model], {
      cwd: root,
      shell: false,
      windowsHide: true,
      timeout: 120_000,
      maxBuffer: 64 * 1024 * 1024,
      encoding: "utf8",
      // No transmitir tokens ni credenciales del servidor al proceso Python.
      env: {
        NODE_ENV: "production",
        SystemRoot: process.env.SystemRoot,
        WINDIR: process.env.WINDIR,
        TEMP: process.env.TEMP,
        TMP: process.env.TMP,
      },
    }, (error, stdout, stderr) => {
      if (stderr) process.stderr.write(stderr);
      if (error) {
        reject(new Error(
          `Embeddings locales: Python falló (${error.message}). Verifica .venv, requirements-embeddings.txt y la caché del modelo.`,
          { cause: error },
        ));
        return;
      }
      resolve(stdout);
    });
    child.stdin?.on("error", (error) => {
      reject(new Error("Embeddings locales: no se pudo enviar el lote a Python.", { cause: error }));
    });
    child.stdin?.end(JSON.stringify(texts));
  });

  let vectors: unknown;
  try {
    vectors = JSON.parse(output);
  } catch (error) {
    throw new Error("Embeddings locales: Python devolvió JSON inválido.", { cause: error });
  }
  if (!Array.isArray(vectors) || vectors.length !== texts.length) {
    throw new Error("Embeddings locales: debe devolverse un vector por texto.");
  }
  for (const [index, vector] of vectors.entries()) {
    if (!Array.isArray(vector) || vector.length !== config.embeddings.dimensions ||
        !vector.every((value: unknown) => typeof value === "number" && Number.isFinite(value))) {
      throw new Error(`Embeddings locales: el vector ${index} debe contener 384 números finitos.`);
    }
  }
  return vectors as number[][];
}

/** Preguntas y documentos usan exactamente el mismo modelo y procesamiento. */
export async function embedQuery(text: string): Promise<number[]> {
  const [vector] = await embedTexts([text]);
  return vector;
}
