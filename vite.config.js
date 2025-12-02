import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    // Restrict file system - hanya allow src dan public
    fs: {
      strict: false,
      allow: ['./src', './public', './node_modules']
    }
  },
  // Build config
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: './index.html'
    }
  }
})

