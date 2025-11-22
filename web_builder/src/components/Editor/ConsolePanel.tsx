import React, { useEffect, useState, useRef } from "react";

interface ConsoleEntry {
  id: string;
  type: "log" | "error" | "warn" | "info";
  message: string;
  timestamp: Date;
}

const ConsolePanel: React.FC = () => {
  const [entries, setEntries] = useState<ConsoleEntry[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Listen for console messages from preview iframe
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === "console") {
        setEntries((prev) => [
          ...prev,
          {
            id: `entry-${Date.now()}-${Math.random()}`,
            type: event.data.level || "log",
            message: event.data.message || JSON.stringify(event.data),
            timestamp: new Date(),
          },
        ]);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [entries]);

  const clearConsole = () => {
    setEntries([]);
  };

  const getEntryColor = (type: string) => {
    switch (type) {
      case "error":
        return "text-red-400";
      case "warn":
        return "text-yellow-400";
      case "info":
        return "text-blue-400";
      default:
        return "text-gray-300";
    }
  };

  return (
    <section className="h-full flex flex-col bg-[#0d0d12]">
      <div className="px-3 py-2 border-b border-slate-800 flex items-center justify-between">
        <h2 className="text-xs font-semibold tracking-wide text-slate-300 uppercase">
          Console
        </h2>
        {entries.length > 0 && (
          <button
            onClick={clearConsole}
            className="text-[10px] text-slate-500 hover:text-slate-300"
          >
            Clear
          </button>
        )}
      </div>
      <div
        ref={scrollRef}
        className="flex-1 overflow-auto p-2 text-[11px] font-mono space-y-1"
      >
        {entries.length === 0 ? (
          <div className="text-slate-500 text-center py-4">
            No console output yet
          </div>
        ) : (
          entries.map((entry) => (
            <div
              key={entry.id}
              className={`${getEntryColor(entry.type)} break-words`}
            >
              <span className="text-slate-500 text-[10px]">
                [{entry.timestamp.toLocaleTimeString()}]{" "}
              </span>
              <span>{entry.message}</span>
            </div>
          ))
        )}
      </div>
    </section>
  );
};

export default ConsolePanel;
