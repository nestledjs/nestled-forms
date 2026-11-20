/**
 * React Native ships Flow-typed source that Vite cannot parse, so forms-native
 * uses jest with React Native's own preset instead of the vitest setup the web
 * packages use. Everything else in the repo stays on vitest.
 *
 * RNTL v13+ registers its matchers automatically, so there is no setup file.
 */
module.exports = {
  displayName: 'forms-native',
  preset: 'react-native',
  rootDir: __dirname,
  testMatch: ['<rootDir>/src/**/*.(test|spec).(ts|tsx)'],
  moduleNameMapper: {
    // resolve workspace imports to source, mirroring tsconfig.base.json paths
    '^@nestledjs/forms-core/apollo$': '<rootDir>/../forms-core/src/apollo.ts',
    '^@nestledjs/forms-core$': '<rootDir>/../forms-core/src/index.ts',
    // `pnpm test:zod3` points `zod` at the aliased zod 3 install so the zod 3
    // half of the `^3.0.0 || ^4.0.0` peer range is covered. See
    // tools/vite/zod-alias.ts for the vitest-side equivalent.
    ...(process.env.NESTLED_ZOD_ALIAS ? { '^zod$': process.env.NESTLED_ZOD_ALIAS } : {}),
  },
  // React Native (and RNTL) ship untranspiled ESM/Flow and must be transformed.
  // pnpm nests them under node_modules/.pnpm/<pkg>@<version>/node_modules/<pkg>,
  // so the usual RN pattern (which expects the package right after
  // node_modules/) never matches — match anywhere in the path instead.
  transformIgnorePatterns: [
    'node_modules/(?!.*((jest-)?react-native|@react-native(-community)?|@testing-library|test-renderer))',
  ],
}
