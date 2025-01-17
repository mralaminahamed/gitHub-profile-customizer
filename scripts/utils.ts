import { bgCyan, black } from 'kolorist'

// Browser-compatible path utilities
export const r = (...args: string[]) => {
  return args.join('/')
}

export const isDev = process.env.NODE_ENV !== 'production'
export const port = 3303 // Default port, removed dynamic parsing

export function log(name: string, message: string) {
  console.log(black(bgCyan(` ${name} `)), message)
}