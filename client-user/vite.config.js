import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    host: '0.0.0.0',
    allowedHosts: ['efc5f8a8-7a9b-4dac-b22d-5709bedba5bb-00-p710mz2xhu7m.janeway.replit.dev']
  },
  build: {
    outDir: 'dist'
  }
})
