import { useEffect, useRef, useState } from "react";

export default function ChatTab() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; text: string }[]
  >([
    {
      role: "assistant",
      text: "Describe what you want to build and I’ll turn it into a UI prototype.",
    },
  ]);

  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const send = () => {
    if (!input.trim()) return;

    const userMsg = { role: "user" as const, text: input.trim() };

    // placeholder assistant echo until we wire the AI
    const assistantMsg = {
      role: "assistant" as const,
      text: "Got it — I’ll eventually turn this into components once the builder is wired up.",
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Sub-header */}
      <div className="px-3 py-2 border-b border-gray-800 text-[11px] uppercase tracking-wide text-gray-400">
        Chat
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-auto px-3 py-2 space-y-2 text-xs"
      >
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-full rounded-md px-2 py-1 ${
              m.role === "user"
                ? "bg-blue-600/70 text-white self-end ml-auto"
                : "bg-gray-800/80 text-gray-100"
            }`}
          >
            {m.text}
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="border-t border-gray-800 px-2 py-2 flex gap-2">
        <input
          className="flex-1 bg-[#13131d] border border-gray-700 rounded-md px-2 py-1 text-xs text-gray-100 outline-none focus:border-blue-500"
          placeholder="Describe what you want to build…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          onClick={send}
          disabled={!input.trim()}
          className="px-3 py-1 text-xs rounded-md bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </div>
    </div>
  );
}
