import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@assets": path.resolve(__dirname, "./attached_assets"),
    },
  },
  server: {
    port: 3001,
    host: "0.0.0.0",
    allowedHosts: [
      "ebcfcb6d-a885-4385-8cca-9bccc32ba267-00-23atzs88dn1h1.worf.replit.devthis",
      "dev-user.insurcheck.ai",
    ],
    cors: {
      origin: [
        "https://ebcfcb6d-a885-4385-8cca-9bccc32ba267-00-23atzs88dn1h1.worf.replit.dev:3000",
        "https://ebcfcb6d-a885-4385-8cca-9bccc32ba267-00-23atzs88dn1h1.worf.replit.dev:3001",
      ],
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: [
        "Content-Type",
        "Authorization",
        "X-Requested-With",
        "Accept",
        "Origin",
      ],
    },
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
  },
  build: {
    outDir: "dist",
  },
});
