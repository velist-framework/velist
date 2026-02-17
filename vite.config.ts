import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { writeFileSync, rmSync } from 'fs'

export default defineConfig({
  plugins: [
    tailwindcss(),
    svelte(),
    {
      name: 'write-port',
      configureServer(server) {
        server.httpServer?.on('listening', () => {
          const address = server.httpServer?.address()
          if (typeof address === 'object' && address) {
            const port = address.port
            const url = `http://localhost:${port}`
            writeFileSync('.vite-port', url)
            console.log(`[vite-plugin] Port written to .vite-port: ${url}`)
          }
        })
        // Cleanup on exit
        const cleanup = () => {
          try { rmSync('.vite-port') } catch {}
          process.exit()
        }
        process.on('SIGINT', cleanup)
        process.on('SIGTERM', cleanup)
      }
    }
  ],
  
  server: {
    strictPort: false, // Auto-find available port if 5173 is taken
    port: 5173
  },
  
  resolve: {
    alias: {
      $features: path.resolve(__dirname, './src/features'),
      $shared: path.resolve(__dirname, './src/shared'),
      $inertia: path.resolve(__dirname, './src/inertia')
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
