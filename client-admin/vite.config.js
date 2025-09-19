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
      'efc5f8a8-7a9b-4dac-b22d-5709bedba5bb-00-p710mz2xhu7m.janeway.replit.dev',
      'dev-admin.insurcheck.ai'
    ],
    host: "0.0.0.0",
    cors: {
      origin: [
        'https://ebcfcb6d-a885-4385-8cca-9bccc32ba267-00-23atzs88dn1h1.worf.replit.dev:3000',
        'https://ebcfcb6d-a885-4385-8cca-9bccc32ba267-00-23atzs88dn1h1.worf.replit.dev:3001'
      ],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
    },
    fs: {
      // Allow serving files from one level up to access root node_modules
      allow: ['..'],
    },
    proxy: {
      '/api': {
        target: process.env.REPLIT_DEV_DOMAIN ? 'http://0.0.0.0:5000' : 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        ws: true,
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('[PROXY] Forwarding request:', req.method, req.url, '-> target:', options.target);
          });
          proxy.on('error', (err, req, res) => {
            console.error('[PROXY] Error:', err.message);
          });
        },
      },
    },
  },
  build: {
    outDir: "dist",
  },
});
