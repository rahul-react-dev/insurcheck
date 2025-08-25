import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    allowedHosts: [
      '6e9b2d76-9443-4b59-a8a6-fa1af7c6d252-00-2yj1ojsu1e06t.riker.replit.dev'
    ],
    host: "0.0.0.0",
   
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
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
