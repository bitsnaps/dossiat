/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    globals: true,
    fileParallelism: false,
    environmentMatchGlobs: [
      ['src/server/**', 'node'],
      ['tests/server/**', 'node'],
      ['tests/**', 'jsdom'],
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.{ts,vue}'],
      exclude: ['src/main.ts', 'src/env.d.ts'],
      thresholds: {
        statements: 30,
        branches: 20,
        functions: 20,
        lines: 30,
      },
    },
  },
})
