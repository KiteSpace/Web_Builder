import { useState } from "react";
import type { FileAction } from "../../ai/orchestrator/types";

export type Message = {
  id: string;
  role: "user" | "assistant";
  text: string;
  actions?: FileAction[];
  isStreaming?: boolean;
};

interface ChatMessageProps {
  message: Message;
  mode: "chat" | "builder";
  isApiKeyPrompt?: boolean;
  onApiKeySubmit?: () => void;
  apiKeyInput?: string;
  setApiKeyInput?: (value: string) => void;
}

export default function ChatMessage({
  message,
  mode,
  isApiKeyPrompt,
  onApiKeySubmit,
  apiKeyInput,
  setApiKeyInput,
}: ChatMessageProps) {
  const [expandedActions, setExpandedActions] = useState<Set<number>>(new Set());

  const toggleAction = (index: number) => {
    setExpandedActions((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  // Extract action description (text before JSON block)
  const getActionDescription = (fullText: string, actions: FileAction[]): string => {
    if (mode === "chat") {
      // In chat mode, show full text
      return fullText;
    }

    // In builder mode, remove JSON blocks and show description
    let description = fullText;
    
    // Remove JSON code blocks
    description = description.replace(/```json\s*[\s\S]*?```/g, "");
    
    // Remove standalone JSON objects
    description = description.replace(/\{[\s\S]*"actions"[\s\S]*\}/g, "");
    
    // Clean up extra whitespace
    description = description.trim();
    
    // If no description, create one from actions
    if (!description && actions.length > 0) {
      const actionTypes = actions.map((a) => a.type);
      const uniqueTypes = [...new Set(actionTypes)];
      if (uniqueTypes.length === 1) {
        const count = actions.length;
        const type = uniqueTypes[0];
        if (type === "createFile") {
          description = `Creating ${count} file${count > 1 ? "s" : ""}`;
        } else if (type === "updateFile") {
          description = `Updating ${count} file${count > 1 ? "s" : ""}`;
        } else if (type === "deleteFile") {
          description = `Deleting ${count} file${count > 1 ? "s" : ""}`;
        } else {
          description = `Applying ${count} action${count > 1 ? "s" : ""}`;
        }
      } else {
        description = `Applying ${actions.length} changes to project`;
      }
    }
    
    return description || "Processing changes...";
  };

  if (isApiKeyPrompt) {
    return (
      <div className="max-w-full rounded-md px-3 py-2 bg-gray-800/80 text-gray-100">
        <div className="mb-2">{message.text}</div>
        <div className="flex gap-2">
          <input
            type="password"
            className="flex-1 bg-[#13131d] border border-gray-700 rounded px-2 py-1 text-xs text-gray-100 outline-none focus:border-blue-500"
            placeholder="sk-..."
            value={apiKeyInput || ""}
            onChange={(e) => setApiKeyInput?.(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onApiKeySubmit?.();
              }
            }}
          />
          <button
            onClick={onApiKeySubmit}
            disabled={!apiKeyInput?.trim()}
            className="px-3 py-1 text-xs rounded bg-blue-600 hover:bg-blue-500 disabled:opacity-40"
          >
            Save
          </button>
        </div>
      </div>
    );
  }

  const description = getActionDescription(
    message.text,
    message.actions || []
  );

  return (
    <div
      className={`max-w-full rounded-md px-3 py-2 ${
        message.role === "user"
          ? "bg-blue-600/70 text-white self-end ml-auto"
          : "bg-gray-800/80 text-gray-100"
      }`}
    >
      {/* Main message text */}
      {description && (
        <div className="whitespace-pre-wrap break-words">
          {description}
          {message.isStreaming && (
            <span className="inline-block w-2 h-4 ml-1 bg-gray-400 animate-pulse" />
          )}
        </div>
      )}

      {/* Actions in builder mode */}
      {message.role === "assistant" &&
        mode === "builder" &&
        message.actions &&
        message.actions.length > 0 && (
          <div className="mt-3 space-y-2 border-t border-gray-700/50 pt-2">
            {message.actions.map((action, index) => {
              const isExpanded = expandedActions.has(index);
              const actionLabel =
                action.type === "createFile"
                  ? `Create ${action.path}`
                  : action.type === "updateFile"
                  ? `Update ${action.path}`
                  : `Delete ${action.path}`;

              return (
                <div
                  key={index}
                  className="border border-gray-700/50 rounded text-xs"
                >
                  <button
                    onClick={() => toggleAction(index)}
                    className="w-full px-2 py-1.5 flex items-center justify-between hover:bg-gray-700/30 transition"
                  >
                    <span className="text-gray-300">{actionLabel}</span>
                    <span className="text-gray-500">
                      {isExpanded ? "−" : "+"}
                    </span>
                  </button>
                  {isExpanded && (
                    <div className="border-t border-gray-700/50 p-2 bg-[#0a0a0f]">
                      {action.type === "deleteFile" ? (
                        <div className="text-red-400 font-mono text-[10px]">
                          {action.path}
                        </div>
                      ) : action.type === "createFile" ? (
                        <div className="space-y-1">
                          <div className="text-[9px] text-green-400/70 mb-1">
                            + {action.path}
                          </div>
                          <pre className="text-[10px] text-gray-300 font-mono overflow-x-auto bg-green-900/10 border-l-2 border-green-500/30 pl-2">
                            <code>{action.content}</code>
                          </pre>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <div className="text-[9px] text-blue-400/70 mb-1">
                            ~ {action.path}
                          </div>
                          <pre className="text-[10px] text-gray-300 font-mono overflow-x-auto bg-blue-900/10 border-l-2 border-blue-500/30 pl-2">
                            <code>{action.content}</code>
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
    </div>
  );
}

