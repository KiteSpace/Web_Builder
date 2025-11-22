import { useState } from "react";
import { ProjectProvider } from "./context/ProjectContext";
import { ChatProvider } from "./context/ChatContext";
import ChatPanel from "./components/ChatPanel/ChatPanel";
import PreviewFrame from "./components/Preview/PreviewFrame";
import DevView from "./pages/DevView";
import "./styles/globals.css";

export default function App() {
  const [tab, setTab] = useState<"chat" | "dev">("chat");

  return (
    <ProjectProvider>
      <ChatProvider>
        <div className="h-screen flex flex-col">
        {/* Top Navigation */}
        <div className="h-10 border-b flex items-center px-4 gap-6 bg-[#0e0e15] text-gray-200">
          <button
            onClick={() => setTab("chat")}
            className={`${
              tab === "chat" ? "font-semibold text-white" : "text-gray-400"
            }`}
          >
            Build
          </button>

          <button
            onClick={() => setTab("dev")}
            className={`${
              tab === "dev" ? "font-semibold text-white" : "text-gray-400"
            }`}
          >
            Dev
          </button>
        </div>

        {/* Main Layout */}
        <div className="flex flex-1 overflow-hidden">
          {/* Build (Chat) Mode */}
          {tab === "chat" && (
            <>
              {/* Chat side */}
              <div className="w-[340px] border-r border-gray-800 bg-[#0d0d14]">
                <ChatPanel />
              </div>

              {/* Preview side */}
              <div className="flex-1 bg-[#0c0c12]">
                <PreviewFrame />
              </div>
            </>
          )}

          {/* Dev Mode */}
          {tab === "dev" && <DevView />}
        </div>
      </div>
      </ChatProvider>
    </ProjectProvider>
  );
}
