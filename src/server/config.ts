/** Lectura centralizada de variables de entorno (solo servidor). */
function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Falta la variable de entorno ${name}. Revisa tu .env.local (ver .env.example).`);
  }
  return value;
}

export const config = {
  get databaseUrl() {
    return required("DATABASE_URL");
  },
  embeddings: {
    model: "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2",
    dimensions: 384,
  },
  rag: {
    /** Corte de ruido calibrado; no determina si el contexto contiene una respuesta. */
    get minSimilarity() {
      const value = process.env.RAG_MIN_SIMILARITY ?? "0.15";
      const threshold = Number(value);
      if (value.trim() === "" || !Number.isFinite(threshold) || threshold < -1 || threshold > 1) {
        throw new Error("RAG_MIN_SIMILARITY debe ser un número finito entre -1 y 1.");
      }
      return threshold;
    },
  },
  llm: {
    provider: (process.env.LLM_PROVIDER ?? "gemini") as "gemini" | "groq",
    gemini: {
      get apiKey() {
        return required("GEMINI_API_KEY");
      },
      model: process.env.GEMINI_MODEL ?? "gemini-2.5-flash",
    },
    groq: {
      get apiKey() {
        return required("GROQ_API_KEY");
      },
      model: process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile",
    },
  },
} as const;
