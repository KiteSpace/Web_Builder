import type { FileAction, ProjectState } from "./types";
import { logger } from "./logger";

export function applyActionsToProject(
  project: ProjectState,
  actions: FileAction[]
): ProjectState {
  const newFiles = [...project.files];
  const fileMap = new Map<string, number>();
  newFiles.forEach((file, index) => {
    fileMap.set(file.path, index);
  });

  for (const action of actions) {
    logger.debug(`Applying action: ${action.type} ${action.path}`);

    switch (action.type) {
      case "createFile": {
        if (fileMap.has(action.path)) {
          logger.warn(`File ${action.path} already exists, updating instead`);
          const index = fileMap.get(action.path)!;
          newFiles[index] = { path: action.path, content: action.content };
        } else {
          newFiles.push({ path: action.path, content: action.content });
          fileMap.set(action.path, newFiles.length - 1);
        }
        break;
      }

      case "updateFile": {
        if (fileMap.has(action.path)) {
          const index = fileMap.get(action.path)!;
          newFiles[index] = { path: action.path, content: action.content };
        } else {
          logger.warn(`File ${action.path} does not exist, creating instead`);
          newFiles.push({ path: action.path, content: action.content });
          fileMap.set(action.path, newFiles.length - 1);
        }
        break;
      }

      case "deleteFile": {
        if (fileMap.has(action.path)) {
          const index = fileMap.get(action.path)!;
          newFiles.splice(index, 1);
          fileMap.delete(action.path);
          // Rebuild map after deletion
          fileMap.clear();
          newFiles.forEach((file, idx) => {
            fileMap.set(file.path, idx);
          });
        } else {
          logger.warn(`File ${action.path} does not exist, skipping deletion`);
        }
        break;
      }
    }
  }

  return { files: newFiles };
}
