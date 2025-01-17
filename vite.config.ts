import { defineConfig } from 'vite'
import { sharedConfig } from './vite.config.shared'
import { r, isDev } from './scripts/utils'

export default defineConfig({
  ...sharedConfig,
  root: r('src'),
  base: '',
  build: {
    outDir: r('dist'),
    sourcemap: isDev ? 'inline' : false,
    emptyOutDir: false,
    rollupOptions: {
      input: {
        popup: r('src', 'popup', 'index.html'),
        options: r('src', 'options', 'index.html'),
      },
      output: {
        entryFileNames: chunk => `${chunk.name}/index.js`,
        assetFileNames: chunk => {
          if (chunk.name?.endsWith('.css'))
            return '[name]/style.css'
          return 'assets/[name]-[hash][extname]'
        },
        chunkFileNames: '[name]/[hash].js',
      },
    },
  },
})
