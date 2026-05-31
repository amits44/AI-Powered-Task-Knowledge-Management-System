import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/auth': 'http://localhost:8000',
      '/tasks': 'http://localhost:8000',
      '/documents': 'http://localhost:8000',
      '/search': 'http://localhost:8000',
      '/analytics': 'http://localhost:8000',
    }
  }
})