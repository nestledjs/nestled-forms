# Changelog

All notable changes to the `@nestledjs/*` form packages are documented here.
The three packages — `@nestledjs/forms-core`, `@nestledjs/forms`, and
`@nestledjs/forms-native` — are versioned together.

## Unreleased

Zod 4 support and Standard Schema validation across all three packages. The
peer range grows — `zod@^3` keeps working — `@hookform/resolvers` is no longer
needed, and no public export is removed. One breaking detail is called out
under "Changed" below: `FormThemeSchema` is no longer a Zod schema object.

### ✨ Features

- **`zod@^3 || ^4` is the peer range.** All three packages previously declared
  `zod: "^3.0.0"`, so an app on Zod 4 could not install them cleanly. Both
  majors now work, and the publish gate type-checks the packed packages
  against each in turn.

  Neither major needs `@hookform/resolvers` any more (see "Changed"): the
  built-in resolver reads a schema through Standard Schema, which Zod 4 and
  Zod 3.24+ both implement, and through `safeParseAsync` on older Zod 3.

  `errorMessages` keys are the installed Zod's issue codes, and Zod renamed
  some between majors (`invalid_string` → `invalid_format`,
  `invalid_enum_value` → `invalid_value`; `too_small`, `too_big` and
  `invalid_type` are unchanged). The packages pass your key straight through
  and do not translate, so check the codes you key on when you upgrade Zod.
  See the README's "Schema validation setup".

- **`schema` accepts any Standard Schema validator.** On a field and on
  `<Form>` (web and native), `schema` now takes Zod, Valibot, ArkType or any
  other [Standard Schema v1](https://standardschema.dev) validator. Every
  Zod release in the peer range works, including Zod 3 releases older than
  3.24 that predate Standard Schema.

- **New schema exports from all three packages:** the `FormSchema` type (what
  `schema` accepts), the `StandardSchemaV1` type, `standardSchemaResolver`
  (the react-hook-form resolver `<Form>` uses for a form-level schema),
  `validateSchema` and `FORM_ERROR_KEY`. `InferSchemaType` now resolves for
  any Standard Schema validator, not only Zod.

- **New theme helpers,** exported from `@nestledjs/forms-core` and
  re-exported by `@nestledjs/forms`: `createDefaultFormTheme()` for a fresh
  complete theme with every class name `''`, `defaultFormTheme` for the shared
  one, and `resolveFormTheme(partial)` to fill a partial theme out — what
  `FormThemeSchema.parse()` did, under a name that says so.

### 🐛 Fixes

- **The default theme comes back complete.** `FormThemeSchema` was built from
  25 `z.object({…}).default({})` sections over 285 `z.string().default('')`
  leaves. Zod 4's `.default()` short-circuits — an absent input returns the
  given default *unparsed* — so the inner leaves never ran and
  `FormThemeSchema.parse({})` produced 25 empty sections instead of a theme.
  Every field then rendered with browser-default styling. On Zod 3 it worked,
  which is why the peer range was pinned there. Zod 4's replacement,
  `.prefault()`, does not exist in Zod 3, so no single spelling covered both.

  The theme no longer uses Zod at all: the defaults are a plain TypeScript
  literal and the merge is a small key-driven resolver with the same
  behaviour (unknown sections and keys stripped, absent values defaulted,
  element slots carried by reference). The default values themselves are
  unchanged — verified by diffing the old Zod 3 output against the new one
  key for key.

- **A Zod error with no issues no longer crashes validation.**
  `error.errors[0].code` was read unguarded, so an error carrying an empty
  issue list threw out of the validator instead of failing the field. Errors
  are now read structurally (`issues[0]`, with a generic message when there is
  no issue), which also works across both Zod majors — Zod 4 renamed
  `.errors` to `.issues` — and across a second copy of Zod in the tree, where
  the old `instanceof ZodError` check silently failed and every schema
  rejection degraded to "Invalid value".

- **An `errorMessages` override set to `''` falls back to Zod's message.** The
  register-rule path used `??` and the resolver path `||`, so the same empty
  override rendered a blank message on one and Zod's own message on the other.
  Both now use `||`.

- **A themed icon replaces the default instead of merging into it.**
  `createFinalTheme` laid the user theme over the Tailwind base with
  `lodash.merge`. A React element is a plain object, so a user's
  `readonlyCheckedIcon` was deep-merged *into* the default icon: the result
  carried the user's element type with leftovers of the default's props and
  children, so an overridden icon could render as a hybrid of the two. The
  merge is now a per-section copy that assigns element slots by reference.

  Dropping that call also drops the only `lodash-es` import in the three
  packages, which was being bundled into the published `@nestledjs/forms`:
  `index.js` goes from 109,278 to 88,825 bytes (−19%).

- **Register-time rules on nested keys run on submit.** A field keyed
  `address.phone` whose component registers its own `validate` rule (the
  phone field's format check, `useFieldValidation`) skipped that rule
  whenever the form had a resolver, because react-hook-form nests the
  registered fields by key and only top-level names were read. Those rules
  also now respect `validateWhen` and the active `validationGroup`, which a
  registered rule could not see.

- **`repository` in the three `package.json` files** pointed at a different
  repository. It now points here, with each package's `directory`, so the npm
  pages link to the right source after the next release.

### 🔄 Changed

- **`FormThemeSchema` is no longer a Zod schema.** It is still exported, and
  `.parse()` and `.safeParse()` behave as they always did for theme shapes, so
  normal use is unaffected. What is gone: `.extend()`, `.shape`,
  `.partial()`, and passing it to a form resolver. It was a theme-shape helper,
  never a validation schema for user input, and keeping it a `ZodObject` is
  precisely what pinned these packages to one Zod major — the emitted `.d.ts`
  carried Zod-3-only generics that do not resolve under Zod 4. If you need the
  resolved-theme type, use `FormTheme`; if you need to fill a partial theme,
  use `resolveFormTheme()`.

  `.parse()` on a malformed theme now throws a plain `Error` naming the
  failing path (`"textField.input" must be a string, received number`) rather
  than a `ZodError`, and `.safeParse()`'s `error` is typed `unknown`. Only
  reachable by passing a wrong-typed theme value.

- **`InputFieldOptions.schema` and the `<Form schema>` prop are typed
  `FormSchema`,** not Zod's `ZodTypeAny`. `FormSchema` is structural — any
  Standard Schema validator, or an older Zod 3 schema — so it resolves on
  both Zod majors and for other validators. Passing a Zod schema compiles as
  before. Code that reads a schema back off a field's options and calls Zod
  methods on it (`field.options.schema.parse(…)`) now needs a cast;
  `AnyZodSchema`, a Zod schema type that resolves on both majors, is exported
  for that.

- **`@hookform/resolvers` is no longer a peer dependency.** The form-level
  resolver is built in. It is safe to leave installed; these packages no
  longer import it. `zod` stays a required peer: the packages' types refer to
  it, and your app and the packages must share one copy.

- **Form-level Zod errors keep their shape:** the first issue per path, with
  the Zod issue code as the error `type`; an array-level issue at
  `items.root` beside its item errors; and an issue with no path (a
  `.refine()` on the whole object without `path`) under the empty key, now
  exported as `FORM_ERROR_KEY`, where it blocks the submit. One difference
  from `@hookform/resolvers`: a failed union reports the union's own issue
  rather than the flattened issues of its branches.

- **A field-level schema that throws** fails the field with the thrown
  message everywhere. Under `<Form>` it already did; a `RenderFormField` used
  with your own `useForm` and no resolver showed "Invalid value" instead.

### 📚 Documentation

- **README "Schema validation setup".** What to install (`react-hook-form`
  and `zod`, either major) and why Zod is a peer, a Valibot example, and
  which validators provide the issue codes `errorMessages` keys on. The
  install section at the top now names the peer dependencies too.

### 🏗️ Internal

- **`@hookform/resolvers` is gone from the workspace.** The root pinned `^5`
  while the packages declared `^3`, so the workspace advertised one major and
  developed against another.

- **The workspace dev-installs Zod 4** (4.6.6+, which clears the high-severity
  advisory `pnpm audit` reported under 0.9.1), plus `zod-v3`
  (`npm:zod@^3.25.76`) so the Zod 3 half of the peer range is still exercised.
  `pnpm test:zod3` re-runs the whole suite with `zod` aliased to that copy,
  and `pre-publish` runs it. It is deliberately not in PR CI: `verify-types`
  covers both majors on every run.

  `pnpm audit` still reports the Zod advisory, now against that Zod 3 test
  copy — its patched range is `>=4.6.6`, so no Zod 3 release fixes it. Keeping
  a Zod 3 copy is the cost of keeping `^3` in the peer range; it is a dev
  dependency and nothing ships it.

- **`tools/verify-published-types.mjs` type-checks the packed packages against
  both Zod majors,** naming the one that broke, and its consumer file now
  exercises the theme helpers, an element slot, and a field `schema:` built
  from the consumer's own Zod install.

- **`@nestledjs/forms-core` has a test target.** The root `vitest.config.ts`
  already listed its Vite config as a project, but that config had no `test`
  block, so no target was inferred and a spec added there would never have
  run. It now has one, with specs for the theme defaults, the resolver and the
  Zod error reading.

## 0.9.2 — 2026-11-10

Toolchain release across all three packages, which stay in lockstep:
`@nestledjs/forms` and `@nestledjs/forms-native` pin `@nestledjs/forms-core`
0.9.2. No API changes, and no dependency or peer range changes.

### 🐛 Fixes

- **`CustomField` builds its wrapper outside the `try`.** Your `customField`
  and `customWrapper` callbacks still run inside it, and a throw from either
  still renders the same "Error rendering custom field" state. Only the
  wrapper markup moved, which can't throw. Same in `@nestledjs/forms` and
  `@nestledjs/forms-native`.

### 🏗️ Internal

- **Nx 22.7.12 → 24.0.5, TypeScript 5.7 → 6.0, ESLint 9 → 10.** Builds now
  use Vite 8 (Rolldown), tests Vitest 4, and Storybook moves 9 → 10. The
  published files are the same set as 0.9.1 apart from content-hashed chunk
  names and one small `rolldown-runtime` chunk in `@nestledjs/forms`; every
  chunk keeps its `'use client'` banner.
- **eslint-plugin-react-hooks 7.** Its React Compiler rules are errors. The
  findings were fixed in code where that changed nothing, and otherwise kept
  with a one-line reasoned `eslint-disable-next-line`.

## 0.9.1 — 2026-10-25

Bug-fix release across all three packages. `@nestledjs/forms-core` changes too
(the nested-key fix below), so all three move to 0.9.1 and `@nestledjs/forms`
and `@nestledjs/forms-native` pin `@nestledjs/forms-core` 0.9.1.

Nothing is removed, and no dependency or peer range changes. One hook is
added: `useFieldError` (below).

### 🐛 Fixes

- **Pasted, dropped and autofilled values are registered.** A value set by a
  script — a password manager, a browser extension, some browser autofill —
  assigns the input's `.value` and then dispatches `input` or `change`. React's
  value tracker has already seen the new value, so it treats the event as "no
  change" and never calls `onChange`. The field showed the value while the form
  state stayed empty, so a `required` rule blocked the submit and the button
  appeared to do nothing until the user typed a key.

  `@nestledjs/forms` text, email, password, url and textarea fields now also
  sync from the native `input` and `change` events. Ordinary typing is
  unaffected: the native listener runs after React's handler and does nothing
  when the two already agree. `<Form>` also reads those fields' DOM values
  when it submits, as a last resort for autofill that fills an input without
  firing any event.

- **A blocked submit focuses the first invalid field.** `<Form>` now focuses
  the first field with an error in document order, so the reason a submit
  didn't go through is in front of the user. Previously react-hook-form's own
  focus reached only fields whose registered ref was the focusable element, so
  a controlled field such as a required checkbox was skipped.

- **A standalone `RenderFormField` shows its validation error.** The field read
  `useFormContext().formState.errors[key]`, which creates no subscription of
  its own. Inside `<Form fields={...}>` the form re-rendered and the message
  appeared; under your own `FormContext.Provider`, with the field inside a
  memoized section or any subtree that didn't re-render, a failed submit
  showed nothing and `aria-invalid` was never set. The field now subscribes
  with `useFormState({ control, name })` and reads its error with
  `get(errors, key)`, so dotted keys resolve too. Fixed in both
  `@nestledjs/forms` and `@nestledjs/forms-native`, through a new
  `useFieldError(name)` hook in `@nestledjs/forms-core` (re-exported by both)
  that custom field components can use the same way.

  If you added your own error rendering around a standalone `RenderFormField`
  to work around this, it will now show twice; remove it after upgrading.

- **Dotted field keys validate.** The field resolver in `@nestledjs/forms-core`
  read `values[key]` and wrote `errors[key]`, so a field keyed `address.city`
  was always validated as empty: a filled, required nested field could never
  be submitted. Values are now read with `get()` and errors written with
  `set()`, so nested keys validate and submit as `{ address: { city } }`.

### 📚 Documentation

- **README "Validation" section.** Covers Zod setup (`zod` 3.x and
  `@hookform/resolvers` are peer dependencies you install), the field rule
  options and how they combine, `errorMessages` keyed by Zod issue code,
  form-level schemas, nested keys, and using `RenderFormField` with your own
  `useForm`. It states plainly that Zod 4 and Standard Schema (Valibot,
  ArkType) aren't supported yet; that is separate, larger work.

### 🏗️ Internal

- **Dependency refresh.** `pnpm audit` went from 11 critical / 53 high /
  39 moderate / 8 low to 0 critical / 1 high / 5 moderate, through targeted
  bumps (nx 22.0.2 → 22.7.12, storybook 9.1.21, vite 7.3.7) and
  `pnpm.overrides` for transitive tooling packages. Every advisory was in
  build and test tooling, not in anything the packages ship. What remains:
  - `zod` (high): fixed only in zod 4.6.6. The packages target zod 3, and the
    workspace's own zod is a dev copy; your app's zod version is your choice.
    Moving to zod 4 is the separate item above.
  - `vitest` / `@vitest/mocker` (moderate): fixed only in vitest 4, which needs
    storybook 10's vitest addon. Test-time only.
  - The two `forms` advisories are false positives: the workspace directory
    `forms` is matched against an unrelated public npm package of that name.
- **`vitest>tinypool` is overridden to 2.x.** Vitest 3.2 depends on tinypool
  1.x, which has no patched release for its critical advisories; the full
  suite passes on tinypool 2.
- **`linkWorkspacePackages: true` in `pnpm-workspace.yaml`.** `forms` and
  `forms-native` pin an exact `@nestledjs/forms-core` version, which pnpm
  resolved from the registry, so a release that bumps all three left the
  lockfile uninstallable (and CI's frozen install red) until forms-core was
  published. The pinned version now links from the workspace when it matches.
  Published manifests are unchanged: they still name `"0.9.1"`.
- **New specs.** Paste (`user.paste`), `fireEvent.input`, script-set values
  with native `input` and `change` events, and event-less autofill, for text,
  email, password, url and textarea fields; focus on a blocked submit;
  standalone `RenderFormField` errors (top-level, `validate`, nested key,
  clearing, checkbox) in `forms` and `forms-native`; nested-key submit and
  error in `<Form>`. `@testing-library/user-event` is now a dev dependency.

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

  Reported by a downstream team, with a reproduction and root-cause analysis that were correct in
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
