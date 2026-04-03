import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    projects: [
      'forms/vitest.config.ts',
      'forms-core/vite.config.ts',
      'forms-native/vite.config.ts',
    ],
  },
})
