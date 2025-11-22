import { buildHTML } from "./moduleServer";
import type { WorkerMessage, BuildRequest } from "./types";

console.log("[Worker] JS bundler worker loaded");

self.onmessage = (event: MessageEvent<WorkerMessage>) => {
  const msg = event.data;

  if (msg.type !== "build") return;

  try {
    console.log("[Worker] Building bundle...");
    const html = buildHTML(msg.entry, msg.files);

    (self as any).postMessage({
      type: "built",
      html
    });
  } catch (err: any) {
    console.error("[Worker] Error:", err);
    (self as any).postMessage({
      type: "error",
      error: err?.message || "Unknown error"
    });
  }
};
