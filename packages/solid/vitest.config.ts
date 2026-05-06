import { defineConfig } from "vitest/config";
import solid from "vite-plugin-solid";

export default defineConfig({
  plugins: [solid()],
  resolve: {
    conditions: ["browser"],
    alias: {
      "codex-pet-web": new URL("../core/src/index.ts", import.meta.url)
        .pathname
    }
  },
  test: {
    environment: "happy-dom",
    globals: true
  }
});
