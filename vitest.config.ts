import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // forms-native is intentionally absent: React Native ships Flow-typed
    // source that Vite cannot parse, so that package is tested with jest
    // (forms-native/jest.config.cjs, wired up as its nx `test` target).
    projects: [
      'forms/vitest.config.ts',
      'forms-core/vite.config.ts',
    ],
  },
})
