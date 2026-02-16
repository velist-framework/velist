import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [
    tailwindcss(),
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
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        app: './src/inertia/app.ts',
        styles: './src/styles/app.css'
      },
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]'
      }
    }
  }
})
