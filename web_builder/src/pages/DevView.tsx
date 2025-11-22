import { useState } from "react";
import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
} from "react-resizable-panels";

import CodeEditor from "../components/Editor/CodeEditor";
import ConsolePanel from "../components/Editor/ConsolePanel";
import FileTree from "../components/Editor/FileTree";
import PreviewFrame from "../components/Preview/PreviewFrame";

export default function DevView() {
  const [previewCollapsed, setPreviewCollapsed] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | undefined>();

  return (
    <div className="h-full w-full overflow-hidden bg-[#0d0d12] text-gray-200">

      <PanelGroup direction="horizontal">

        {/* LEFT — FILE TREE PANEL */}
        <Panel defaultSize={20} minSize={10}>
          <div className="h-full border-r border-gray-800 bg-[#11111a] overflow-auto">
            <FileTree onFileSelect={setSelectedFile} selectedFile={selectedFile} />
          </div>
        </Panel>

        <PanelResizeHandle className="w-1 bg-gray-800 hover:bg-gray-600 transition" />

        {/* CENTER — EDITOR + CONSOLE vertically stacked */}
        <Panel minSize={40}>
          <PanelGroup direction="vertical">

            {/* EDITOR */}
            <Panel defaultSize={70} minSize={30}>
              <div className="h-full border-b border-gray-800 overflow-hidden">
                <CodeEditor filePath={selectedFile} />
              </div>
            </Panel>

            <PanelResizeHandle className="h-1 bg-gray-800 hover:bg-gray-600 transition" />

            {/* CONSOLE */}
            <Panel defaultSize={30} minSize={15}>
              <div className="h-full border-b border-gray-800 overflow-auto">
                <ConsolePanel />
              </div>
            </Panel>
          </PanelGroup>
        </Panel>

        {/* Only show handle if preview isn't collapsed */}
        {!previewCollapsed && (
          <PanelResizeHandle className="w-1 bg-gray-800 hover:bg-gray-600 transition" />
        )}

        {/* RIGHT — PREVIEW (COLLAPSIBLE) */}
        {!previewCollapsed && (
          <Panel defaultSize={30} minSize={20}>
            <div className="relative h-full bg-[#0f0f18] overflow-hidden">

              {/* Collapse button */}
              <button
                onClick={() => setPreviewCollapsed(true)}
                className="absolute top-2 right-2 z-10 px-2 py-1 text-xs bg-gray-800 hover:bg-gray-700 rounded"
              >
                Collapse
              </button>

              <PreviewFrame />
            </div>
          </Panel>
        )}

      </PanelGroup>

      {/* Restore Preview Button (when collapsed) */}
      {previewCollapsed && (
        <button
          onClick={() => setPreviewCollapsed(false)}
          className="absolute bottom-4 right-4 px-3 py-2 text-sm bg-blue-600 hover:bg-blue-500 rounded shadow"
        >
          Show Preview
        </button>
      )}
    </div>
  );
}
