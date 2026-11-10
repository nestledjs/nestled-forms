// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
const storybook = require('eslint-plugin-storybook')
const nx = require('@nx/eslint-plugin')

module.exports = [
  {
    files: ['**/*.json'],
    // Override or add rules here
    rules: {},
    languageOptions: { parser: require('jsonc-eslint-parser') },
  },
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  ...storybook.configs['flat/recommended'],
  {
    ignores: ['**/dist', '**/vite.config.*.timestamp*', '**/vitest.config.*.timestamp*'],
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allowCircularSelfDependency: true,
          allow: [
            String.raw`^.*/eslint(\.base)?\.config\.[cm]?js$`,
            // Build-time vite plugin shared by the package vite configs; never part of package source.
            String.raw`^.*/tools/vite/copy-package-files$`,
          ],
          depConstraints: [
            {
              sourceTag: '*',
              onlyDependOnLibsWithTags: ['*'],
            },
          ],
        },
      ],
    },
  },
  {
    files: ['**/*.spec.ts', '**/*.spec.tsx', '**/*.test.ts', '**/*.test.tsx'],
    rules: {
      '@typescript-eslint/no-empty-function': ['off'],
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },
  // Rules ESLint 10 added to eslint:recommended. Errors, by the owner's decision.
  {
    rules: {
      'no-useless-assignment': 'error',
      'preserve-caught-error': 'error',
    },
  },
]

// eslint-plugin-react (through `nx.configs['flat/react']`) sets `react.version: 'detect'`, and its
// detection calls `context.getFilename()`, which ESLint 10 removed: every React lint crashes with
// "contextOrFilename.getFilename is not a function". Naming the installed version skips detection.
// Spread this after `nx.configs['flat/react']`. Remove it once eslint-plugin-react supports ESLint 10.
module.exports.reactVersionSettings = {
  settings: { react: { version: require('react/package.json').version } },
}

// eslint-plugin-react-hooks v7's recommended set (applied by `nx.configs['flat/react']`) adds the
// React Compiler rules. All of them are errors, by the owner's decision, including the two the
// preset ships as warnings (incompatible-library, unsupported-syntax). rules-of-hooks keeps its
// preset level and exhaustive-deps keeps each project's own setting. Spread this after
// `nx.configs['flat/react']`.
module.exports.reactHooksV7Rules = {
  files: ['**/*.ts', '**/*.cts', '**/*.mts', '**/*.tsx', '**/*.js', '**/*.cjs', '**/*.mjs', '**/*.jsx'],
  rules: {
    'react-hooks/static-components': 'error',
    'react-hooks/use-memo': 'error',
    'react-hooks/void-use-memo': 'error',
    'react-hooks/preserve-manual-memoization': 'error',
    'react-hooks/incompatible-library': 'error',
    'react-hooks/immutability': 'error',
    'react-hooks/globals': 'error',
    'react-hooks/refs': 'error',
    'react-hooks/set-state-in-effect': 'error',
    'react-hooks/error-boundaries': 'error',
    'react-hooks/purity': 'error',
    'react-hooks/set-state-in-render': 'error',
    'react-hooks/unsupported-syntax': 'error',
    'react-hooks/config': 'error',
    'react-hooks/gating': 'error',
  },
}
