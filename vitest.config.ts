import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  test: {
    globals: true,
    include: ['tests/**/*.spec.ts'],
    environmentMatchGlobs: [
      ['tests/server/**', 'node'],
      ['tests/components/**', 'jsdom'],
      ['tests/App.spec.ts', 'jsdom'],
    ],
    environment: 'jsdom',
    // Server tests share a SQLite database — run them sequentially to avoid race conditions
    fileParallelism: false,
  },
})
