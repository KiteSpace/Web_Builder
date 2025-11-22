import type { FileAction, ActionBlock } from "./types";
import { logger } from "./logger";

export function extractJsonActions(text: string): FileAction[] {
  const actions: FileAction[] = [];

  // Look for JSON code blocks
  const jsonBlockRegex = /```json\s*([\s\S]*?)```/g;
  const matches = Array.from(text.matchAll(jsonBlockRegex));

  for (const match of matches) {
    try {
      const jsonText = match[1].trim();
      const parsed: ActionBlock = JSON.parse(jsonText);

      if (parsed.actions && Array.isArray(parsed.actions)) {
        for (const action of parsed.actions) {
          if (
            action.type &&
            (action.type === "createFile" ||
              action.type === "updateFile" ||
              action.type === "deleteFile")
          ) {
            if (action.type === "deleteFile") {
              if (typeof action.path === "string") {
                actions.push({ type: "deleteFile", path: action.path });
              }
            } else {
              if (
                typeof action.path === "string" &&
                typeof action.content === "string"
              ) {
                actions.push({
                  type: action.type,
                  path: action.path,
                  content: action.content,
                });
              }
            }
          }
        }
      }
    } catch (error) {
      logger.warn("Failed to parse JSON action block", error);
    }
  }

  // Also try to find JSON without code fences (fallback)
  if (actions.length === 0) {
    try {
      const jsonMatch = text.match(/\{[\s\S]*"actions"[\s\S]*\}/);
      if (jsonMatch) {
        const parsed: ActionBlock = JSON.parse(jsonMatch[0]);
        if (parsed.actions && Array.isArray(parsed.actions)) {
          for (const action of parsed.actions) {
            if (
              action.type &&
              (action.type === "createFile" ||
                action.type === "updateFile" ||
                action.type === "deleteFile")
            ) {
              if (action.type === "deleteFile") {
                if (typeof action.path === "string") {
                  actions.push({ type: "deleteFile", path: action.path });
                }
              } else {
                if (
                  typeof action.path === "string" &&
                  typeof action.content === "string"
                ) {
                  actions.push({
                    type: action.type,
                    path: action.path,
                    content: action.content,
                  });
                }
              }
            }
          }
        }
      }
    } catch (error) {
      logger.debug("No valid JSON actions found in response");
    }
  }

  return actions;
}
