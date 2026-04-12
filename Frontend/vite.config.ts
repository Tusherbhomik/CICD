import react from "@vitejs/plugin-react-swc";
import { componentTagger } from "lovable-tagger";
import path from "path";

import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8081,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(
    Boolean
  ),
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: "globalThis", // ✅ Fix for 'global is not defined'
      },
    },
  },

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Add Vitest configuration

  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    css: true,
    // Define test environment variables
    env: {
      NODE_ENV: "test",
      VITE_API_BASE_URL: "http://localhost:8080",
    },
  },
}));
