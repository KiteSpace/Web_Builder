import React, { useState } from "react";

export default function BuilderPanel() {
  const [activeTab, setActiveTab] = useState<"components" | "layout">("components");

  return (
    <div className="h-full flex flex-col bg-white border-l">
      {/* Header */}
      <div className="h-10 px-3 border-b flex items-center justify-between">
        <h2 className="font-medium text-sm">Builder</h2>

        {/* Top-level internal tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("components")}
            className={`text-xs px-2 py-1 rounded ${
              activeTab === "components" ? "bg-gray-200 font-medium" : "hover:bg-gray-100"
            }`}
          >
            Components
          </button>

          <button
            onClick={() => setActiveTab("layout")}
            className={`text-xs px-2 py-1 rounded ${
              activeTab === "layout" ? "bg-gray-200 font-medium" : "hover:bg-gray-100"
            }`}
          >
            Layout
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-3 text-sm">
        {activeTab === "components" && (
          <div className="space-y-2">
            <div className="font-semibold text-gray-700 text-xs uppercase">Basic</div>
            <div className="grid grid-cols-2 gap-2">
              <button className="p-2 border rounded hover:bg-gray-100">Button</button>
              <button className="p-2 border rounded hover:bg-gray-100">Card</button>
              <button className="p-2 border rounded hover:bg-gray-100">Input</button>
              <button className="p-2 border rounded hover:bg-gray-100">Section</button>
            </div>

            <div className="font-semibold text-gray-700 text-xs uppercase pt-4">Advanced</div>
            <div className="grid grid-cols-2 gap-2">
              <button className="p-2 border rounded hover:bg-gray-100">Hero</button>
              <button className="p-2 border rounded hover:bg-gray-100">Feature Grid</button>
              <button className="p-2 border rounded hover:bg-gray-100">Footer</button>
              <button className="p-2 border rounded hover:bg-gray-100">CTA Block</button>
            </div>
          </div>
        )}

        {activeTab === "layout" && (
          <div className="space-y-4">
            <div className="font-semibold text-gray-700 text-xs uppercase">Layout Patterns</div>

            <button className="w-full p-3 border rounded hover:bg-gray-100 text-left">
              1-Column Layout
            </button>

            <button className="w-full p-3 border rounded hover:bg-gray-100 text-left">
              2-Column Layout
            </button>

            <button className="w-full p-3 border rounded hover:bg-gray-100 text-left">
              Hero + Sections
            </button>

            <button className="w-full p-3 border rounded hover:bg-gray-100 text-left">
              Marketing Landing Page
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

