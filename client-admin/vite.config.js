import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: '0.0.0.0',
    allowedHosts: ['4714f73d-e452-465c-a879-41dfeee32c0d-00-3hj62dyd2avsv.janeway.replit.dev']
  },
  build: {
    outDir: 'dist'
  }
})
