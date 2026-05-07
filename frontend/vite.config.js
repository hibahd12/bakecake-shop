import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite config for BakeCake React frontend
// Proxies /api requests to Laravel backend during development
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Forward all /api/* requests to Laravel
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      // Forward sanctum requests for CSRF auth
      '/sanctum': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      // Forward /storage/* to Laravel's public disk (uploaded images, etc.)
      '/storage': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
