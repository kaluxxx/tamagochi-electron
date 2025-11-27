import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import electron from 'vite-plugin-electron'
import renderer from 'vite-plugin-electron-renderer'
import {tanstackRouter} from '@tanstack/router-plugin/vite'
import path from 'path'

const sharedAliases = {
    '@': path.resolve(__dirname, './src'),
    '@backend': path.resolve(__dirname, './src/backend'),
    '@frontend': path.resolve(__dirname, './src/frontend'),
    '@shared': path.resolve(__dirname, './src/shared')
}

export default defineConfig({
    base: './',
    plugins: [
        tanstackRouter({
            routesDirectory: 'src/frontend/routes',
            generatedRouteTree: 'src/frontend/routeTree.gen.ts',
        }),
        react(),
        electron([
            {
                entry: 'src/backend/main.ts',
                vite: {
                    resolve: {
                        alias: sharedAliases
                    },
                    build: {
                        outDir: 'dist-electron',
                        lib: {
                            entry: 'src/backend/main.ts',
                            formats: ['cjs'],
                            fileName: () => 'main.js'
                        },
                        rollupOptions: {
                            external: (id) => {
                                if (id === 'electron') return true
                                if (id.includes('generated/prisma')) return true
                                return false
                            },
                            output: {
                                paths: (id) => {
                                    if (id.includes('generated/prisma')) {
                                        return '../src/generated/prisma'
                                    }
                                    return id
                                }
                            }
                        }
                    }
                }
            },
            {
                entry: 'src/backend/preload.ts',
                onstart(options) {
                    options.reload()
                },
                vite: {
                    resolve: {
                        alias: sharedAliases
                    },
                    build: {
                        outDir: 'dist-electron',
                        lib: {
                            entry: 'src/backend/preload.ts',
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
        alias: sharedAliases
    },
    server: {
        port: 5173
    },
    optimizeDeps: {
        exclude: []
    }
})
