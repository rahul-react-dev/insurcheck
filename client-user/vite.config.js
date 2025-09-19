import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@assets': path.resolve(__dirname, './attached_assets'),
    },
  },
  server: {
    port: 3001,
    host: '0.0.0.0',
    allowedHosts: ['efc5f8a8-7a9b-4dac-b22d-5709bedba5bb-00-p710mz2xhu7m.janeway.replit.dev','dev-user.insurcheck.ai'],
    cors: {
      origin: [
        'https://efc5f8a8-7a9b-4dac-b22d-5709bedba5bb-00-p710mz2xhu7m.janeway.replit.dev:3000',
        'https://efc5f8a8-7a9b-4dac-b22d-5709bedba5bb-00-p710mz2xhu7m.janeway.replit.dev:3001'
      ],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
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
    outDir: 'dist'
  }
})
