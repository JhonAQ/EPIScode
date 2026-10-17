import { createChatPost } from "@/server/chat-endpoint";
import { answerQuestion } from "@/server/rag/pipeline";

// PostgreSQL y child_process requieren Node.js en el servidor.
export const runtime = "nodejs";

export const POST = createChatPost(answerQuestion);
