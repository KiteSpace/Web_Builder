import type { AIProvider } from "../orchestrator/types";
import { logger } from "../orchestrator/logger";

export class OpenAIProvider implements AIProvider {
  async streamCompletion(params: {
    messages: Array<{ role: "user" | "assistant" | "system"; content: string }>;
    apiKey: string;
    onChunk: (text: string) => void;
    onComplete: (fullText: string) => void;
    onError: (error: Error) => void;
  }): Promise<void> {
    const { messages, apiKey, onChunk, onComplete, onError } = params;

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages,
          stream: true,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error?.message || `OpenAI API error: ${response.statusText}`
        );
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response body");
      }

      const decoder = new TextDecoder();
      let buffer = "";
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") {
              onComplete(fullText);
              return;
            }

            try {
              const json = JSON.parse(data);
              const content = json.choices?.[0]?.delta?.content;
              if (content) {
                fullText += content;
                onChunk(content);
              }
            } catch (e) {
              logger.debug("Failed to parse SSE chunk", e);
            }
          }
        }
      }

      onComplete(fullText);
    } catch (error) {
      logger.error("OpenAI stream error", error);
      onError(error instanceof Error ? error : new Error(String(error)));
    }
  }
}
