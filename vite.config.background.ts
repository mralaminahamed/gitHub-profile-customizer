import { defineConfig } from 'vite'
import { sharedConfig } from './vite.config.shared'
import { r, isDev } from './scripts/utils'

export default defineConfig({
  ...sharedConfig,
  build: {
    watch: isDev ? {} : null,
    outDir: r('dist', 'background'),
    emptyOutDir: false,
    sourcemap: isDev ? 'inline' : false,
    lib: {
      entry: r('src', 'background', 'index.ts'),
      name: 'Background',
      formats: ['es'],
      fileName: () => 'index.js',
    },
    rollupOptions: {
      output: {
        extend: true,
      },
    },
  },
})
