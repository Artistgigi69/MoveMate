import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// /api is proxied to the existing Express backend so the app needs no
// VITE_API_URL in dev. Set VITE_API_URL for production builds.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        rewrite: path => path.replace(/^\/api/, '')
      }
    }
  }
})
