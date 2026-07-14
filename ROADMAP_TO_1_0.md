# Roadmap to 1.0 — working plan

_Last updated: 2026-07-14. Committed on develop; update it as tasks complete._

## Where things stand

Four PRs are open, all fully green (CI, SonarCloud gate **and** zero open Sonar issues, GitGuardian):

| PR | Branch | Contents | Base |
|---|---|---|---|
| [nestled-forms #4](https://github.com/nestledjs/nestled-forms/pull/4) | `jbh/apollo-adapter-and-audit-hardening` | Apollo optional via adapter subpaths; all critical audit fixes (native submit, submitTransform defaults, resolver required-enforcement, timezone bugs, 414→114 KB bundle, markdown XSS, a11y errors); review-feedback + dedup + Sonar-smell fixes | `develop` |
| [nestled-forms #5](https://github.com/nestledjs/nestled-forms/pull/5) | `jbh/i18n-strings-and-multiselect-factory` | Localization (`strings` prop on Form/NativeForm, `FormStrings` in forms-core) + `FormFieldClass.multiSelect` | #4 branch |
| [nestled-forms #6](https://github.com/nestledjs/nestled-forms/pull/6) | `jbh/async-combobox-load-options` | `loadOptions` async search selects (REST/tRPC/fetch) + double-initial-fetch fix in SearchSelectBase | #5 branch |
| [nestledforms.com #2](https://github.com/nestledjs/nestledforms.com/pull/2) | `jbh/docs-apollo-adapter-sync` | 9 doc pages synced to the new APIs | `develop` |

### First action next session: merge day

1. Merge **#4**, then **#5** (GitHub auto-retargets it to `develop`), then **#6**.
2. Merge **nestledforms.com #2** (it documents #4's APIs — after the library PRs).
3. Delete the three `jbh/` branches; `git checkout develop && git pull`.
4. Verify develop CI is green.
5. Note: docs for the **#5/#6 features** (strings prop, loadOptions) are in the library READMEs but **not yet on nestledforms.com** — fold into the next docs batch (see "docs cadence" below).

## Remaining feature tasks (session task list #13–#20)

Work each as: feature + tests + README section in one branch/PR off `develop`; batch nestledforms.com pages every ~2 features. Order:

1. **#13 Slider field** (S/M) — `FormFieldType.Slider`, min/max/step, web `input[type=range]` themed (`sliderField` theme section); native via `@react-native-community/slider` optional peer + fallback; factory, both render switches, a11y (`aria-valuetext`), readOnly modes, stories.
2. **#14 Group/fieldset field** (M) — `FormFieldClass.group(key, { label, fields, showWhen })`; web `<fieldset>/<legend>`, native View+Text; children rendered via RenderFormField; flat keys (no nesting yet — document); pairs with `validationGroup`.
3. **#15 Typed field keys** (M) — opt-in `createFormFields<T>()` typed facade over FormFieldClass (`key: Path<T>`); type `showWhen/requiredWhen/disabledWhen/validateWithForm` callbacks as `(values: T)`; keep untyped API intact; `expectTypeOf` tests; new docs page.
4. **#16 File upload field** (L) — biggest gap. `accept/multiple/maxSize/maxFiles`, pluggable `uploadHandler: (file) => Promise<string>` (adapter philosophy), image preview, progress, drag-drop web; native via expo-document-picker/expo-image-picker optional peers; value = uploaded URL(s); deferred-upload option.
5. **#17 Repeater field** (L) — `useFieldArray`; child keys `${key}.${index}.${childKey}`; **requires dotted-path support** in resolver, error display (`formState.errors` traversal in RenderFormField), and submitTransform application — that's the real work; add/remove/reorder, min/maxRows.
6. **#18 Native optional-deps Metro strategy** — Metro fails builds on uninstalled optional packages (12 try/catch require sites, 4 packages), so fallbacks are unreachable. Ship a documented `metro.config.js` `resolveRequest` stub recipe in forms-native README + docs site; consider per-integration subpaths.
7. **#19 Native parity long tail** — wire `onSearchChange/loading/searchDebounceMs` remnants; native phone validation (or document web-only); honor or JSDoc-mark web-only options (`wrapperClassName`, `fancyStyle`, `fullWidthLabel`, `indeterminate`, readonly icons); align native theme keys with web (`timePicker`→`timePickerField`, split `searchSelect`), move hardcoded hex colors into theme, add zod schema + native theme-reference doc. Also: native switch shows 'On'/'Off' — decide whether to map to `strings.readOnlyYes/No`.
8. **#20 1.0 prep** — CHANGELOG.md consolidating breaking changes (Apollo provider, `/phone` subpath, required-only fields now validate, `noValidate` themed errors, native submit); migration-guide page on nestledforms.com; publish order forms-core (→0.2.0? or 1.0.0 across the board) then forms/forms-native with bumped forms-core spec; `pnpm pack` fresh-install smoke test. **Versions only bump at publish time** (standing rule).

## Standing constraints & gotchas (learned this session)

- **Docs-as-we-go**: every change updates the local README(s); nestledforms.com (`../nestledforms.com`, Markdoc pages in `src/app/docs/`) batched per few features. Docs site: run `pnpm format` before committing (Prettier CI check) and `pnpm test` (lint+type-check+build).
- **Stacked-branch workflow**: fix review feedback on the branch that introduced it, then merge upward (4→5→6). Expect small conflicts in `validation.ts` / `form.tsx` import blocks.
- **Sonar**: check BOTH the quality gate and the open-issues list (`api/issues/search?...&resolved=false`) — the gate passes while issues still decorate the PR. Duplication gate is 3% on new code; web/native twins are the usual culprits — share via forms-core (see `conditional-state.ts`, `conditional-field-wrapper.tsx`, `submit-transforms.ts` `createSubmitHandler`, `validation.ts` `buildFieldsResolver`, forms-native `use-text-field-default.ts`).
- **CI**: `pnpm-lock.yaml` must be regenerated after any package.json dependency change (frozen-lockfile CI).
- **Test flakes**: anything interacting with the lazy PhoneField (or future lazy fields) must use `findBy*` with generous timeouts (`{}, { timeout: 15000 }`), never `getBy*` — applies to stories' play functions and unit tests. Storybook chromium runner flakes under full `nx run-many` parallelism; rerun standalone (`npx vitest run --project storybook <name>`) to confirm.
- **Architecture cheat sheet**: Apollo adapter contract in `forms-core/src/lib/search-query-context.tsx` (+`apollo-search-provider.tsx`, only file importing @apollo/client); shared search hook `use-search-select.ts`; async combobox `use-load-options.ts`; localization `form-config-context.ts` (`FormStrings`); submit pipeline `submit-transforms.ts`; native submit context `forms-native/src/lib/native-form-submit-context.ts`; timezone-safe date helpers in `date-time.ts`.
- Deferred decision from audits: `validationDependencies` field option is typed/documented but unconsumed (phantom API) — implement or remove before 1.0.

## Definition of done for 1.0

All features above landed and documented (README + site); zero Sonar issues; CI green; changelog + migration guide published; packages published in order with the workspace pins updated; fresh-install smoke test of the published tarballs passes on a clean Next.js app and an Expo app.
