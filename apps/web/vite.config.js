import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // GitHub Pages for repo AlanRanchs/FinCypher → base path must match repo name
  base: '/FinCypher/',
  server: {
    port: 5173,
    strictPort: true
  }
})