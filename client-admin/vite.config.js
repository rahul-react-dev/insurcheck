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
      'efc5f8a8-7a9b-4dac-b22d-5709bedba5bb-00-p710mz2xhu7m.janeway.replit.dev'
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
