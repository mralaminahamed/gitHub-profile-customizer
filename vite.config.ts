import { type UserConfig, type ConfigEnv, defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import tailwind from 'tailwindcss'
import autoprefixer from 'autoprefixer'
import { visualizer } from 'rollup-plugin-visualizer'
import { VitePWA } from 'vite-plugin-pwa'
import checker from 'vite-plugin-checker'

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
  modules: {
    localsConvention: 'camelCase',
    generateScopedName: isDev ? '[name]__[local]__[hash:base64:5]' : '[hash:base64:8]'
  }
}

// Enhanced chunk splitting strategy
const CHUNKS = {
  react: ['react', 'react-dom', 'react-router-dom'],
  ui: ['@headlessui/react', '@heroicons/react', 'framer-motion', '@radix-ui'],
  utils: ['webextension-polyfill', 'clsx', 'lodash', 'date-fns', 'uuid'],
  state: ['zustand', '@tanstack/react-query', 'jotai', '@tanstack/react-query-devtools', 'recoil'],
  forms: ['react-hook-form', 'zod', '@hookform/resolvers', 'formik', 'yup'],
  charts: ['recharts', 'd3', 'chart.js'],
  animation: ['@react-spring/web', 'react-transition-group', 'react-move'],
  i18n: ['i18next', 'react-i18next'],
}

// Improved chunk splitting with size-based optimization
function createManualChunks(id: string) {
  if (id.includes('node_modules')) {
    // Find which chunk group this dependency belongs to
    for (const [name, deps] of Object.entries(CHUNKS)) {
      if (deps.some(dep => id.includes(dep))) {
        return `vendor-${name}`
      }
    }
    // Split large modules into separate chunks
    return id.length > 50000 ? 'vendor-large' : 'vendor-common'
  }
}

// Enhanced base configuration
const baseConfig: UserConfig = {
  plugins: [
    react({
      babel: {
        plugins: isDev ? ['react-refresh/babel'] : []
      }
    }),
    checker({
      typescript: true,
      eslint: {
        lintCommand: 'eslint "./src/**/*.{ts,tsx}"',
      },
    }),
    isDev && visualizer({
      filename: './stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'Your Extension Name',
        short_name: 'Extension',
        theme_color: '#ffffff',
        icons: [
          {
            src: '/android-chrome-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      '@': r('src'),
      '@components': r('src/components'),
      '@hooks': r('src/hooks'),
      '@utils': r('src/utils'),
      '@assets': r('src/assets'),
      '@pages': r('src/pages'),
      '@services': r('src/services'),
      '@types': r('src/types'),
      '@constants': r('src/constants'),
      '@store': r('src/store'),
      '@styles': r('src/styles'),
    },
  },
  css: cssConfig,
  build: {
    target: ['chrome89', 'edge89', 'firefox89', 'safari15'],
    reportCompressedSize: false,
    minify: !isDev ? 'esbuild' : false,
    sourcemap: isDev,
    cssCodeSplit: true,
    assetsInlineLimit: 4096, // 4kb
    rollupOptions: {
      output: {
        manualChunks: createManualChunks,
      }
    }
  },
  esbuild: {
    drop: !isDev ? ['console', 'debugger'] : undefined,
    legalComments: 'none',
    jsx: 'automatic',
  },
  server: isDev ? {
    port: 3000,
    strictPort: true,
    hmr: {
      overlay: true
    },
    watch: {
      ignored: ['**/coverage/**', '**/node_modules/**', '**/.git/**'],
    },
  } : undefined,
  preview: {
    port: 3000,
    strictPort: true,
  },
  optimizeDeps: {
    include: Object.values(CHUNKS).flat(),
  },
}

// Enhanced main config for popup
const mainConfig: UserConfig = {
  ...baseConfig,
  root: r('src/popup'),
  base: '',
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
        entryFileNames: chunk => {
          return chunk.name === 'popup' 
            ? 'popup/index-[hash].js' 
            : 'assets/js/[name]-[hash].js'
        },
        chunkFileNames: (chunkInfo) => {
          if (chunkInfo.name?.startsWith('vendor-')) {
            const name = chunkInfo.name.replace('vendor-', '');
            return `assets/vendor/${name}-[hash].js`;
          }
          return 'assets/js/[name]-[hash].js';
        },
        assetFileNames: (assetInfo) => {
          const ext = assetInfo.name?.split('.').pop()?.toLowerCase() ?? '';
          const assetMap: Record<string, string> = {
            css: 'popup/style-[hash].css',
            png: 'assets/images/[name]-[hash][extname]',
            jpg: 'assets/images/[name]-[hash][extname]',
            jpeg: 'assets/images/[name]-[hash][extname]',
            gif: 'assets/images/[name]-[hash][extname]',
            svg: 'assets/images/[name]-[hash][extname]',
            woff: 'assets/fonts/[name]-[hash][extname]',
            woff2: 'assets/fonts/[name]-[hash][extname]',
            ttf: 'assets/fonts/[name]-[hash][extname]',
            eot: 'assets/fonts/[name]-[hash][extname]',
            mp3: 'assets/audio/[name]-[hash][extname]',
            mp4: 'assets/video/[name]-[hash][extname]',
            webm: 'assets/video/[name]-[hash][extname]',
            pdf: 'assets/docs/[name]-[hash][extname]',
            json: 'assets/data/[name]-[hash][extname]',
          }
          return assetMap[ext] || 'assets/[name]-[hash][extname]'
        },
      },
    },
  },
}

// Enhanced background script config
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
        format: 'es',
        inlineDynamicImports: true,
      },
    },
  },
}

// Enhanced content scripts config
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
        format: 'iife',
        inlineDynamicImports: true,
      },
    },
  },
}

// Export configurations based on command line arguments with enhanced development features
export default defineConfig(({ command, mode }: ConfigEnv): UserConfig => {
  const config = process.env.VITE_CONFIG

  if (mode === 'development') {
    // Enable source maps and additional development features
    backgroundConfig.build!.sourcemap = 'inline'
    contentConfig.build!.sourcemap = 'inline'
    mainConfig.build!.sourcemap = 'inline'

    // Add development-specific plugins
    const devPlugins = [
      checker({
        typescript: true,
        eslint: {
          lintCommand: 'eslint "./src/**/*.{ts,tsx}"',
        },
        overlay: true,
      }),
    ]

    backgroundConfig.plugins = [...(backgroundConfig.plugins || []), ...devPlugins]
    contentConfig.plugins = [...(contentConfig.plugins || []), ...devPlugins]
    mainConfig.plugins = [...(mainConfig.plugins || []), ...devPlugins]
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