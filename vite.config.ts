import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import tailwind from 'tailwindcss'
import autoprefixer from 'autoprefixer'
import type { UserConfig, BuildOptions } from 'vite'

interface BuildConfig {
  outDir: string
  emptyOutDir?: boolean
  sourcemap?: boolean | 'inline' | 'hidden'
}

const isDev = process.env.NODE_ENV !== 'production'

// Helper to resolve paths
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

// Shared build configuration
const getSharedBuildConfig = (options: BuildConfig): BuildOptions => ({
  watch: isDev ? {} : null,
  outDir: options.outDir,
  emptyOutDir: options.emptyOutDir ?? false,
  sourcemap: options.sourcemap ?? (isDev ? 'inline' : false),
})

// Shared Vite configuration
const sharedConfig: UserConfig = {
  plugins: [react()],
  resolve: {
    alias: {
      '@': r('src'),
    },
  },
  css: cssConfig,
}

// Background script build configuration
const backgroundConfig: UserConfig = {
  ...sharedConfig,
  build: {
    ...getSharedBuildConfig({
      outDir: r('dist/background'),
    }),
    lib: {
      entry: r('src/background/index.ts'),
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
}

// Content script build configuration
const contentConfig: UserConfig = {
  ...sharedConfig,
  build: {
    ...getSharedBuildConfig({
      outDir: r('dist/contentScripts'),
    }),
    cssCodeSplit: false,
    lib: {
      entry: r('src/contentScripts/index.ts'),
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
}

// Main extension build configuration
const mainConfig: UserConfig = {
  ...sharedConfig,
  root: r('src'),
  base: '',
  build: {
    ...getSharedBuildConfig({
      outDir: r('dist'),
    }),
    rollupOptions: {
      input: {
        popup: r('src/popup/index.html'),
        options: r('src/options/index.html'),
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
}

// Export configurations based on command line arguments
export default defineConfig(({ mode }) => {
  const config = process.env.VITE_CONFIG

  // In development mode, ensure source maps are enabled
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