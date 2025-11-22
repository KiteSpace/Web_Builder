import { createContext, useContext, useState, useRef, useEffect, ReactNode } from "react";
import { AIOrchestrator } from "../ai/orchestrator/AIOrchestrator";
import type { FileAction } from "../ai/orchestrator/types";
import { useProject } from "./ProjectContext";
import type { Message } from "../components/ChatPanel/ChatMessage";

const API_KEY_STORAGE_KEY = "webclibuilder_openai_api_key";

type ChatMode = "chat" | "builder";

interface ChatContextValue {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  input: string;
  setInput: (value: string) => void;
  mode: ChatMode;
  setMode: (mode: ChatMode) => void;
  apiKey: string | null;
  setApiKey: (key: string | null) => void;
  showApiKeyPrompt: boolean;
  setShowApiKeyPrompt: (show: boolean) => void;
  apiKeyInput: string;
  setApiKeyInput: (value: string) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  orchestrator: AIOrchestrator | null;
  currentMessageId: string | null;
  setCurrentMessageId: (id: string | null) => void;
  sendMessage: (message: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const { project, applyActions } = useProject();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "Describe what you want to build and I'll turn it into a UI prototype.",
    },
  ]);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<ChatMode>("builder");
  const [apiKey, setApiKeyState] = useState<string | null>(null);
  const [showApiKeyPrompt, setShowApiKeyPrompt] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const orchestratorRef = useRef<AIOrchestrator | null>(null);
  const currentMessageIdRef = useRef<string | null>(null);

  const setApiKey = (key: string | null) => {
    setApiKeyState(key);
    if (key) {
      localStorage.setItem(API_KEY_STORAGE_KEY, key);
    } else {
      localStorage.removeItem(API_KEY_STORAGE_KEY);
    }
  };

  // Check for API key on mount
  useEffect(() => {
    const stored = localStorage.getItem(API_KEY_STORAGE_KEY);
    if (stored) {
      setApiKey(stored);
      setShowApiKeyPrompt(false);
    } else {
      setShowApiKeyPrompt(true);
      setMessages((prev) => {
        if (prev.some((msg) => msg.id === "api-key-prompt")) {
          return prev;
        }
        return [
          ...prev,
          {
            id: "api-key-prompt",
            role: "assistant",
            text: "To get started, please enter your OpenAI API key. It will be stored locally in your browser.",
          },
        ];
      });
    }
  }, []);

  // Initialize orchestrator when API key is available
  useEffect(() => {
    if (apiKey && !orchestratorRef.current) {
      orchestratorRef.current = new AIOrchestrator({
        apiKey,
        callbacks: {
          onMessage: (text: string) => {
            setMessages((prev) => {
              if (currentMessageIdRef.current) {
                return prev.map((msg) =>
                  msg.id === currentMessageIdRef.current
                    ? { ...msg, text, isStreaming: true }
                    : msg
                );
              }
              return prev;
            });
          },
          onActions: (actions: FileAction[]) => {
            setMessages((prev) => {
              if (currentMessageIdRef.current) {
                return prev.map((msg) =>
                  msg.id === currentMessageIdRef.current
                    ? { ...msg, actions: [...(msg.actions || []), ...actions] }
                    : msg
                );
              }
              return prev;
            });
            applyActions(actions);
          },
          onError: (error: Error) => {
            setMessages((prev) => {
              if (currentMessageIdRef.current) {
                return prev.map((msg) =>
                  msg.id === currentMessageIdRef.current
                    ? { ...msg, text: msg.text + `\n\nError: ${error.message}`, isStreaming: false }
                    : msg
                );
              }
              return prev;
            });
            setIsLoading(false);
          },
          onComplete: () => {
            setMessages((prev) => {
              if (currentMessageIdRef.current) {
                return prev.map((msg) =>
                  msg.id === currentMessageIdRef.current
                    ? { ...msg, isStreaming: false }
                    : msg
                );
              }
              return prev;
            });
            setIsLoading(false);
            currentMessageIdRef.current = null;
          },
        },
      });
    }
  }, [apiKey, applyActions, project]);

  const sendMessage = async (userMessage: string) => {
    if (!userMessage.trim() || isLoading || !apiKey) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      text: userMessage.trim(),
    };

    const assistantMsg: Message = {
      id: `assistant-${Date.now()}`,
      role: "assistant",
      text: "",
      isStreaming: true,
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setInput("");
    setIsLoading(true);
    currentMessageIdRef.current = assistantMsg.id;

    if (orchestratorRef.current) {
      await orchestratorRef.current.sendMessage(userMessage.trim(), project);
    }
  };

  return (
    <ChatContext.Provider
      value={{
        messages,
        setMessages,
        input,
        setInput,
        mode,
        setMode,
        apiKey,
        setApiKey,
        showApiKeyPrompt,
        setShowApiKeyPrompt,
        apiKeyInput,
        setApiKeyInput,
        isLoading,
        setIsLoading,
        orchestrator: orchestratorRef.current,
        currentMessageId: currentMessageIdRef.current,
        setCurrentMessageId: (id) => {
          currentMessageIdRef.current = id;
        },
        sendMessage,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within ChatProvider");
  }
  return context;
}

