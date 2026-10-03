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
  },
  // React Native (and RNTL) ship untranspiled ESM/Flow and must be transformed.
  // pnpm nests them under node_modules/.pnpm/<pkg>@<version>/node_modules/<pkg>,
  // so the usual RN pattern (which expects the package right after
  // node_modules/) never matches — match anywhere in the path instead.
  transformIgnorePatterns: [
    'node_modules/(?!.*((jest-)?react-native|@react-native(-community)?|@testing-library|test-renderer))',
  ],
}
