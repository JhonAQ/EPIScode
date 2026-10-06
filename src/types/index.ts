export interface HealthResponse {
  status: "ok" | "error";
  uptime: number;
  timestamp: string;
  version: string;
  environment: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// --- Chatbot RAG -------------------------------------------------------------

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

/** Fragmento del documento que respaldó una respuesta. */
export interface ChatSource {
  source: string;
  chunkIndex: number;
  content: string;
  /** Similitud coseno (1 = idéntico). */
  score: number;
}

export interface ChatRequest {
  messages: ChatMessage[];
}

export interface ChatResponse {
  answer: string;
  sources: ChatSource[];
}
