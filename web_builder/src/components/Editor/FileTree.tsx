import React, { useState } from "react";
import { useProject } from "../../context/ProjectContext";

interface FileTreeProps {
  onFileSelect?: (path: string) => void;
  selectedFile?: string;
}

const FileTree: React.FC<FileTreeProps> = ({ onFileSelect, selectedFile }) => {
  const { project } = useProject();
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set(["src"]));

  const toggleDir = (dir: string) => {
    setExpandedDirs((prev) => {
      const next = new Set(prev);
      if (next.has(dir)) {
        next.delete(dir);
      } else {
        next.add(dir);
      }
      return next;
    });
  };

  // Organize files into a tree structure
  const buildTree = () => {
    const tree: Record<string, any> = {};

    project.files.forEach((file) => {
      const parts = file.path.split("/");
      let current = tree;

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        const isLast = i === parts.length - 1;

        if (isLast) {
          current[part] = { type: "file", path: file.path };
        } else {
          if (!current[part]) {
            current[part] = { type: "dir", children: {} };
          }
          current = current[part].children;
        }
      }
    });

    return tree;
  };

  const renderTree = (node: any, path = "", depth = 0): React.ReactNode[] => {
    const items: React.ReactNode[] = [];
    const entries = Object.entries(node).sort(([a], [b]) => {
      const aIsDir = node[a].type === "dir";
      const bIsDir = node[b].type === "dir";
      if (aIsDir && !bIsDir) return -1;
      if (!aIsDir && bIsDir) return 1;
      return a.localeCompare(b);
    });

    entries.forEach(([name, item]: [string, any]) => {
      const fullPath = path ? `${path}/${name}` : name;
      const isExpanded = expandedDirs.has(fullPath);
      const isSelected = selectedFile === item.path;

      if (item.type === "dir") {
        items.push(
          <div key={fullPath}>
            <div
              className={`flex items-center px-2 py-1 hover:bg-gray-800/50 cursor-pointer text-xs ${
                depth === 0 ? "font-medium" : ""
              }`}
              style={{ paddingLeft: `${8 + depth * 12}px` }}
              onClick={() => toggleDir(fullPath)}
            >
              <span className="mr-1 text-gray-500">
                {isExpanded ? "📂" : "📁"}
              </span>
              <span className="text-gray-300">{name}</span>
            </div>
            {isExpanded && item.children && (
              <div>{renderTree(item.children, fullPath, depth + 1)}</div>
            )}
          </div>
        );
      } else {
        items.push(
          <div
            key={item.path}
            className={`flex items-center px-2 py-1 hover:bg-gray-800/50 cursor-pointer text-xs ${
              isSelected ? "bg-blue-600/20 border-l-2 border-blue-500" : ""
            }`}
            style={{ paddingLeft: `${8 + depth * 12}px` }}
            onClick={() => onFileSelect?.(item.path)}
          >
            <span className="mr-1 text-gray-500">📄</span>
            <span className={`${isSelected ? "text-blue-400" : "text-gray-300"}`}>
              {name}
            </span>
          </div>
        );
      }
    });

    return items;
  };

  const tree = buildTree();

  return (
    <section className="h-full flex flex-col">
      <div className="px-3 py-2 border-b border-slate-800">
        <h2 className="text-xs font-semibold tracking-wide text-slate-300 uppercase">
          Files
        </h2>
      </div>
      <div className="flex-1 overflow-auto text-[11px]">
        {project.files.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-500 px-2 text-center">
            No files in project
          </div>
        ) : (
          <div>{renderTree(tree)}</div>
        )}
      </div>
    </section>
  );
};

export default FileTree;
