import type {
  AIOrchestratorConfig,
  FileAction,
  OrchestratorCallbacks,
  ProjectState,
} from "./types";
import { providerRegistry } from "../providers/providerRegistry";
import { streamCompletionImpl } from "./streamCompletionImpl";
import { applyActionsToProject } from "./applyActionsToProject";
import { SYSTEM_PROMPT } from "../systemPrompt";
import { logger } from "./logger";

export class AIOrchestrator {
  private apiKey: string;
  private provider;
  private callbacks: OrchestratorCallbacks;
  private conversationHistory: Array<{
    role: "user" | "assistant" | "system";
    content: string;
  }> = [];

  constructor(config: AIOrchestratorConfig) {
    this.apiKey = config.apiKey;
    this.provider = config.provider || providerRegistry.get();
    this.callbacks = config.callbacks || {};

    // Initialize with system prompt
    this.conversationHistory = [
      { role: "system", content: SYSTEM_PROMPT },
    ];
  }

  async sendMessage(userMessage: string, currentProject: ProjectState): Promise<void> {
    // Add user message to history
    this.conversationHistory.push({
      role: "user",
      content: userMessage,
    });

    // Add current project context to the message
    const projectContext = `Current project files:\n${currentProject.files
      .map((f) => `- ${f.path}`)
      .join("\n")}`;

    const contextualMessage = `${userMessage}\n\n${projectContext}`;
    this.conversationHistory[this.conversationHistory.length - 1].content =
      contextualMessage;

    logger.info("Sending message to AI", { messageLength: userMessage.length });

    // Track actions to apply and full response text
    let pendingActions: FileAction[] = [];
    let fullResponseText = "";

    await streamCompletionImpl(
      this.provider,
      this.conversationHistory,
      this.apiKey,
      {
        onMessage: (text: string) => {
          fullResponseText = text;
          this.callbacks.onMessage?.(text);
        },
        onActions: (actions: FileAction[]) => {
          pendingActions.push(...actions);
          this.callbacks.onActions?.(actions);
        },
        onError: (error: Error) => {
          logger.error("Orchestrator error", error);
          this.callbacks.onError?.(error);
        },
        onComplete: () => {
          // Add assistant response to history
          this.conversationHistory.push({
            role: "assistant",
            content: fullResponseText || "[Response completed]",
          });

          // Apply all pending actions
          if (pendingActions.length > 0) {
            logger.info(`Applying ${pendingActions.length} actions to project`);
          }

          this.callbacks.onComplete?.();
        },
      }
    );
  }

  getHistory() {
    return [...this.conversationHistory];
  }

  clearHistory() {
    this.conversationHistory = [{ role: "system", content: SYSTEM_PROMPT }];
  }
}
