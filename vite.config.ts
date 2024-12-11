import { defineConfig } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [nodePolyfills(), react()],
  build: {
    target: "es2022", // Target a modern environment that supports top-level await
  },
  optimizeDeps: {
    exclude: ["@demox-labs/miden-sdk"],
  },
});
