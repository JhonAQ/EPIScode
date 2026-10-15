import { config } from "@/server/config";

const OLLAMA_URL = "http://localhost:11434/api/embeddings";
const OLLAMA_MODEL = "all-minilm";

function normalizeL2(vec: number[]): number[] {
  const norm = Math.sqrt(vec.reduce((sum, v) => sum + v * v, 0));
  return norm === 0 ? vec : vec.map((v) => v / norm);
}

function validateEmbeddings(embeddings: number[][]): void {
  if (!Array.isArray(embeddings)) {
    throw new Error("Respuesta inválida: no es array");
  }
  for (const vec of embeddings) {
    if (!Array.isArray(vec) || vec.length !== config.hf.dimensions) {
      throw new Error(
        `Dimensión incorrecta: ${vec?.length ?? "undefined"} vs ${config.hf.dimensions}`
      );
    }
  }
}

async function callOllamaEmbedding(text: string): Promise<number[]> {
  const res = await fetch(OLLAMA_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: OLLAMA_MODEL, prompt: text }),
  });

  if (!res.ok) {
    throw new Error(`Ollama API error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  return data.embedding;
}

export async function embedTexts(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];

  const embeddings = await Promise.all(
    texts.map((text) => callOllamaEmbedding(text))
  );

  validateEmbeddings(embeddings);
  return embeddings.map(normalizeL2);
}

export async function embedQuery(text: string): Promise<number[]> {
  return callOllamaEmbedding(text);
}