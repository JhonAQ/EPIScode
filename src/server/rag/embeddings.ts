import { config } from "@/server/config";
import { postJson } from "./http";
export function validateEmbedding(value: unknown): asserts value is number[] {
  if (!Array.isArray(value) || value.length !== config.hf.dimensions || !value.every(n => typeof n === "number" && Number.isFinite(n)) || value.every(n => n === 0)) throw new Error("Embedding de dimensión incorrecta o inválido");
}
export async function embedTexts(texts: string[]): Promise<number[][]> {
  if (!texts.length) return [];
  if (config.embeddings.provider === "local") return embedLocal(texts);
  if (config.embeddings.provider !== "huggingface") throw new Error("EMBEDDING_PROVIDER debe ser local o huggingface");
  const result: number[][] = [];
  for (let i = 0; i < texts.length; i += 8) {
    const batch = texts.slice(i, i + 8);
    const response = await postJson("https://router.huggingface.co/hf-inference/models/" + config.hf.model, { Authorization: "Bearer " + config.hf.token }, { inputs: batch, normalize: true, truncate: true });
    if (!Array.isArray(response) || response.length !== batch.length) throw new Error("Lote de embeddings inválido");
    for (const vector of response) { validateEmbedding(vector); result.push(vector); }
  }
  return result;
}
export async function embedQuery(text: string): Promise<number[]> { return (await embedTexts([text]))[0]; }

type Extractor = import("@huggingface/transformers").FeatureExtractionPipeline;
let extractorPromise: Promise<Extractor> | undefined;
async function getExtractor(): Promise<Extractor> {
  if (!extractorPromise) {
    extractorPromise = (async () => {
      const { pipeline, env } = await import("@huggingface/transformers");
      const { resolve } = await import("node:path");
      env.cacheDir = resolve(process.cwd(), ".cache", "transformers");
      env.allowLocalModels = false;
      return pipeline("feature-extraction", config.embeddings.localModel, { dtype: "q8", device: "cpu" });
    })().catch(error => { extractorPromise = undefined; throw error; });
  }
  return extractorPromise;
}
async function embedLocal(texts: string[]): Promise<number[][]> {
  const extractor = await getExtractor();
  const result: number[][] = [];
  for (const text of texts) {
    const output = await extractor(text, { pooling: "mean", normalize: true });
    const vector: unknown = output.tolist()[0];
    validateEmbedding(vector);
    result.push(vector);
  }
  return result;
}
