/// <reference types='vitest' />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'
import * as path from 'node:path'
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin'
import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin'

export default defineConfig({
  root: __dirname,
  cacheDir: '../node_modules/.vite/forms-native',
  plugins: [
    react(),
    nxViteTsPaths(),
    nxCopyAssetsPlugin(['*.md']),
    dts({
      entryRoot: 'src',
      tsconfigPath: path.join(__dirname, 'tsconfig.lib.json'),
      // Keep workspace aliases as bare specifiers in the emitted .d.ts. Without
      // this they resolve to ../../forms-core/src/*.ts — paths that escape the
      // published package and point at sources that aren't shipped.
      aliasesExclude: [/^@nestledjs\//],
    }),
  ],
  build: {
    outDir: '../dist/forms-native',
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
      name: 'forms-native',
      fileName: (_format, entryName) => `${entryName}.js`,
      formats: ['es' as const],
    },
    rollupOptions: {
      external: [
        'react',
        'react/jsx-runtime',
        'react-native',
        'react-hook-form',
        'zod',
        '@hookform/resolvers',
        '@hookform/resolvers/zod',
        '@apollo/client',
        '@apollo/client/react',
        'graphql',
        '@nestledjs/forms-core',
        '@nestledjs/forms-core/apollo',
        'dayjs',
        'expo-checkbox',
        '@react-native-community/datetimepicker',
        'react-native-element-dropdown',
        '@ronradtke/react-native-markdown-display',
      ],
      output: {
        // Vite lib mode strips 'use client'; RSC-aware bundlers need it on every chunk
        banner: `'use client';`,
      },
    },
  },
})
