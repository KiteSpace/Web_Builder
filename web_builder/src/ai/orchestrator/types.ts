export type FileAction = 
  | { type: "createFile"; path: string; content: string }
  | { type: "updateFile"; path: string; content: string }
  | { type: "deleteFile"; path: string };

export interface ActionBlock {
  actions: FileAction[];
}

export interface ProjectState {
  files: Array<{ path: string; content: string }>;
}

export interface AIProvider {
  streamCompletion(params: {
    messages: Array<{ role: "user" | "assistant" | "system"; content: string }>;
    apiKey: string;
    onChunk: (text: string) => void;
    onComplete: (fullText: string) => void;
    onError: (error: Error) => void;
  }): Promise<void>;
}

export interface OrchestratorCallbacks {
  onMessage?: (text: string) => void;
  onActions?: (actions: FileAction[]) => void;
  onError?: (error: Error) => void;
  onComplete?: () => void;
}

export interface AIOrchestratorConfig {
  apiKey: string;
  provider?: AIProvider;
  callbacks?: OrchestratorCallbacks;
}
