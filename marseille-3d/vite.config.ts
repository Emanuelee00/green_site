import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base is passed on the CLI (--base=/green_site/) by the Pages workflow
export default defineConfig({
  plugins: [react()],
});
