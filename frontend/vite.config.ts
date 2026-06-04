import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // Explicit build output so monorepo + Vercel both know where the bundle lives.
  // `outDir` is relative to this file (frontend/), so the final path is
  // `frontend/dist` — paired with `outputDirectory` in vercel.json.
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  preview: {
    port: 21120,
  },
  server: {
    port: 21120,
    allowedHosts: ['host.docker.internal'],
    proxy: {
      '/api': {
        target: 'http://localhost:21121',
        changeOrigin: true,
      },
    },
  },
})
