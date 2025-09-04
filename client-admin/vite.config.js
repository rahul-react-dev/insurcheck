import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    // Help resolve modules from root node_modules
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    // Pre-bundle Stripe dependencies
    include: ['@stripe/stripe-js', '@stripe/react-stripe-js'],
  },
  server: {
    port: 3000,
    allowedHosts: [
      '6e9b2d76-9443-4b59-a8a6-fa1af7c6d252-00-2yj1ojsu1e06t.riker.replit.dev'
    ],
    host: "0.0.0.0",
    fs: {
      // Allow serving files from one level up to access root node_modules
      allow: ['..'],
    },
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
