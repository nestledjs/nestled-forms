# Changelog

All notable changes to the `@nestledjs/*` form packages are documented here.
The three packages — `@nestledjs/forms-core`, `@nestledjs/forms`, and
`@nestledjs/forms-native` — are versioned together.

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
