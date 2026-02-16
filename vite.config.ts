import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import path from 'path'

export default defineConfig({
  plugins: [
    svelte()
  ],
  
  resolve: {
    alias: {
      $features: path.resolve(__dirname, './src/features'),
      $shared: path.resolve(__dirname, './src/shared'),
      $inertia: path.resolve(__dirname, './src/inertia')
    }
  },
  
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/auth': 'http://localhost:3000',
      '/api': 'http://localhost:3000',
      '/dashboard': 'http://localhost:3000'
    }
  },
  
  build: {
    manifest: true,
    outDir: 'dist',
    rollupOptions: {
      input: './src/inertia/app.ts'
    }
  }
})
