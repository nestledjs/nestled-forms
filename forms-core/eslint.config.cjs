const nx = require('@nx/eslint-plugin')
const baseConfig = require('../eslint.config.js')

module.exports = [
  ...baseConfig,
  ...nx.configs['flat/react'],
  {
    ignores: [
      'dist/**',
      'coverage/**',
      '**/node_modules/**',
    ]
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      'react-hooks/exhaustive-deps': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      'prefer-const': 'off',
      'no-var': 'off'
    },
  },
]
