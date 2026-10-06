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
  hf: {
    get token() {
      return required("HF_API_TOKEN");
    },
    model: process.env.HF_EMBEDDING_MODEL ?? "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2",
    dimensions: Number(process.env.EMBEDDING_DIMENSIONS ?? 384),
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
