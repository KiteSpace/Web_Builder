import React, { useEffect, useRef } from "react";
import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { basicSetup } from "codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { oneDark } from "@codemirror/theme-one-dark";
import { useProject } from "../../context/ProjectContext";

interface CodeEditorProps {
  filePath?: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ filePath }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const { getFile, updateFile } = useProject();
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize or update editor when filePath changes
  useEffect(() => {
    if (!editorRef.current) return;

    const file = filePath ? getFile(filePath) : null;
    if (!file) {
      // Clear editor if no file
      if (viewRef.current) {
        viewRef.current.destroy();
        viewRef.current = null;
      }
      return;
    }

    // If editor doesn't exist, create it
    if (!viewRef.current) {
      const startState = EditorState.create({
        doc: file.content,
        extensions: [
          basicSetup,
          javascript({ jsx: true, typescript: true }),
          oneDark,
          EditorView.updateListener.of((update) => {
            if (update.docChanged && file) {
              // Clear existing timeout
              if (updateTimeoutRef.current) {
                clearTimeout(updateTimeoutRef.current);
              }
              // Debounce updates
              updateTimeoutRef.current = setTimeout(() => {
                const newContent = update.state.doc.toString();
                updateFile(file.path, newContent);
              }, 500);
            }
          }),
        ],
      });

      const view = new EditorView({
        state: startState,
        parent: editorRef.current,
      });

      viewRef.current = view;
    } else {
      // Editor exists, update content if it changed
      const currentContent = viewRef.current.state.doc.toString();
      if (currentContent !== file.content) {
        const transaction = viewRef.current.state.update({
          changes: {
            from: 0,
            to: viewRef.current.state.doc.length,
            insert: file.content,
          },
        });
        viewRef.current.dispatch(transaction);
      }
    }

    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, [filePath, getFile, updateFile]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (viewRef.current) {
        viewRef.current.destroy();
        viewRef.current = null;
      }
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

  const file = filePath ? getFile(filePath) : null;

  return (
    <section className="h-full flex flex-col bg-[#0d0d12]">
      <div className="px-3 py-2 border-b border-slate-800 flex items-center justify-between">
        <h2 className="text-xs font-semibold tracking-wide text-slate-300 uppercase">
          Code
        </h2>
        {filePath && (
          <span className="text-[10px] text-slate-500">{filePath}</span>
        )}
      </div>
      <div className="flex-1 overflow-hidden">
        {!filePath || !file ? (
          <div className="flex items-center justify-center h-full text-slate-500 text-xs">
            {filePath ? "File not found" : "Select a file to edit"}
          </div>
        ) : (
          <div ref={editorRef} className="h-full" />
        )}
      </div>
    </section>
  );
};

export default CodeEditor;
