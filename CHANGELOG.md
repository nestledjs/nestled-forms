# Changelog

All notable changes to the `@nestledjs/*` form packages are documented here.
The three packages — `@nestledjs/forms-core`, `@nestledjs/forms`, and
`@nestledjs/forms-native` — are versioned together.

## 0.9.0 — 2026-07-29

Minor release across all three packages. `@nestledjs/forms-core` moves to 0.9.0
after sitting at 0.8.0 through the 0.8.1 and 0.8.2 releases, so `@nestledjs/forms`
and `@nestledjs/forms-native` bump their pin to match.

Additive only — nothing here changes existing behaviour or removes an API.

### ✨ Features

- **`useFormValue` / `useFormValues` — a supported way to read form values reactively.**
  A component inside `<Form>` that doesn't own the form had no way to reactively read a
  field. The documented route — `useFormContext()` then `form.watch(name)` — compiles,
  returns the right value on first render, and then silently never updates: no error,
  no warning, no type-level signal.

  `watch()` during render re-renders only the component that owns `useForm()`, which is
  `<Form>` itself. `<Form>` passes `children` straight through, so React sees an
  identical element reference and skips reconciling that subtree — the subscription
  fires and the caller is never reached.

  The idiomatic fix, `useWatch`, was unreachable: `forms-core` didn't export it, and
  `react-hook-form` is a peerDependency that under pnpm's isolated `node_modules` an app
  cannot resolve unless it depends on it directly — which risks a second copy at a
  different version. So consumers had to hand-roll a subscription hook.

  Now exported from `@nestledjs/forms-core`, and therefore from `@nestledjs/forms` and
  `@nestledjs/forms-native` too:

  ```tsx
  import { useFormValue } from '@nestledjs/forms'

  function Mirror() {
    const answer = useFormValue<string>('answer')
    return <p>You picked: {answer}</p>
  }
  ```

  `useFormValues()` reads the whole form, and `useWatch` is re-exported for direct use —
  importing it from the package guarantees you subscribe through the same react-hook-form
  instance `<Form>` uses.

  Distinct from the 0.8.1 fix, which made a field reactive to its *own* value. This covers
  a component reading a field owned by something else. Both cases are now under test.

  Reported by Moceanic, with a reproduction and root-cause analysis that were correct in
  full — thank you.

### 📚 Documentation

- **`useFormContext` now warns about the `form.watch()` trap.** Its TSDoc previously
  demonstrated `register()`, which invited the assumption that every `UseFormReturn`
  method behaves normally in a consumer component. It now states plainly that
  `watch(name)` during render will not re-render the caller, and points at `useFormValue`.
  The same warning is in the README and on the docs site under Core Concepts and the API
  reference.

### 🏗️ Internal

- **`pnpm pre-publish` now gates on what consumers actually see.** The 0.8.1
  declaration bug was invisible to lint, test and build: inside the workspace
  those emitted paths resolve, so everything was green. `tools/verify-published-types.mjs`
  checks the built output the way an installed consumer would — every specifier
  in `dist/**/*.d.ts` must stay inside its package and not point at `.ts`
  source, and every bare specifier must be a declared dependency or peer; then
  the web packages are packed, unpacked outside the workspace and type-checked
  under `strict` with `skipLibCheck: false`. Verified to fail on the 0.8.1
  output and pass on 0.8.2. It runs offline in ~2s by linking peers out of the
  workspace install rather than hitting the registry. `forms-native` is
  static-only — its React Native peers are too heavy to install per publish,
  and the static layer already covers this failure mode.

  `pre-publish` is `test-suite && verify-types`. The name matches the 11 other
  repos in the workspace that already define it, so the shared `/pre-publish`
  command works here unchanged.

- **Storybook test helpers are no longer published.** `storybookTestUtils.d.ts`
  shipped in `@nestledjs/forms` through 0.8.2 with a top-level import of
  `storybook/test`, a devDependency. Nothing reachable from the public entry
  points referenced it, so it never broke a consumer type-check, but a deep
  import would have failed. `forms/tsconfig.lib.json` now excludes
  `**/storybook*.ts(x)` alongside the existing `*.stories.*` patterns. Found by
  the new gate.

## 0.8.2 — 2026-07-28

Bug-fix release for `@nestledjs/forms` and `@nestledjs/forms-native`.
`@nestledjs/forms-core` is unchanged and stays at 0.8.0.

**This release is types-only.** Every shipped `.js` bundle is byte-identical to
0.8.1 — verified by diffing the published tarballs (`index.js` md5
`227aa2f11dba69f32e643777832cf165` in both). Only `.d.ts` files changed. Worth
stating plainly, since a patch bump usually implies a behaviour change; if you
are on 0.8.1 and not using TypeScript, there is nothing here for you.

### 🐛 Fixes & hardening

- **Published type declarations no longer point outside the package.**
  `vite-plugin-dts` was resolving the workspace `tsconfig.base.json` path
  aliases when emitting `.d.ts`, so every cross-package import was rewritten to
  a relative path into source that is never shipped — `@nestledjs/forms`
  0.8.1 shipped `index.d.ts` as `export * from '../../forms-core/src/index.ts'`,
  across 34 declaration files (`@nestledjs/forms-native` likewise). Both escape
  the package root and reference `.ts` files absent from every published
  tarball, so TypeScript consumers got no types at all from the main entry.
  The `.js` output was always correct — Rollup externalised `@nestledjs/forms-core`
  properly — so this was types-only, and invisible to plain-JS consumers.
  Fixed with `aliasesExclude: [/^@nestledjs\//]` on the `dts()` plugin in
  `forms/vite.config.ts` and `forms-native/vite.config.ts`, which keeps the bare
  specifier. `@nestledjs/forms-core` is a declared dependency of both and
  exports the `./apollo` subpath, so the emitted specifiers resolve for
  consumers. `@nestledjs/forms-core` itself was never affected — it has no
  cross-package alias imports.

### 🏗️ Internal

Nothing in this section changes runtime behaviour; none of it would have
justified a release on its own, and it rides along with the fix above.

- **Dependency audit hardening.** `pnpm audit` went from 96 advisories
  (5 critical, 38 high) to 3, via minimum patched versions pinned through
  `pnpm.overrides` rather than by churning declared ranges. Every advisory was
  in build/test tooling — nx, storybook, vite, vitest, eslint, the react-native
  toolchain — never in anything the packages ship, so consumers were never
  exposed. Of the 3 remaining, two are false positives (the workspace directory
  `forms` is matched against the unrelated public npm package `forms`; ours is
  `@nestledjs/forms`) and one is a build-time-only ReDoS in `brace-expansion`
  reached through eslint's and `@nx/devkit`'s own `minimatch`, with no upgrade
  path that keeps the toolchain working.
- **React updated to 19.2.8** (with `@types/react` 19.2.17). React is a
  peerDependency, so this is a dev/test concern; the motivation is that
  react-native 0.84 and RNTL's `test-renderer` both require ~19.2, so the
  native test suite had been running against an unsupported React.

  This does change emitted declarations from
  `import("react/jsx-runtime").JSX.Element` to `import("react").JSX.Element`
  — runtime `.js` output is byte-identical, only `.d.ts` differs. That ships
  in 0.8.2, and alongside the declaration fix above it is the other
  consumer-visible difference. It resolves on `@types/react` 18.3, so the
  `>=18.0.0` peer range still holds.

> ⚠️ Do not run a blanket `pnpm update -r` in this repo. It drags react-native
> 0.84 → 0.86, which pulls a second copy of React alongside the pinned
> react-dom and nulls the hooks dispatcher, failing most of the suite.
> `react`, `react-dom` and `react-native` are pinned in `pnpm.overrides` to
> prevent exactly that; prefer targeted overrides for security bumps.

## 0.8.1 — 2026-07-28

Bug-fix release for `@nestledjs/forms` and `@nestledjs/forms-native`.
`@nestledjs/forms-core` is unchanged and stays at 0.8.0.

### 🐛 Fixes & hardening

- **Field render paths are now reactive to `setValue`.** Fields read their value
  with `form.getValues(field.key)` — a one-shot read that creates no
  subscription — so anything rendered from it froze at first render. A write
  from a sibling component (or any `setValue` that doesn't otherwise disturb
  `formState`) updated form state but not the UI. `reset()` was never affected,
  because it perturbs `formState` and re-renders the whole form, which is why
  this mostly went unnoticed. Every render-path read in `@nestledjs/forms` and
  `@nestledjs/forms-native` now goes through
  `useWatch({ control: form.control, name: field.key })`. Reads inside
  `useEffect` bodies and blur/change handlers are deliberately left as
  `getValues` — those want a snapshot, not a subscription. Three concrete
  symptoms fixed:
  - **Custom fields were effectively write-only.** The `value` handed to the
    `customField` render prop never changed, so a field that called its own
    `onChange` could not display what the user had just entered. Any
    `useWatch`/`useFormValue` workaround inside a custom field's own component is
    now redundant (harmless to keep); watches for *other* fields' values are
    still required.
  - **Read-only fields showed stale values** after a sibling wrote to them.
  - **Search-selects didn't show the new selection** when it was set externally.

- **Read-only search-selects rendered blank.** Separately from the above, the
  read-only path handed the raw form value (a scalar, e.g. `'x'`) to
  `displayValue`, which expects a whole option object (`value?.label`) — so the
  label resolved to `undefined` and nothing was displayed. Labels are now
  resolved from `options`, and read-only multi-selects list their selected
  labels instead of always rendering an empty string.

### 🏗️ Internal

- **`forms-native` now has a test suite.** It previously had no test target at
  all. React Native ships Flow-typed source that Vite cannot parse, so the
  package is tested with jest + React Native Testing Library
  (`forms-native/jest.config.cjs`, wired up as its nx `test` target) while the
  web packages stay on vitest. `nx affected -t test` — what CI runs — picks it
  up automatically. Note this adds jest, `@testing-library/react-native`,
  `test-renderer`, and `@react-native/babel-preset` as root devDependencies, so
  the lockfile changes and CI's `--frozen-lockfile` install needs it committed.

## 0.8.0 — 2026-07-22

First release since 0.7.8 (April 2026). This is a **breaking** release: the
biggest change is that Apollo/GraphQL is no longer bundled, and a few field
imports moved to subpaths. Most apps upgrade with a couple of small changes —
see **Migration** below.

### ⚠️ Breaking changes

- **Apollo is no longer bundled.** Search-select fields now fetch options
  through a pluggable adapter, so the main `@nestledjs/forms` bundle never
  imports `@apollo/client`. Apps without GraphQL pay nothing for it (bundle
  dropped from ~414 KB to ~114 KB). To keep using the Apollo-powered fields,
  wrap your app once, inside your existing `ApolloProvider`:

  ```tsx
  import { ApolloProvider } from '@apollo/client/react'
  import { ApolloSearchProvider } from '@nestledjs/forms/apollo' // requires @apollo/client v3 or v4

  <ApolloProvider client={client}>
    <ApolloSearchProvider>
      {/* your app */}
    </ApolloSearchProvider>
  </ApolloProvider>
  ```

  Using urql, TanStack Query, or plain `fetch` instead? Provide your own hook
  via `<SearchQueryProvider>` from `@nestledjs/forms-core` — any implementation
  of its `UseSearchQuery` type works, and `@apollo/client` never needs to be
  installed.

- **Phone field moved to a subpath.** Import the phone field from
  `@nestledjs/forms/phone` (it is code-split so non-phone apps don't pay for
  `react-phone-number-input`).

- **Required-only fields now enforce validation.** A field marked `required`
  with no other rules now actually blocks submit until filled. Forms that
  previously relied on required-only fields silently passing will now surface a
  validation error.

- **Themed validation errors on native / `noValidate` forms.** Error display now
  routes through the theme instead of native browser validation, so custom
  themes control the error UI. Check any custom error styling after upgrading.

- **Native submit pipeline change.** `@nestledjs/forms-native` now drives submit
  through a dedicated submit context; custom native submit wiring should be
  re-checked.

### ✨ Features

- **Localization via the `strings` prop.** Every user-facing string the library
  renders — loading indicators, "No results found", the default required error,
  aria-labels — can be overridden per form via `strings` on `Form` / `NativeForm`.
  Untouched keys keep their English defaults. See the `FormStrings` type in
  `@nestledjs/forms-core` for the full key list. Per-field `errorMessages.required`
  still wins over `strings.requiredError`.

- **`FormFieldClass.multiSelect(...)`** factory for multi-select fields.

- **`loadOptions` async search selects.** Search selects can now load options
  from any async source (REST / tRPC / `fetch`) via a `loadOptions(search)`
  callback — no GraphQL required.

### 🐛 Fixes & hardening

- Markdown rendering hardened against XSS.
- Timezone-related bugs fixed in the date/time helpers.
- Eliminated a double initial fetch in the search-select base.
- Accessibility fixes across field error states.
- `submitTransform` default handling and resolver required-enforcement fixes.

### 🏗️ Internal

- Shared web/native helpers consolidated into `@nestledjs/forms-core`
  (conditional state, submit transforms, validation resolver, date/time).

### Migration from 0.7.x

1. If you use Apollo search selects, add `<ApolloSearchProvider>` (from
   `@nestledjs/forms/apollo`) inside your `ApolloProvider`. If you use a
   non-Apollo GraphQL/REST client, wire `<SearchQueryProvider>` instead.
2. Update phone-field imports to `@nestledjs/forms/phone`.
3. Re-test any forms that use required-only fields — they now validate.
4. Re-check custom error styling on native / `noValidate` forms.
