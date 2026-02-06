import { Message } from "./types";

/**
 * Gets the chat context limited to the most recent messages.
 * Currently configured to return the last 10 messages (ideally 5 user + 5 assistant).
 *
 * @param messages The full history of messages
 * @returns The filtered list of messages
 */
export const getChatContext = (
  messages: Message[],
): { role: string; content: string }[] => {
  // Return the last 10 messages
  // This effectively gives us the most recent context
  return messages.slice(-10).map(({ role, content }) => ({ role, content }));
};
