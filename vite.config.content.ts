import { defineConfig } from 'vite'
import { sharedConfig } from './vite.config.shared'
import { r, isDev } from './scripts/utils'

export default defineConfig({
  ...sharedConfig,
  build: {
    watch: isDev ? {} : null,
    outDir: r('dist', 'contentScripts'),
    cssCodeSplit: false,
    emptyOutDir: false,
    sourcemap: isDev ? 'inline' : false,
    lib: {
      entry: r('src', 'contentScripts', 'index.ts'),
      name: 'ContentScripts',
      formats: ['iife'],
    },
    rollupOptions: {
      output: {
        entryFileNames: 'index.global.js',
        extend: true,
      },
    },
  },
})
