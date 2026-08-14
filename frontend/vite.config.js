import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],

  // Expose all VITE_* variables to the app at build time
  envPrefix: 'VITE_',

  server: {
    // In dev, proxy /api/* to the local backend — no CORS needed
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },

  build: {
    // Warn if any single chunk exceeds 600kb
    chunkSizeWarningLimit: 600,
  },
})
