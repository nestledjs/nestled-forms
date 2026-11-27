/// <reference types='vitest' />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'
import * as path from 'node:path'
import { copyPackageFiles } from '../tools/vite/copy-package-files'
import { zodTestAlias } from '../tools/vite/zod-alias'

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
    alias: zodTestAlias(),
  },
  test: {
    name: 'forms-core',
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    passWithNoTests: true,
  },
  root: __dirname,
  cacheDir: '../node_modules/.vite/forms-core',
  plugins: [
    react(),
    copyPackageFiles(['*.md']),
    dts({ entryRoot: 'src', tsconfigPath: path.join(__dirname, 'tsconfig.lib.json') }),
  ],
  build: {
    outDir: '../dist/forms-core',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    lib: {
      entry: {
        index: 'src/index.ts',
        apollo: 'src/apollo.ts',
      },
      name: 'forms-core',
      fileName: (_format, entryName) => `${entryName}.js`,
      formats: ['es' as const],
    },
    rolldownOptions: {
      external: [
        'react',
        'react/jsx-runtime',
        'react-hook-form',
        'zod',
        '@apollo/client',
        '@apollo/client/react',
        'graphql',
        '@graphql-typed-document-node/core',
        'dayjs',
      ],
      output: {
        // Vite lib mode strips 'use client'; RSC-aware bundlers need it on every chunk
        banner: `'use client';`,
      },
    },
  },
})
