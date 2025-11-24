import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import electron from 'vite-plugin-electron'
import renderer from 'vite-plugin-electron-renderer'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    electron([
      {
        entry: 'src/electron/main.ts',
        vite: {
          build: {
            outDir: 'dist-electron',
            lib: {
              entry: 'src/electron/main.ts',
              formats: ['cjs'],
              fileName: () => 'main.js'
            },
            rollupOptions: {
              external: ['electron', '@prisma/client', '.prisma/client']
            }
          }
        }
      },
      {
        entry: 'src/electron/preload.ts',
        onstart(options) {
          options.reload()
        },
        vite: {
          build: {
            outDir: 'dist-electron',
            lib: {
              entry: 'src/electron/preload.ts',
              formats: ['cjs'],
              fileName: () => 'preload.js'
            },
            rollupOptions: {
              external: ['electron']
            }
          }
        }
      }
    ]),
    renderer()
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 5173
  },
  optimizeDeps: {
    exclude: ['@prisma/client', '.prisma/client']
  }
})
