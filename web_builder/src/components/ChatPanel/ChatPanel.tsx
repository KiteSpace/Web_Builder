import { useEffect, useRef } from "react";
import { useChat } from "../../context/ChatContext";
import ChatMessage from "./ChatMessage";

export default function ChatPanel() {
  const {
    messages,
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
    sendMessage,
  } = useChat();
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleApiKeySubmit = () => {
    if (apiKeyInput.trim()) {
      setApiKey(apiKeyInput.trim());
      setShowApiKeyPrompt(false);
      setApiKeyInput("");
      // Remove API key prompt message
      // This will be handled by the context
    }
  };

  const send = async () => {
    await sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#0d0d14] text-gray-200">
      {/* Header */}
      <div className="h-10 px-3 border-b border-gray-800 flex items-center">
        <h2 className="font-medium text-sm">Builder</h2>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-3 py-2 space-y-3 text-xs"
      >
        {messages.map((msg) => (
          <ChatMessage
            key={msg.id}
            message={msg}
            mode={mode}
            isApiKeyPrompt={msg.id === "api-key-prompt"}
            onApiKeySubmit={handleApiKeySubmit}
            apiKeyInput={apiKeyInput}
            setApiKeyInput={setApiKeyInput}
          />
        ))}
      </div>

      {/* Input */}
      <div className="border-t border-gray-800 px-2 py-2">
        {showApiKeyPrompt ? (
          <div className="flex gap-2">
            <input
              type="password"
              className="flex-1 bg-[#13131d] border border-gray-700 rounded-md px-2 py-1 text-xs text-gray-100 outline-none focus:border-blue-500"
              placeholder="Enter OpenAI API key..."
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleApiKeySubmit();
                }
              }}
            />
            <button
              onClick={handleApiKeySubmit}
              disabled={!apiKeyInput.trim()}
              className="px-3 py-1 text-xs rounded-md bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Save
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as "chat" | "builder")}
              className="bg-[#13131d] border border-gray-700 rounded-md px-2 py-1 text-xs text-gray-100 outline-none focus:border-blue-500"
            >
              <option value="builder">Builder</option>
              <option value="chat">Chat</option>
            </select>
            <input
              className="flex-1 bg-[#13131d] border border-gray-700 rounded-md px-2 py-1 text-xs text-gray-100 outline-none focus:border-blue-500"
              placeholder={
                mode === "builder"
                  ? "Describe what you want to build…"
                  : "Ask a question…"
              }
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
            />
            <button
              onClick={send}
              disabled={!input.trim() || isLoading}
              className="px-3 py-1 text-xs rounded-md bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isLoading ? "..." : "Send"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
