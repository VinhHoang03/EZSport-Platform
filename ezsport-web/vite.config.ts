import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    // Force a single React instance across all chunks to prevent
    // "A React Element from an older version of React was rendered" error
    dedupe: ['react', 'react-dom', 'react-router-dom'],
  },
})
