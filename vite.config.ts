import { type UserConfig, type ConfigEnv, defineConfig } from 'vite';
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import tailwind from 'tailwindcss'
import autoprefixer from 'autoprefixer'

const isDev = process.env.NODE_ENV !== 'production'
const r = (...args: string[]) => resolve(__dirname, ...args)

// Shared CSS configuration
const cssConfig = {
  postcss: {
    plugins: [
      tailwind({
        config: r('tailwind.config.ts'),
      }),
      autoprefixer(),
    ],
  },
}

// Define chunk splitting strategy
const CHUNKS = {
  react: ['react', 'react-dom', 'react-router-dom'],
  ui: ['@headlessui/react', '@heroicons/react', 'framer-motion'],
  utils: ['webextension-polyfill', 'clsx', 'lodash'],
  state: ['zustand', '@tanstack/react-query'],
}

function createManualChunks(id: string) {
  if (id.includes('node_modules')) {
    // Find which chunk group this dependency belongs to
    for (const [name, deps] of Object.entries(CHUNKS)) {
      if (deps.some(dep => id.includes(dep))) {
        return `vendor-${name}`
      }
    }
    // Other vendor dependencies
    return 'vendor-common'
  }
}

// Base shared configuration
const baseConfig: UserConfig = {
  plugins: [react()],
  resolve: {
    alias: {
      '@': r('src'),
    },
  },
  css: cssConfig,
  build: {
    target: ['chrome89', 'edge89', 'firefox89', 'safari15'],
    reportCompressedSize: false,
    minify: !isDev,
    sourcemap: isDev,
  },
}

// Main extension pages (popup & options)
const mainConfig: UserConfig = {
  ...baseConfig,
  build: {
    ...baseConfig.build,
    outDir: r('dist'),
    emptyOutDir: false,
    rollupOptions: {
      input: {
        popup: r('src/popup/index.html'),
      },
      output: {
        extend: true,
        manualChunks: createManualChunks,
        entryFileNames: '[name]/[name]-[hash].js',
        chunkFileNames: (chunkInfo) =>{
          if (chunkInfo.name.startsWith('vendor-')) {
            const name = chunkInfo.name.replace('vendor-', '');
            return `assets/vendor/${name}-[hash].js`;
          }
          return '[name]/chunks/[name]-[hash].js';
        },
        assetFileNames: (assetInfo) => {
          const ext = assetInfo.name?.split('.').pop()?.toLowerCase() ?? '';
          if (ext === 'css') return '[name]/[name]-[hash][extname]';
          if (['png', 'jpg', 'jpeg', 'gif', 'svg'].includes(ext)) {
            return '[name]/images/[name]-[hash][extname]';
          }
          return '[name]/assets/[name]-[hash][extname]';
        },
      },
    },
  },
}

// Background script (no chunk splitting needed)
const backgroundConfig: UserConfig = {
  ...baseConfig,
  build: {
    ...baseConfig.build,
    outDir: r('dist/background'),
    lib: {
      entry: r('src/background/index.ts'),
      formats: ['es'],
      fileName: () => 'index.js',
    },
    rollupOptions: {
      output: {
        extend: true,
      },
    },
  },
}

// Content scripts (no chunk splitting, must be self-contained)
const contentConfig: UserConfig = {
  ...baseConfig,
  build: {
    ...baseConfig.build,
    outDir: r('dist/contentScripts'),
    cssCodeSplit: false,
    lib: {
      entry: r('src/contentScripts/index.ts'),
      formats: ['iife'],
      name: 'contentScripts',
    },
    rollupOptions: {
      output: {
        entryFileNames: 'index.global.js',
        extend: true,
      },
    },
  },
}

// Export configurations based on command line arguments
export default defineConfig(({ mode }: ConfigEnv): UserConfig => {
  const config = process.env.VITE_CONFIG

  // Enable source maps in development
  if (mode === 'development') {
    backgroundConfig.build!.sourcemap = 'inline'
    contentConfig.build!.sourcemap = 'inline'
    mainConfig.build!.sourcemap = 'inline'
  }

  switch (config) {
    case 'background':
      return backgroundConfig
    case 'content':
      return contentConfig
    default:
      return mainConfig
  }
})