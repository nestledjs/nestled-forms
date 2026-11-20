/**
 * Resolve aliases that point `zod` at a second, aliased zod install.
 *
 * The packages declare `zod: "^3.0.0 || ^4.0.0"`, so the suite has to be able to
 * run against either major. The workspace dev-installs zod 4 (the version that
 * clears the advisory in CHANGELOG 0.9.1) plus `zod-v3` — `npm:zod@^3.25.76` in
 * the root package.json — and `pnpm test:zod3` re-runs the same tests with
 * `NESTLED_ZOD_ALIAS=zod-v3` so the zod 3 half of that range is covered too.
 *
 * Tests only. `zod` stays in each package's `rolldownOptions.external`, so the
 * build never resolves it and published output is unaffected. With the variable
 * unset this contributes nothing.
 */
export function zodTestAlias(): Record<string, string> {
  const target = process.env['NESTLED_ZOD_ALIAS']
  return target ? { zod: target } : {}
}
