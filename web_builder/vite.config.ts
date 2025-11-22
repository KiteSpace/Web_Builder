import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default {
  plugins: [
    {
      name: "virtual-module-server",
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (!req.url.startsWith("/__virtual__/")) return next();

          const fsPath = req.url.replace("/__virtual__", "");
          const file = globalThis.__VIRTUAL_FS?.[fsPath];

          if (!file) {
            res.statusCode = 404;
            return res.end("Not found");
          }

          res.setHeader("Content-Type", "application/javascript");
          res.end(file);
        });
      },
    },
  ],
};

