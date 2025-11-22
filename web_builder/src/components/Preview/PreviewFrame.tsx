import React, { useEffect, useRef, useState } from "react";
import { useProject } from "../../context/ProjectContext";
import EmptyPreviewScreen from "./EmptyPreviewScreen";

export default function PreviewFrame() {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const workerRef = useRef<Worker | null>(null);

  const { project } = useProject();

  const isEmptyProject =
    project.files.length === 0 ||
    (project.files.length === 1 &&
      project.files[0].path === "/src/App.tsx" &&
      project.files[0].content.includes("Empty Project"));

  const files = project.files.reduce((acc, f) => {
    acc[f.path.startsWith("/") ? f.path : "/" + f.path] = f.content;
    return acc;
  }, {} as Record<string, string>);

  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "building" | "ready" | "error">("idle");

  /** ---------------- Worker Init ---------------- */
  useEffect(() => {
    if (workerRef.current) return;

    console.log("[Preview] Creating bundler worker...");

    workerRef.current = new Worker(
      new URL("../../preview/bundler.worker.ts", import.meta.url),
      { type: "module" }
    );

    workerRef.current.onmessage = (e) => {
      console.log("[Preview] Worker message:", e.data);

      if (e.data.type === "built") {
        setStatus("ready");
        setError(null);
        injectHTML(e.data.html);
      }

      if (e.data.type === "error") {
        setStatus("error");
        setError(e.data.error);
        injectError(e.data.error);
      }
    };

    workerRef.current.onerror = (err) => {
      console.error("[Preview] Worker crashed:", err);
      setStatus("error");
      injectError("Worker crashed");
    };
  }, []);

  /** ---------------- Rebuild on file changes ---------------- */
  useEffect(() => {
    if (!workerRef.current || isEmptyProject) return;

    console.log("[Preview] Sending build request:", project.files);

    setStatus("building");
    workerRef.current.postMessage({
      type: "build",
      entry: "/src/App.tsx",
      files
    });
  }, [JSON.stringify(files), isEmptyProject]);

  /** ---------------- Helpers ---------------- */
  function injectHTML(html: string) {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const doc = iframe.contentDocument;
    if (!doc) {
      console.error("[Preview] Cannot inject — iframe doc is null");
      return;
    }

    doc.open();
    doc.write(html);
    doc.close();
  }

  function injectError(msg: string) {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const doc = iframe.contentDocument;
    if (!doc) return;

    doc.open();
    doc.write(`
      <html>
        <body style="background:#200;color:#faa;padding:20px;">
          <h2>Build Error</h2>
          <pre>${msg}</pre>
        </body>
      </html>
    `);
    doc.close();
  }

  /** ---------------- UI ---------------- */
  if (isEmptyProject) return <EmptyPreviewScreen />;

  return (
    <div className="w-full h-full bg-[#0d0d14] relative">
      {status === "building" && (
        <div className="absolute top-2 left-2 bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded text-xs">
          Building…
        </div>
      )}
      {status === "error" && (
        <div className="absolute top-2 left-2 bg-red-500/20 text-red-300 px-3 py-1 rounded text-xs">
          {error}
        </div>
      )}

      <iframe
        ref={iframeRef}
        sandbox="allow-scripts"
        className="w-full h-full bg-white"
        srcDoc="<html><body></body></html>"
      />
    </div>
  );
}
