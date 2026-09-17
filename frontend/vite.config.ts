import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";
import path from "path";

export default defineConfig({
  base: "/price-tracker/",

  plugins: [
    react(),

    {
      name: "serve-price-history",

      configureServer(server) {
        server.middlewares.use(
          "/price-tracker/data/price_history.json",
          (_req, res) => {
            const filePath = path.resolve(
              __dirname,
              "../data/price_history.json"
            );

            try {
              const data = fs.readFileSync(filePath, "utf-8");

              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.end(data);
            } catch {
              res.statusCode = 404;
              res.end("Price history not found");
            }
          }
        );
      },
    },
  ],
});