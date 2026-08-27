import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiPort = env.VITE_API_PORT || "8000";

  return {
    plugins: [react(), tailwindcss()],
    server: {
      port: 5175,
      host: true,
      allowedHosts: ["marseille-dashboard.92-4-217-42.sslip.io"],
      proxy: { "/api": { target: `http://localhost:${apiPort}`, rewrite: (p) => p.replace(/^\/api/, "") } },
    },
  };
});
