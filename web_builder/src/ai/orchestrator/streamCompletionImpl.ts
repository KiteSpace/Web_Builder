import type { AIProvider, FileAction, OrchestratorCallbacks } from "./types";
import { extractJsonActions } from "./extractJsonActions";
import { logger } from "./logger";

export async function streamCompletionImpl(
  provider: AIProvider,
  messages: Array<{ role: "user" | "assistant" | "system"; content: string }>,
  apiKey: string,
  callbacks: OrchestratorCallbacks
): Promise<void> {
  let accumulatedText = "";
  let lastActionCount = 0;

  await provider.streamCompletion({
    messages,
    apiKey,
    onChunk: (chunk: string) => {
      accumulatedText += chunk;
      callbacks.onMessage?.(accumulatedText);

      // Try to extract actions incrementally
      const actions = extractJsonActions(accumulatedText);
      if (actions.length > lastActionCount) {
        const newActions = actions.slice(lastActionCount);
        callbacks.onActions?.(newActions);
        lastActionCount = actions.length;
      }
    },
    onComplete: (fullText: string) => {
      // Final extraction of actions
      const actions = extractJsonActions(fullText);
      if (actions.length > lastActionCount) {
        const newActions = actions.slice(lastActionCount);
        callbacks.onActions?.(newActions);
      }
      callbacks.onComplete?.();
    },
    onError: (error: Error) => {
      logger.error("Stream completion error", error);
      callbacks.onError?.(error);
    },
  });
}
