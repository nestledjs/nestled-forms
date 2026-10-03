#!/usr/bin/env node
/**
 * Publish gate for emitted type declarations.
 *
 * Catches the class of bug that shipped in 0.8.1: `vite-plugin-dts` resolved the
 * workspace tsconfig path aliases, so every cross-package import in the emitted
 * .d.ts became a relative path into source that is never published. The .js output
 * was correct, the build was green, and the workspace type-checked fine — because
 * inside the monorepo those paths *do* resolve. Only an installed consumer sees it.
 *
 * Two layers:
 *   1. Static  — every specifier in dist/**\/*.d.ts must be resolvable by a consumer:
 *                relative ones must stay inside the package and not point at .ts
 *                source; bare ones must be a declared dependency or peer.
 *   2. Consumer — pack the web packages, install them into a temp dir outside the
 *                workspace, and type-check real imports against them.
 *
 * forms-native is static-only: its peers (react-native, expo-checkbox, …) are too
 * heavy to install on every publish, and layer 1 already covers the failure mode.
 */
import { execFileSync } from 'node:child_process'
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  realpathSync,
  rmSync,
  symlinkSync,
  writeFileSync,
  existsSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import * as path from 'node:path'
import { isBuiltin } from 'node:module'

const ROOT = path.resolve(import.meta.dirname, '..')
const PACKAGES = ['forms-core', 'forms', 'forms-native']
const CONSUMER_TYPECHECK = ['forms-core', 'forms']

const problems = []
const note = (s) => console.log(s)

function walk(dir, out = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) walk(p, out)
    else if (e.name.endsWith('.d.ts')) out.push(p)
  }
  return out
}

/**
 * Strip comments. JSDoc in these files is full of `import … from '@nestledjs/forms'`
 * usage examples, which are documentation and not specifiers the compiler resolves.
 */
function stripComments(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1')
}

/** Module specifiers in `from '…'`, `import '…'` and `import('…')` type positions. */
function specifiers(src) {
  const code = stripComments(src)
  const found = new Set()
  const patterns = [
    /\bfrom\s*['"]([^'"]+)['"]/g,
    /\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
    /\bimport\s+['"]([^'"]+)['"]/g,
  ]
  for (const re of patterns) for (const m of code.matchAll(re)) found.add(m[1])
  return [...found]
}

/** `@scope/name/sub` -> `@scope/name`; `name/sub` -> `name`. */
function packageName(spec) {
  const parts = spec.split('/')
  return spec.startsWith('@') ? parts.slice(0, 2).join('/') : parts[0]
}

// ---------------------------------------------------------------- layer 1
for (const pkg of PACKAGES) {
  const dist = path.join(ROOT, 'dist', pkg)
  if (!existsSync(dist)) {
    problems.push(`${pkg}: dist/${pkg} missing — run the build first`)
    continue
  }
  const manifest = JSON.parse(readFileSync(path.join(dist, 'package.json'), 'utf8'))
  const declared = new Set([
    ...Object.keys(manifest.dependencies ?? {}),
    ...Object.keys(manifest.peerDependencies ?? {}),
    ...Object.keys(manifest.optionalDependencies ?? {}),
    // A package may reference itself by name through its own "exports" map.
    manifest.name,
  ])

  const files = walk(dist)
  let checked = 0
  for (const file of files) {
    const rel = path.relative(ROOT, file)
    for (const spec of specifiers(readFileSync(file, 'utf8'))) {
      checked++
      if (spec.startsWith('.')) {
        const resolved = path.resolve(path.dirname(file), spec)
        if (!resolved.startsWith(dist + path.sep)) {
          problems.push(`${rel}: '${spec}' escapes the package root — unresolvable once installed`)
        } else if (/\.tsx?$/.test(spec)) {
          problems.push(`${rel}: '${spec}' points at .ts source, which is not published`)
        }
      } else if (!isBuiltin(spec) && !declared.has(packageName(spec))) {
        problems.push(`${rel}: '${spec}' is not a dependency or peerDependency of ${manifest.name}`)
      }
    }
  }
  note(`  ${pkg}: ${files.length} declaration files, ${checked} specifiers`)
}

if (problems.length) {
  console.error('\n✖ Declaration check failed:\n')
  for (const p of problems.slice(0, 40)) console.error(`  ${p}`)
  if (problems.length > 40) console.error(`  … and ${problems.length - 40} more`)
  console.error('')
  process.exit(1)
}
note('  ✓ all specifiers resolvable by an installed consumer\n')

// ---------------------------------------------------------------- layer 2
note('Consumer type-check (packed tarballs, installed outside the workspace):')
const tmp = mkdtempSync(path.join(tmpdir(), 'nestled-verify-'))
try {
  const tarballs = CONSUMER_TYPECHECK.map((pkg) => {
    const out = execFileSync('npm', ['pack', `./dist/${pkg}`, '--pack-destination', tmp, '--silent'], {
      cwd: ROOT,
      encoding: 'utf8',
    })
    const name = JSON.parse(readFileSync(path.join(ROOT, 'dist', pkg, 'package.json'), 'utf8')).name
    return { name, tgz: path.join(tmp, out.trim().split('\n').pop().trim()) }
  })

  writeFileSync(path.join(tmp, 'package.json'), JSON.stringify({ name: 'consumer', private: true, type: 'module' }))
  writeFileSync(
    path.join(tmp, 'tsconfig.json'),
    JSON.stringify({
      compilerOptions: {
        strict: true,
        noEmit: true,
        module: 'esnext',
        moduleResolution: 'bundler',
        target: 'es2022',
        jsx: 'react-jsx',
        // The point is to check the shipped .d.ts, so do not skip them.
        skipLibCheck: false,
      },
      include: ['index.ts'],
    }),
  )
  writeFileSync(
    path.join(tmp, 'index.ts'),
    [
      `import { Form, FormFieldType, useFormValue, useFormValues, useWatch } from '@nestledjs/forms'`,
      `import type { FormField, FormTheme } from '@nestledjs/forms'`,
      `import { ApolloSearchProvider, useApolloSearchQuery } from '@nestledjs/forms/apollo'`,
      ``,
      `const field: FormField = { key: 'name', type: FormFieldType.Text, options: {} }`,
      `const theme: Partial<FormTheme> = {}`,
      `export const used = [Form, field, theme, ApolloSearchProvider, useApolloSearchQuery]`,
      `export const reactiveReads = [useFormValue, useFormValues, useWatch]`,
      ``,
    ].join('\n'),
  )

  // Build node_modules by hand rather than `npm install`. Installing from the
  // registry took >10 minutes on a cold cache, which is far too slow for a gate
  // that runs on every publish. Unpacking the tarballs and linking peers out of
  // the workspace is seconds, needs no network, and still exercises real Node
  // resolution against the exact file layout that npm would lay down.
  const nm = path.join(tmp, 'node_modules')
  mkdirSync(path.join(nm, '@nestledjs'), { recursive: true })

  for (const { name, tgz } of tarballs) {
    const dest = path.join(nm, name)
    mkdirSync(dest, { recursive: true })
    execFileSync('tar', ['-xzf', tgz, '-C', dest, '--strip-components=1'])
  }

  // Link every declared dependency/peer of the packages under test, resolved out
  // of the workspace install, so the consumer sees what npm would have installed.
  const needed = new Set(['@types/react', 'typescript'])
  for (const pkg of CONSUMER_TYPECHECK) {
    const m = JSON.parse(readFileSync(path.join(ROOT, 'dist', pkg, 'package.json'), 'utf8'))
    for (const dep of [...Object.keys(m.dependencies ?? {}), ...Object.keys(m.peerDependencies ?? {})]) {
      if (!dep.startsWith('@nestledjs/')) needed.add(packageName(dep))
    }
  }

  // pnpm only hoists direct dependencies to node_modules/<name>; transitive ones
  // (e.g. @graphql-typed-document-node/core, pulled in by @apollo/client) live under
  // .pnpm/<id>/node_modules/<name>. Check both, or declared-but-unhoisted deps get
  // skipped and resurface as a confusing TS2307 that looks like a packaging bug.
  const pnpmDir = path.join(ROOT, 'node_modules', '.pnpm')
  const pnpmEntries = existsSync(pnpmDir) ? readdirSync(pnpmDir) : []
  const locate = (dep) => {
    const direct = path.join(ROOT, 'node_modules', dep)
    if (existsSync(direct)) return direct
    for (const entry of pnpmEntries) {
      const candidate = path.join(pnpmDir, entry, 'node_modules', dep)
      if (existsSync(candidate)) return candidate
    }
    return null
  }

  const unresolved = []
  for (const dep of needed) {
    const src = locate(dep)
    if (!src) {
      unresolved.push(dep)
      continue
    }
    const dest = path.join(nm, dep)
    if (existsSync(dest)) continue
    mkdirSync(path.dirname(dest), { recursive: true })
    symlinkSync(realpathSync(src), dest, 'junction')
  }
  if (unresolved.length) {
    note(`  note: not found in the workspace install, so not linked: ${unresolved.join(', ')}`)
  }

  execFileSync(path.join(ROOT, 'node_modules', '.bin', 'tsc'), ['-p', 'tsconfig.json', '--noEmit'], {
    cwd: tmp,
    stdio: 'inherit',
  })
  note('  ✓ installed consumer type-checks clean\n')
} catch (err) {
  console.error('\n✖ Consumer type-check failed — the published packages would not type-check for users.\n')
  if (err.stdout) console.error(err.stdout.toString().slice(0, 4000))
  if (err.stderr) console.error(err.stderr.toString().slice(0, 4000))
  process.exit(1)
} finally {
  rmSync(tmp, { recursive: true, force: true })
}

note('Publish gate passed.')
