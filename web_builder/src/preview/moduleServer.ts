import { FileMap } from "./types";
import { transformModule } from "./transform";

const importRegex =
  /import\s+(?:[\w*\s{},]+from\s*)?["']([^"']+)["'];?/g;

function resolvePath(base: string, relative: string) {
  const baseParts = base.split("/").slice(0, -1);
  const relParts = relative.split("/");

  for (const seg of relParts) {
    if (seg === "..") baseParts.pop();
    else if (seg !== ".") baseParts.push(seg);
  }

  return "/" + baseParts.join("/");
}

export function bundleApp(entry: string, files: FileMap): string {
  const visited = new Set<string>();
  const outputChunks: string[] = [];

  function walk(modulePath: string) {
    if (visited.has(modulePath)) return;
    visited.add(modulePath);

    const code = files[modulePath];
    if (!code) throw new Error(`Missing file: ${modulePath}`);

    const deps: string[] = [];
    let match;

    while ((match = importRegex.exec(code))) {
      const raw = match[1];
      if (raw.startsWith(".")) {
        const resolved = resolvePath(modulePath, raw);
        deps.push(resolved);
        walk(resolved);
      }
    }

    const transformed = transformModule(modulePath, code);

    outputChunks.push(
      `// ---- MODULE: ${modulePath} ----\n` +
      `const module_${btoa(modulePath).replace(/=/g, "")} = (function(){\n${transformed}\n})();\n`
    );
  }

  walk(entry);

  return outputChunks.join("\n");
}

export function buildHTML(entry: string, files: FileMap): string {
  const js = bundleApp(entry, files);

  return `
    <html>
      <head>
        <style>
          body { margin: 0; padding: 0; font-family: sans-serif; }
        </style>
      </head>
      <body>
        <div id="root"></div>
        <script type="module">
          ${js}
        </script>
      </body>
    </html>
  `;
}
