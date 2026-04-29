export type RiskLevel = "low" | "medium" | "high";

export interface AiMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AiProvider {
  complete(messages: AiMessage[]): Promise<string>;
}

export class MockAiProvider implements AiProvider {
  async complete(messages: AiMessage[]): Promise<string> {
    const lastUserMessage = [...messages].reverse().find((message) => message.role === "user");
    return `Mock AI response based on: ${lastUserMessage?.content.slice(0, 180) ?? "no input"}`;
  }
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function unique<T>(items: T[]): T[] {
  return [...new Set(items)];
}

export function formatDate(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

