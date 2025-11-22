export default function BuilderTab() {
  return (
    <div className="flex flex-col h-full bg-[#101019] text-xs text-gray-200">
      <div className="px-3 py-2 border-b border-gray-800 text-[11px] uppercase tracking-wide text-gray-400">
        Builder
      </div>

      <div className="flex-1 overflow-auto px-3 py-3 space-y-3">
        <p className="text-gray-400">
          This panel will become the structured builder surface for:
        </p>

        <ul className="list-disc list-inside space-y-1 text-gray-300">
          <li>Reviewing the components the AI plans to create</li>
          <li>Adjusting layout, theming, and hierarchy</li>
          <li>Binding components to data sources</li>
          <li>Inspecting actions the AI will apply to the project</li>
        </ul>

        <p className="text-gray-500">
          For now, it’s just a placeholder description — but it’s wired into the
          layout like the Console is in Dev mode, so we can drop in the real
          builder UI later without changing the structure.
        </p>
      </div>
    </div>
  );
}
