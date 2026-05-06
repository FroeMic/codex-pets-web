import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? "/codex-pets-web/" : "/",
  plugins: [react()],
  resolve: {
    alias: {
      "codex-pet-web": new URL("../../packages/core/src/index.ts", import.meta.url)
        .pathname,
      "codex-pet-web-react": new URL("../../packages/react/src/index.ts", import.meta.url)
        .pathname
    }
  }
});
