import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    // Help resolve modules from root node_modules
    dedupe: ["react", "react-dom"],
  },
  optimizeDeps: {
    // Pre-bundle Stripe dependencies
    include: ["@stripe/stripe-js", "@stripe/react-stripe-js"],
  },
  server: {
    port: 3000,
    allowedHosts: [
      "ebcfcb6d-a885-4385-8cca-9bccc32ba267-00-23atzs88dn1h1.worf.replit.dev",
      "dev-admin.insurcheck.ai",
    ],
    host: "0.0.0.0",
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
    fs: {
      // Allow serving files from one level up to access root node_modules
      allow: [".."],
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
