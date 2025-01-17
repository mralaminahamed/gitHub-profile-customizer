import type { UserConfig } from 'vite';
import react from '@vitejs/plugin-react'
import { r } from './scripts/utils'

export const sharedConfig: UserConfig = {
  plugins: [react()],
  resolve: {
    alias: {
      '@': r('src'),
    },
  },
}
