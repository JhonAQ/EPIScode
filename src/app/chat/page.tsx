import { ChatWindow } from "@/features/chatbot/components/ChatWindow";

export const metadata = { title: "Chatbot RAG · EPIScode" };

export default function ChatPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 px-4 py-8">
      <h1 className="text-center text-2xl font-semibold">Chatbot RAG</h1>
      <ChatWindow />
    </main>
  );
}
