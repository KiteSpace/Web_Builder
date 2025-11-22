import { createContext, useContext, useState, useCallback } from "react";
import type { FileAction } from "../ai/orchestrator/types";
import { applyActionsToProject } from "../ai/orchestrator/applyActionsToProject";
import { defaultProject } from "../defaultProject";

export type FileRecord = { path: string; content: string };
export type ProjectData = { files: FileRecord[] };

interface ProjectContextValue {
  project: ProjectData;
  setProject: (project: ProjectData) => void;
  updateFile: (path: string, content: string) => void;
  createFile: (path: string, content: string) => void;
  deleteFile: (path: string) => void;
  applyActions: (actions: FileAction[]) => void;
  getFile: (path: string) => FileRecord | undefined;
}

const ProjectContext = createContext<ProjectContextValue | null>(null);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [project, setProject] = useState<ProjectData>(defaultProject);

  const updateFile = useCallback((path: string, content: string) => {
    setProject((prev) => {
      const fileIndex = prev.files.findIndex((f) => f.path === path);
      if (fileIndex >= 0) {
        const newFiles = [...prev.files];
        newFiles[fileIndex] = { path, content };
        return { files: newFiles };
      }
      return prev;
    });
  }, []);

  const createFile = useCallback((path: string, content: string) => {
    setProject((prev) => {
      if (prev.files.some((f) => f.path === path)) {
        // File exists, update instead
        return applyActionsToProject(prev, [
          { type: "updateFile", path, content },
        ]);
      }
      return applyActionsToProject(prev, [
        { type: "createFile", path, content },
      ]);
    });
  }, []);

  const deleteFile = useCallback((path: string) => {
    setProject((prev) =>
      applyActionsToProject(prev, [{ type: "deleteFile", path }])
    );
  }, []);

  const applyActions = useCallback((actions: FileAction[]) => {
    setProject((prev) => applyActionsToProject(prev, actions));
  }, []);

  const getFile = useCallback(
    (path: string) => {
      return project.files.find((f) => f.path === path);
    },
    [project]
  );

  return (
    <ProjectContext.Provider
      value={{
        project,
        setProject,
        updateFile,
        createFile,
        deleteFile,
        applyActions,
        getFile,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error("useProject must be used within ProjectProvider");
  }
  return context;
}
