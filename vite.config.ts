import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  root: path.resolve(__dirname, "studio"),
  plugins: [react()],
  resolve: {
    alias: {
      "@comps": path.resolve(__dirname, "src/compositions"),
      "@utils": path.resolve(__dirname, "src/utils"),
      "@data":  path.resolve(__dirname, "src/data"),
      // Pin React to a single physical path so @remotion/player and the app
      // share exactly the same module instance (fixes the Context.Provider crash)
      "react":        path.resolve(__dirname, "node_modules/react"),
      "react-dom":    path.resolve(__dirname, "node_modules/react-dom"),
      "react/jsx-runtime": path.resolve(__dirname, "node_modules/react/jsx-runtime"),
    },
    dedupe: ["react", "react-dom", "remotion", "@remotion/player"],
  },
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "remotion",
      "@remotion/media-utils",
    ],
    // Excluding the player from pre-bundling prevents esbuild from inlining
    // a second copy of React inside the player chunk — the main cause of the
    // "Cannot read properties of undefined (reading 'Provider')" crash.
    exclude: ["@remotion/player"],
  },
  server: {
    port: 3001,
    proxy: {
      "/api": {
        target: "http://localhost:3002",
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api/, ""),
      },
    },
  },
  // Serve the project's public/ folder (audio files, images, etc.)
  publicDir: path.resolve(__dirname, "public"),
  build: {
    outDir: path.resolve(__dirname, "studio/dist"),
    emptyOutDir: true,
  },
});
