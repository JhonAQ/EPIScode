import type { ChatMessage } from "@/types";

export const MAX_CHAT_BODY_LENGTH = 50000;
export const MAX_CHAT_MESSAGES = 19;

export function buildChatRequest(messages: ChatMessage[]): { messages: ChatMessage[] } {
  const history = messages.slice(-MAX_CHAT_MESSAGES).map(({ role, content }) => ({ role, content }));
  while (history.length > 1 && JSON.stringify({ messages: history }).length > MAX_CHAT_BODY_LENGTH) {
    history.splice(0, 2);
  }
  return { messages: history };
}
