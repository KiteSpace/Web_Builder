import type { AIProvider } from "../orchestrator/types";
import { OpenAIProvider } from "./openAIProvider";

class ProviderRegistry {
  private providers: Map<string, AIProvider> = new Map();
  private defaultProvider: AIProvider;

  constructor() {
    this.defaultProvider = new OpenAIProvider();
    this.register("openai", this.defaultProvider);
  }

  register(name: string, provider: AIProvider) {
    this.providers.set(name, provider);
  }

  get(name?: string): AIProvider {
    if (name && this.providers.has(name)) {
      return this.providers.get(name)!;
    }
    return this.defaultProvider;
  }

  list(): string[] {
    return Array.from(this.providers.keys());
  }
}

export const providerRegistry = new ProviderRegistry();
