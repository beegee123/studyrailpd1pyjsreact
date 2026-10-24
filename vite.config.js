import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Fixed port so PD1 Hub links work locally (see src/pd1hub.js).
  server: { port: 5174, strictPort: true },
});
