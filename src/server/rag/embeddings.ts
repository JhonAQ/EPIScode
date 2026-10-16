import { pipeline } from "@huggingface/transformers";

import { config } from "../config";

// Guardamos la promesa para compartir una sola carga del modelo entre llamadas simultáneas.
let extractorPromise: ReturnType<typeof pipeline<"feature-extraction">> | undefined;

// Carga el modelo local la primera vez y devuelve el mismo extractor en las siguientes llamadas.
async function getExtractor(): Promise<Awaited<ReturnType<typeof pipeline<"feature-extraction">>>> {
  // Si todavía no empezó la carga, se inicia ahora.
  if (!extractorPromise) {
    // "feature-extraction" indica que queremos convertir texto en vectores.
    // La ruta apunta a los archivos locales; no se permite descargar el modelo desde Internet.
    extractorPromise = pipeline("feature-extraction", config.hf.localPath, {
      local_files_only: true,
    });

    // Si la carga falla, quitamos la promesa rechazada para permitir otro intento más adelante.
    extractorPromise.catch(() => {
      extractorPromise = undefined;
    });
  }

  // Devolvemos la carga en curso o el modelo que ya quedó listo.
  return extractorPromise;
}

// Convierte varios textos en vectores; se usa al preparar los fragmentos del documento.
export async function embedTexts(texts: string[]): Promise<number[][]> {
  // No hay nada que convertir, así que devolvemos una lista vacía sin cargar el modelo.
  if (texts.length === 0) {
    return [];
  }

  // Esperamos el extractor antes de pedirle que procese los textos.
  const extractor = await getExtractor();

  // El extractor devuelve representaciones de los tokens; "mean" las promedia
  // para producir un solo vector por cada texto recibido.
  const tensor = await extractor(texts, { pooling: "mean" });

  // Convertimos el tensor del modelo en listas normales de JavaScript.
  // Esta anotación orienta a TypeScript; las comprobaciones reales vienen después.
  const vectors = tensor.tolist() as number[][];

  // Cada texto debe tener exactamente un vector en la misma posición del resultado.
  if (vectors.length !== texts.length) {
    throw new Error(`Se esperaban ${texts.length} embeddings, pero se recibieron ${vectors.length}.`);
  }

  // Revisamos cada vector antes de devolverlo a quien lo guardará en la base de datos.
  for (const vector of vectors) {
    // La cantidad de números debe coincidir con la dimensión configurada para la base.
    if (vector.length !== config.hf.dimensions) {
      throw new Error(`El embedding debe tener ${config.hf.dimensions} dimensiones; recibió ${vector.length}.`);
    }

    // Cada coordenada debe ser un número válido, no NaN ni infinito.
    for (const value of vector) {
      if (!Number.isFinite(value)) {
        throw new Error("El embedding contiene un valor no finito.");
      }
    }
  }

  // Devolvemos un vector por cada texto, conservando el orden de entrada.
  return vectors;
}

/** Genera el vector de una pregunta con el mismo modelo local usado para los textos. */
export async function embedQuery(text: string): Promise<number[]> {
  // Reutilizamos la función de lotes con una lista de un solo texto.
  const vectors = await embedTexts([text]);

  // De esa lista de un vector, devolvemos el vector de la pregunta.
  return vectors[0];
}
