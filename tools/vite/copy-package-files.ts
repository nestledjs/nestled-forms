import { copyFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs'
import * as path from 'node:path'
import type { Plugin, ResolvedConfig } from 'vite'

/**
 * Copies a package's publish files (its package.json, plus any top-level files
 * matching `patterns`) from the project root into the build output.
 *
 * Replaces two things Nx 24 removed: the `@nx/vite:build` executor, which copied
 * package.json into the output path, and `nxCopyAssetsPlugin`. Patterns are exact
 * file names or `*.ext`, matched against the project root only, as before.
 */
export function copyPackageFiles(patterns: string[] = []): Plugin {
  let config: ResolvedConfig
  const matches = (name: string) =>
    name === 'package.json' || patterns.some((p) => (p.startsWith('*.') ? name.endsWith(p.slice(1)) : name === p))

  return {
    name: 'nestled:copy-package-files',
    apply: 'build',
    configResolved(resolved) {
      config = resolved
    },
    writeBundle() {
      const outDir = path.resolve(config.root, config.build.outDir)
      if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true })
      for (const entry of readdirSync(config.root, { withFileTypes: true })) {
        if (entry.isFile() && matches(entry.name)) {
          copyFileSync(path.join(config.root, entry.name), path.join(outDir, entry.name))
        }
      }
    },
  }
}
