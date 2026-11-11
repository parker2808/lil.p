# CMS core C1–C3 extraction runbook

**Pushed B6b contract, not extraction evidence (2026-11-11):** #193 `e12774e` exposes `@parker2808/cms-core/theme.css` → `dist/theme.css`, copies `src/theme/theme.css` at build time, and keeps CSS via `sideEffects: ["./dist/theme.css"]`. The final isolated package must pack this built stylesheet, preserve the export/side-effect rule and light/dark `--builder-*` default, and prove a consumer import without fixture-owned CSS; lil.p's override changes token values only. The B6-only historical dry run below predates this export and does not prove it. D1 #194 `5c31773` also adds built ESM/CJS/types `./tree`; final integrated extraction must test that entry alongside `./contracts`, `./engine`, `./react` and `./react/server`, including tree no-loss/future-version rejection. Neither #193 nor #194 is yet an approved integrated extraction source.

**DRAFT — planning only; pending D2–D6, full verification, ordered merges and separate execution authorization.** Parker has approved a future **private** repository and `UNLICENSED` policy under approval (3), **not creation now**; this local rehearsal does not create or authorize a remote, release, migration or deployment. This runbook supplements the [Phase C draft](./2026-11-10-cms-core-distribution-c-draft.md) and [ADR](./2026-11-10-cms-core-adr.md). No private repository, package, credential, release, migration or deployment is created here. Never include a private repository name/URL, token value, personal content or credential-bearing command in this public repo, PR or build log. Parker alone provisions restricted read access after reviewing the chosen destination.

## Decision: preserve package history, then select distribution

### C1 gap-closure checklist (apply only after D2–D6, verification and ordered merges)

This is an **actionable extraction checklist, not a change to lil.p or a release**. The `3bbd1b2` rehearsal proved a 24-file allowlisted tarball, local ESM/CJS/CSS imports and a clean gitleaks scan of its retained history; it did **not** verify final D2–D6 code, all retained metadata or hosted installers. Start again from the approved integrated SHA, not the old rehearsal checkout. Keep the private destination uncreated until the authorized owner executes C1 after the gates.

1. **Root entry and export map:** inspect the final `packages/cms-core/package.json` exports in the integrated tree. The rehearsal's root `"."` was absent: decide with the consumer owners whether a root import is needed. If so, add a reviewed `"."` map to built `dist/index.js`, `dist/index.cjs` and `dist/index.d.ts` **only after** a real package-root entry exists, and test both `import` and `createRequire`; otherwise document subpath-only use and add a test rejecting assumed root imports. Preserve `./contracts`, `./engine`, `./react`, `./react/server`, `./tree` and `./theme.css` rather than guessing new paths. Test the **packed tarball**, not just monorepo workspace resolution.
2. **Standalone tooling:** replace the `../../tsconfig.base.json` extension in extracted `tsconfig.json` with the [local compiler options](#c1-dry-run-gap-closure--proposed-files-not-applied); add package-local `eslint.config.mjs` and `scripts/measure-cms-core.mjs` plus its test (copy and adjust root tooling, preserving budget and CSS checks). Redirect only the extracted package's test/script paths to local equivalents; drop or replace a theme test importing `apps/web`, never import the host to make isolation pass. Generate and freeze a standalone `pnpm-lock.yaml`; run `pnpm install --frozen-lockfile`, typecheck, lint, unit/export tests, dependency check, build and measurement **inside the isolated tree**.
3. **Dependency boundary:** inspect `src/**`, `test/**` and copied `scripts/**` for `apps/`, `@portfolio/`, root-relative paths and `workspace:*`; enforce absence in isolated lint and `check:deps`. Keep host golden tests in lil.p. A reduced scratch-only check is not a release gate: update it for any D2–D6 exports/peer changes and prove standalone import and `require` for each documented subpath.
4. **Pack and license:** apply the [proposed `package.json` `files`/license diff](#c1-dry-run-gap-closure--proposed-files-not-applied) to the extracted manifest only; include `dist/**`, `README.md` and private `LICENSE`, exclude source, fixture assets, tests, credentials and scripts. Use `"license": "UNLICENSED"` with Parker-approved proprietary wording, then inspect third-party notices and installed runtime/peer/transitive licenses on the **final** lockfile; prior MIT peer findings are not final clearance. Review `pnpm pack --dry-run --json` file by file and gitleaks **full retained history, commit metadata and tarball** before any private push.
5. **Post-D2–D6 replay:** rerun the history-preserving split and every standalone/consumer gate on the actual merged candidate after final D6 fixes: versioned tree/draft read, server-safe SSR and theme, import/require/type resolution, bundle caps, neutral B7 fixture, EN/VI and legacy/future snapshot contracts. Record exact source SHA, pack checksum, scan report, CI run and rollback compatibility. Only then proceed to C2 private CI/release review and the separate C3 pinned consumer-switch PR; no credentials or repository are created by this docs change.

Choose a **history-preserving, package-path-filtered extraction** over a fresh import, subject to a full-history secrets/PII/license audit **before any private push**. On a separately authorized, isolated copy of the _approved integrated source_, use a reviewed `git filter-repo --subdirectory-filter packages/cms-core` workflow. `git-filter-repo` was absent locally in the 2026-11-11 dry run; **the previous draft had no fallback**. For a no-install **dry run only**, built-in `git subtree split --prefix=packages/cms-core --branch extracted HEAD` preserved the package-specific history. This is a documented experimental fallback, not yet an approved substitute for `git filter-repo` in the final extraction. Compare resulting commits, author attribution, file list and exports to the source package. A fresh import erases the provenance needed to review changes and audit v0.1.0; if history contains unremovable sensitive data, **stop and ask Parker to approve a redacted-history or fresh-import exception** instead of preserving it blindly. Filtering the package path alone does not prove safe commit metadata, history, generated artifacts, dependency licenses or indirect references. Do not copy host definitions, fixtures with personal data, app modules or private source just because a historical commit mentions them.

The current B4 `8c448ea` source is still a **monorepo package**, not ready for an isolated repo: `packages/cms-core/package.json` builds with `node ../../scripts/measure-cms-core.mjs`, and its test script invokes `../../scripts/measure-cms-core.test.mjs`; the measurement script expects `packages/cms-core/{src,dist,package.json}` relative to the root. After filtering, adapt/copy only the reviewed generic measurement tooling and tests into the isolated package, change paths/scripts, then prove the same gzip limits and no host imports. B6 additionally owns the forthcoming `./react/server` export and these scripts: **freeze its accepted output before extracting**, not B4's empty React entry. Recheck every entry's built ESM/CJS/types and the React server/client directive boundary; do not assume extraction preserves a working build.

## Local C1 extraction dry run (2026-11-11; not a release)

Evidence came from a **throwaway `git clone --no-local` of lil.p**, checking out the then-latest pushed `feat/cms-b6-react` SHA `9e356db2fbccdec93a5183589b3e29966b374e94` (verified against its remote head). No remote was created or pushed. `git-filter-repo` was not installed; `git subtree split --quiet --prefix=packages/cms-core --branch extracted HEAD` produced `8cf4fd8d516f104a035dcf7c6af45d87734f0b26`, **six retained commits and 14 tracked files** (package files only). This is **B6 alone**, not an approved integrated B5+B6+B6b/B7 source: its `src/engine.ts` still exports nothing, and it has no core theme subpath. Do not present this smoke as validation of B5's engine behavior, B6b defaults, production auth or a release candidate. The scratch directory and tarball were deleted after the run.

| Gate / exact dry-run command                                                                                                   | Observed result and required production fix                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| ------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Unchanged extracted `pnpm run build`, `pnpm run test`, `pnpm run typecheck`, `pnpm run lint`                                   | Build/test DTS generation failed: `tsconfig.json` extends missing `../../tsconfig.base.json`; typecheck lost ES2022 settings. Lint cannot find root `eslint.config.mjs` and its root-only ESLint dependencies. Copy/review a **standalone generic** tsconfig and ESLint configuration with local devDependencies, or replace the extends, then check lint/typecheck under Node 22/pnpm 10. The initial diagnostic used a global pnpm 12 before explicitly selecting pnpm 10; it is not release evidence.                                                                                                                                                                               |
| Adapted scratch `pnpm install --frozen-lockfile`, `pnpm run build`, `pnpm run test`, `pnpm run typecheck`                      | **Pass on Node 22/pnpm 10.34.9** after adding a package-local `packageManager`, inlining ES2022 compiler options, moving/adapting the generic measurement script and its test into `scripts/`, and fixing the test's relative import. Build emits four typed ESM/CJS subpaths; **11/11** package/measurement tests pass. Measured gzip: contracts+engine **864/61,440 B** (engine empty), React+server **1,621/35,840 B** (server **447 B**). The test script's nested `pnpm build` picked up global pnpm 12 until the scratch PATH selected the cached pnpm 10 binary; pin the toolchain in isolated CI.                                                                              |
| Scratch `pnpm run check:deps`                                                                                                  | A package-local, explicitly **reduced** check passed: no `workspace:*` in package dependencies and no `@portfolio/` or `@/modules/` imports in `src`. The root `scripts/check-deps.mjs` is monorepo-specific and outside the filtered tree; port/review all relevant import-boundary assertions and ESLint restrictions into standalone CI rather than claiming this reduced check matches the full root check. No package dependency used `workspace:*` at this head; lil.p consumers still do.                                                                                                                                                                                       |
| Scratch `pnpm pack --pack-destination ..`; scratch consumer `pnpm install`, `node smoke.mjs`, `pnpm install --frozen-lockfile` | **Pass:** local `file:` tarball installation with React 19/React DOM 19/Zod 4 peers; `./contracts`, `./engine`, `./react`, `./react/server` resolve independently through ESM `import` and CJS `require`. `createRegistry`, `schemaToFields` and `renderBlocks` are callable; **engine resolves but has no B5 symbols** on B6-only head. Tarball includes `dist`, **also `src`, `test`, `scripts`, tsconfig and tsup config** because there is no `files` allowlist: add a reviewed package-files allowlist, inspect the final tarball and verify the final version/private/release policy. This is a local handoff only; Vercel/Render and private Git/registry auth remain untested. |
| `gitleaks git --redact --log-opts=HEAD --report-path=/dev/null` on extracted HEAD, plus counts-only commit/patch PII checks    | Gitleaks exited **0** for the six retained commits; no email-like strings in retained patch text. All six commits carried an email-formatted, **non-noreply** author identity (one distinct author name); commit metadata must receive a private-review PII decision **before any sharing**. No values, identities or findings were printed or committed. The package has no tracked LICENSE/COPYING file; review license provenance and notices before a real release. This is a bounded scan, not proof that all future integrated history or packed artifacts are safe.                                                                                                             |

**Remaining extraction fixes:** update the package README's broken `../../docs/specs/` links; move only generic measurement/test tooling, keep B1 host goldens in lil.p, and add standalone lint, dependency-boundary, pack-files and release/CI checks. Re-run this entire matrix from a **reviewed integrated** B5/B6/B6b/B7 SHA with nonempty engine and core-owned theme before choosing Git/registry distribution. Preserve the full source SHA and filtered-commit mapping in the authorized private review without publishing historical author details here.

## C1 readiness refresh at D base `3bbd1b2` (2026-11-11; local only)

**Provenance and scope:** verified `origin/feat/cms-d-base` at `3bbd1b23397862c759d9fc49be3e39e586c6cd41`. In an isolated `/tmp` `git clone --no-local`, `git subtree split --quiet --prefix=packages/cms-core --branch extracted HEAD` retained **22 package-history commits, 28 tracked files**, extracted tip `74b597021f2d67873cff3b5a95b7b1c91772801c`. This is a local split, not a `git filter-repo` rehearsal or a private-repo push. Gitleaks on retained history exited 0 with explicit JSON report format and redaction; one distinct author-metadata value remains for a **private** PII review (no values reported). The throwaway clone/tarball were deleted after this check. No D2–D6 code is present at this source SHA.

| Gate                                       | Result on adapted `/tmp` copy                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Unadapted package                          | Still monorepo-bound: `tsconfig.json` extends `../../tsconfig.base.json`; build/test scripts and two tests import root measurement scripts; theme's optional browser test imports `apps/web`; there is no package-local ESLint, dependency-check script, license file, `files` allowlist or package-local lockfile. The package-root `.` export is **absent** at this SHA: only `./contracts`, `./engine`, `./tree`, `./react`, `./react/server` and `./theme.css` are exported. Ask whether a root entry is needed; do not add one implicitly.                                                                                                                                                                                                                          |
| Adapted standalone, Node 22 / pnpm 10.34.9 | Local tsconfig and ESLint from the proposed snippets, `UNLICENSED` + proprietary LICENSE, package-local `scripts/` measurement/test, a reduced package-local `check:deps`, and local-only test/README path fixes yield **typecheck, lint, dependency check, build and unit pass: 28 passed, 1 optional browser test skipped**, no browser started. First offline install lacked `joycon` metadata; public-registry install with token-related environment variables unset succeeded, followed by a **frozen offline reinstall**. Original copied lint failed on import order; the untouched theme test assumed browser bytes exclude tree (2,433 B) and failed until its assertion included `sizes.tree`. These scratch fixes are **not** edits to the in-stack package. |
| Bundle and archive                         | Browser contracts+engine+tree **5,670/61,440 B**, React+server **1,621/35,840 B** (server **447 B**); CSS **1,659 B** separately. `pnpm pack --dry-run --json` enumerated **24 files**: only built `dist/**` (including CSS and `.d.ts`/`.d.cts`), `package.json`, README and LICENSE; no `src`, tests, scripts, fixture or host asset paths. The generated tarball was also inspected. A scratch consumer installed the tarball with a frozen offline reinstall and loaded **five JS subpaths by ESM and CJS**, resolved CSS via the export map, and confirmed the root import fails with `ERR_PACKAGE_PATH_NOT_EXPORTED`. Node does not execute CSS imports; this proves path resolution, not browser CSS rendering.                                                   |
| License and release                        | No core runtime dependencies at this SHA. Installed peers **react 19.3.1, react-dom 19.3.1, zod 4.6.7: MIT**; local development-tool dependency audit (`pnpm licenses list --json`) grouped 112 MIT, 13 Apache-2.0, 6 BSD-2-Clause, 2 BSD-3-Clause, 6 ISC and 1 BlueOak-1.0.0 entries. An adapted private `LICENSE` and `license: UNLICENSED` pack successfully. Package version is still `0.0.0`, `private: true`; **no v0.1.0 or publication** was tested. Verify complete transitive notices, metadata rights and final source after D2–D6.                                                                                                                                                                                                                           |

**Remaining delta against the earlier B6-only dry run:** B5 engine, B6b core theme and D1 tree now build and resolve from the combined source; standalone root-config/script/test assumptions and broken README links **still need deliberate extraction-only fixes**. Add tree to the copied measurement script and update theme's browser-total assertion; move the browser-only host `createRequire(apps/web)` behind an explicitly optional package-local Playwright dependency **or leave browser testing to B7 without dropping its coverage**. Reconcile whether a root `.` export is required; the existing six public subpaths are complete without it. The local `check:deps` smoke only rejects workspace dependencies/host import strings; it is not equivalent to the monorepo `scripts/check-deps.mjs` or an exhaustive static import-boundary test. Standalone CI must separately assert frozen installs, pack allowlist and types/resolution from the tarball; local consumers cannot prove hosted auth, Docker, Vercel or Render. Retain the source's browser-computed theme evidence in its authorized fixture gate rather than running it here.

### Read-only D-tip audit (2026-11-11; not a standalone build)

Fetched `origin/feat/cms-d6-verify` at `384d324` and `origin/feat/cms-d5-props` at `430672d`. These are **separate heads**, not an already tested D5+D6 extraction source. D6 has 30 tracked package files; D5 adds `src/tree/autosave.ts`, `src/tree/editing.ts` and `test/tree-editing.test.mjs` relative to its D-base ancestor and updates `src/tree.ts`/`README.md`. The earlier 24-file pack, measurements and license/history scans were on `3bbd1b2`, **not** these heads. Freeze and re-audit the actual integrated SHA.

**Exact D6 file inventory** (relative to `packages/cms-core/`; carry the three D5 additions when integrated):

- Root: `README.md`, `package.json`, `tsconfig.json`, `tsup.config.ts`.
- Entrypoints/theme: `src/contracts.ts`, `src/engine.ts`, `src/tree.ts`, `src/react.ts`, `src/react/server.ts`, `src/theme/theme.css`.
- Engine: `src/engine/ordering.ts`, `src/engine/policy.ts`, `src/engine/ports.ts`, `src/engine/snapshot.ts`.
- React: `src/react/SchemaForm.ts`, `src/react/editor-metadata.ts`, `src/react/fields.ts`, `src/react/tree-renderer/render.ts`.
- Tree: `src/tree/legacy.ts`, `src/tree/migration.ts`, `src/tree/schema.ts`, `src/tree/schema.typecheck.ts`, `src/tree/validation.ts`.
- Tests: `test/contracts.test.mjs`, `test/engine.test.mjs`, `test/exports.test.mjs`, `test/react-exports.test.mjs`, `test/theme.test.mjs`, `test/tree-contract.test.mjs`, `test/tree-renderer.test.mjs`.

| Status                                     | Current evidence and required C1–C3 action                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ready to carry; standalone recheck pending | `package.json` declares five JS public subpaths (`./contracts`, `./engine`, `./tree`, `./react`, `./react/server`) with ESM/CJS/types, plus `./theme.css` and CSS `sideEffects`. `tsup.config.ts` builds the JS entries and copies the stylesheet, preserving `"use client"` only on `./react`. The inspected `src/**` imports only internal modules and Zod, not lil.p apps/contracts or portfolio definitions. Preserve neutral light/dark `--builder-*` CSS and token-only brand overrides. Keep the independent B7 fixture and its branded/neutral screenshots in lil.p, **not** the private package.                                                                                                                                                                                                                                                                                                 |
| Missing metadata                           | At the D6 head `package.json` is `0.0.0`, `private: true`, and has no `license`, `files`, `engines`, `packageManager`, `publishConfig` or root `.` export. For reviewed `v0.1.0` add `UNLICENSED`, a proprietary `LICENSE`, `files: ["dist/**", "README.md", "LICENSE"]`, Node 22 and pnpm 10 constraints. Keep `private: true` for an approved local Git/tarball flow; change it and add registry-specific `publishConfig` only for a separately approved registry release, never with credentials. Current consumers use subpaths; a root `.` export is **not needed** unless a real consumer and ESM/CJS/types tests justify it. Audit final React 19/React DOM 19/Zod 4 peers, transitive notices and retained commit metadata.                                                                                                                                                                       |
| Blocker: standalone tooling                | `tsconfig.json` extends `../../tsconfig.base.json`; `package.json` build/test reach `../../scripts/measure-cms-core.mjs` and its test, while lint needs root `eslint.config.mjs`. There is no local lockfile, `check:deps` or LICENSE. Apply the standalone snippets below, copy/adapt both generic measurement scripts, generate a frozen lockfile and enforce the existing 60/35-KiB JS caps including `./tree`. Do not replace the host's B1 goldens.                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| Blocker: test isolation                    | `test/react-exports.test.mjs:11`, `test/theme.test.mjs:8` **and `test/tree-renderer.test.mjs:12`** import the root measurement script. Browser-only tests in `test/theme.test.mjs:131` and `test/tree-renderer.test.mjs:272-277` load Playwright via `apps/web`; the latter also reads `examples/cms-core-fixture/public/illustration.svg`. Relocate all three script imports. Either supply reviewed package-local neutral browser inputs and optional tooling, or leave browser proof in the separately gated B7 fixture; never silently report these optional tests as passing standalone. Include D5's package-local tree-editing test after integration.                                                                                                                                                                                                                                             |
| Missing docs and private CI                | Rewrite package `README.md` links into `../../docs/specs/` and stale entry/budget descriptions. Create a standalone `CHANGELOG.md` with extraction provenance/source SHA and a concise approved ADR contract excerpt, not a copy of host docs or personal content. Private CI must pin Node 22/pnpm 10, frozen-install, lint/typecheck/unit/dependency-boundary/build/measurement, scan full retained history and package contents without printing findings, inspect pack allowlist/checksum, and import/require/type-resolve all five JS entries plus CSS from the **packed** consumer. Retain B7 neutral theme/EN/VI/AA/responsive and D6 parity/golden evidence as separate host gates.                                                                                                                                                                                                               |
| C3 unverified                              | Four consumer manifests still use `workspace:*`: `apps/api/package.json:32`, `apps/web/package.json:16`, `packages/contracts/package.json:23`, `examples/cms-core-fixture/package.json:16`. Switch **all four** in a separate reviewed PR, regenerate/freeze the lockfile and test installed CJS API and server-safe web SSR. Both Docker deps stages copy the in-workspace core manifest and API builds it before `pnpm deploy --prod --legacy`; adapt those stages for the chosen pinned artifact and prove no credential reaches the image. `render.yaml` build filters omit `packages/cms-core/**` today; review final package/lockfile triggers. `scripts/vercel-ignore-build.sh` intentionally skips non-main preview builds, not proof of a hosted install. Registry/private-Git/tarball access and lifecycle in CI, Vercel and Render remain **unverified**; Parker provisions access separately. |

**Ordered C1–C3 gate:** freeze the integrated source SHA and inventory; filter package history into an isolated local copy; review retained metadata, dependencies, provenance and redacted scan results **before any private push**; apply standalone config/scripts/README/CHANGELOG/ADR excerpt/LICENSE/lockfile; frozen-install and run isolated lint/types/boundary/unit/build/size/pack/consumer tests; confirm B7 browser-theme and D6 full route/golden gates against that exact SHA; only then may the authorized owner create the private destination and review its CI/release. Follow with a separate C3 PR updating four consumer manifests, trusted install paths and rollback to the last compatible pinned build. This read-only audit created no repository, package, credential or deployment.

**Exact future C1–C3 command sequence (only after approval and verification; replace non-secret example paths/SHA first; no credential values in commands):**

```sh
# C1: authorized local extraction from an approved, integrated source SHA.
SOURCE_CHECKOUT=/path/to/approved/local/lilp
APPROVED_SHA=full-reviewed-integrated-sha
SCRATCH_DIR=$(mktemp -d /tmp/cms-core-c1-XXXXXX)
git clone --no-local --no-checkout "$SOURCE_CHECKOUT" "$SCRATCH_DIR/source"
git -C "$SCRATCH_DIR/source" fetch "$SOURCE_CHECKOUT" "$APPROVED_SHA"
git -C "$SCRATCH_DIR/source" checkout --detach "$APPROVED_SHA"
git -C "$SCRATCH_DIR/source" subtree split --quiet --prefix=packages/cms-core --branch extracted HEAD
git clone --no-local --branch extracted "$SCRATCH_DIR/source" "$SCRATCH_DIR/core"
# Adapt only the reviewed isolated-package config/scripts/tests/README/LICENSE below; do not change lil.p here.
cd "$SCRATCH_DIR/core"
pnpm install --lockfile-only
pnpm install --frozen-lockfile
pnpm run typecheck && pnpm run lint && pnpm run check:deps && pnpm run test
pnpm pack --dry-run --json
pnpm pack --pack-destination "$SCRATCH_DIR"
gitleaks git --redact --log-opts=HEAD --report-format json --report-path="$SCRATCH_DIR/history-scan.json"

# C2: in the separately authorized private destination, after full-history/metadata/license review.
pnpm install --frozen-lockfile
pnpm run typecheck && pnpm run lint && pnpm run check:deps && pnpm run test
pnpm pack --dry-run --json
# Review the v0.1.0 manifest, package files, checksum, standalone CI and approved distribution before any tag/publish.

# C3: a separate reviewed lil.p consumer-switch PR, after Parker chooses an exact pinned source.
# Replace each consumer's workspace:* with the approved exact pinned specifier in its manifest, then:
pnpm install --lockfile-only
pnpm install --frozen-lockfile
pnpm --filter @portfolio/contracts build
pnpm --filter @portfolio/api build
pnpm --filter @portfolio/api deploy --prod --legacy /path/to/isolated-output
# Validate installed ESM/CJS/types/theme paths, SSR boundary and platform build filters in trusted CI.
```

Use the existing [C3 secret-location plan](#c3-consumer-switch-and-deploy-readiness-gate) for Parker's later read-only **variable names/locations only**; never place credentials in commands, manifests, git URLs or logs. These are instructions, not permission to run deployment, database migration or a new repository. **After D2–D6 and before any C1 release**, repeat the split from the final integrated SHA; compare retained history/author metadata, rerun redacted scans and license/notices review, standalone frozen install/lint/typecheck/dependency/unit/build, 24-file **policy** (not hard-coded file count), pack/consumer ESM+CJS/types/CSS export checks, bundle caps, D1 snapshot no-loss tests, EN/VI/AA/theme and SSR/public parity, and the authorized D6 verification. A `main` deploy with D2 DDL needs its own authorization and rollback-read proof.

## C1 dry-run gap closure — proposed files, not applied

The following **ready-to-apply proposal is for an authorized, isolated extracted tree only**. It does not change the in-stack `packages/cms-core` manifest (B6b/D1 own its live exports), create a repository, install dependencies or publish anything. Start from a reviewed integrated SHA; preserve its exact `./contracts`, `./engine`, `./tree`, `./react`, `./react/server` and `./theme.css` exports and `sideEffects`, rather than replacing the manifest with an older B6-only copy. The source package currently has **no runtime `dependencies`**, only React 19, React DOM 19 and Zod 4 peers. Pin the package-local pnpm toolchain and regenerate a new standalone lockfile **after** applying these snippets in the authorized environment.

**Standalone `tsconfig.json` (replace the `../../tsconfig.base.json` extends entirely):**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noEmit": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "isolatedModules": true,
    "resolveJsonModule": true,
    "verbatimModuleSyntax": true
  },
  "include": ["src"]
}
```

**Standalone `eslint.config.mjs` (new file):** use only package-local tooling; forbid host imports independently of the separate root dependency check.

```js
import eslint from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist/**', 'node_modules/**'] },
  eslint.configs.recommended,
  tseslint.configs.recommended,
  {
    plugins: { 'simple-import-sort': simpleImportSort },
    rules: {
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@portfolio/*', '@/modules/*', 'apps/*', 'packages/*'],
              message: 'Import only package or public peer modules.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['scripts/**/*.{js,mjs}', 'test/**/*.{js,mjs}'],
    languageOptions: { globals: { console: 'readonly', process: 'readonly' } },
  },
  eslintConfigPrettier,
);
```

**Package-local `package.json` diff (apply to the integrated manifest only):** the original `private: true` remains until Parker chooses distribution. The `files` list includes generated CSS and type declarations through `dist/**`; do not pack source, tests, scripts or test fixtures. Built output and `package.json` are retained, and `README.md`/`LICENSE` are explicit. Preserve all other fields/exports/peer versions.

```diff
 "private": true,
 "packageManager": "pnpm@10.34.9",
 "license": "UNLICENSED",
 "files": ["dist/**", "README.md", "LICENSE"],
 "scripts": {
-  "build": "tsup && node ../../scripts/measure-cms-core.mjs",
+  "build": "tsup && node scripts/measure-cms-core.mjs",
   "lint": "eslint .",
   "typecheck": "tsc --noEmit -p tsconfig.json",
-  "test": "pnpm build && node --test test/*.test.mjs ../../scripts/measure-cms-core.test.mjs"
+  "test": "pnpm build && node --test test/*.test.mjs scripts/measure-cms-core.test.mjs"
 },
 "devDependencies": {
+  "eslint": "^10.13.0",
+  "@eslint/js": "^10.0.1",
+  "typescript-eslint": "^8.72.0",
+  "eslint-config-prettier": "^10.1.8",
+  "eslint-plugin-simple-import-sort": "^14.0.0"
 }
```

The diff is a **field-level insertion/replacement guide**, not a literal patch containing every unchanged manifest key; preserve the accepted `./theme.css`/`sideEffects` and `./tree` ESM/CJS/types when applying it. Fix the package README's `../../docs/specs/` links by replacing them with a package-local public-API summary, not by copying host docs into the extracted repository. Keep B1 host goldens out of the package. `pnpm pack --pack-destination <scratch-dir>` and archive inspection must prove the allowlist: only package manifest, README, LICENSE and built `dist/**` (including CSS) are present; no `src`, `test`, `scripts`, credentials or host assets. Confirm `pnpm install --frozen-lockfile` and the isolated tarball consumer again.

**Measurement-script relocation (copy both reviewed root scripts from the approved integrated source into extracted `scripts/`, then apply this exact relative-path/entry diff to `scripts/measure-cms-core.mjs`):** use B6b's existing CSS measurement, peer, forbidden-host-import, unbundled-import and cap checks, not the older B6-only scratch script. D1's tree entry must contribute to the browser cap; B6b already measures CSS separately, never as JS. If the integrated cap differs from B3's 60/35 KiB caps, obtain a reviewed budget change rather than silently raising a threshold.

```diff
 const root = join(dirname(fileURLToPath(import.meta.url)), '..');
-const source = join(root, 'packages/cms-core/src');
-const dist = join(root, 'packages/cms-core/dist');
-const packageFile = join(root, 'packages/cms-core/package.json');
+const source = join(root, 'src');
+const dist = join(root, 'dist');
+const packageFile = join(root, 'package.json');
 const caps = { browser: 60 * 1024, react: 35 * 1024 };
@@
 const entries = ['contracts', 'engine', 'react'];
+if (packageExports['./tree']) entries.push('tree');
 if (packageExports['./react/server']) entries.push('react/server');
@@
-  browser: sizes.contracts + sizes.engine,
+  browser: sizes.contracts + sizes.engine + (sizes.tree ?? 0),
   react: sizes.react + (sizes['react/server'] ?? 0),
```

Keep B6b's existing conditional `sizes.css` gzip block and separate theme printout **unchanged**; do not add it twice. In the copied `scripts/measure-cms-core.test.mjs`, keep the existing `./measure-cms-core.mjs` import unchanged; add a fixture with `./tree` and `./theme.css` exports, built `tree.js` and `theme.css`, asserting browser totals include tree bytes and CSS is measured separately. In extracted `test/react-exports.test.mjs`, `test/theme.test.mjs` **and `test/tree-renderer.test.mjs`**, change `../../../scripts/measure-cms-core.mjs` to `../scripts/measure-cms-core.mjs`. Add `./tree` ESM/CJS/types resolution in the existing export test; do not replace B5/B6 assertions. After D5 integration, include `test/tree-editing.test.mjs` and its `./tree` exports. Run `pnpm build`, `pnpm test`, `pnpm typecheck`, `pnpm lint`, the isolated import-boundary check and a tarball ESM/CJS consumer before claiming standalone readiness. These are future authorized checks, not commands run by this docs PR.

**License gap and read-only audit (2026-11-11):** the B6b manifest lists no runtime dependencies; its peers are `react ^19`, `react-dom ^19`, `zod ^4`. The local installed peer manifests report **react 19.3.0 MIT, react-dom 19.3.0 MIT, zod 4.6.7 MIT**; no package-owned LICENSE/COPYING file was tracked at the reviewed B6b SHA. This is a package-manifest audit, **not** a transitive/deployment or integrated-SHA license clearance. Recommend `"license": "UNLICENSED"` and a standalone private `LICENSE` file (below), subject to Parker's decision and counsel review; preserve third-party peer license/notice obligations even though these peers are not vendored. Do not infer an open-source license for the core from MIT peers. Proposed `LICENSE` contents:

```text
Copyright (c) 2026. All rights reserved.

This software is proprietary. No permission is granted to use, copy, modify,
or distribute it except under a separate written agreement.
```

For a future release, audit the **approved integrated** dependency graph, source history, notices and package tarball again. If Parker elects open source, replace both `UNLICENSED` and this proposed text only after his explicit licensing decision. No ownership, legal status or distribution permission is established by this draft.

## C1: distribution and cost/auth decision

| Candidate                                          | Reproducible input and present tooling                                                                                                                           | Unverified gate before choosing                                                                                                                                                                                                                                                            |
| -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| GitHub Packages, conditional preference            | Exact `@parker2808/cms-core` release version and frozen pnpm lockfile; no Git executable needed in the current `node:22-alpine` deps stage.                      | Verify private package read/publish permissions, free-tier storage/bandwidth and trusted GitHub Actions, Vercel and Render **build-time** authentication; a free account alone is not proof of zero cost.                                                                                  |
| Private Git dependency pinned to a full commit SHA | pnpm 10 supports Git repository dependencies with a commit hash; freeze resolved commit in lockfile and build package artifacts deterministically.               | Verify read-only Git access and `git` installation inside API Alpine deps stage, Vercel/Render checkout and pnpm Git dependency build lifecycle. Do not put credentials in Git URLs, Docker layers or install logs.                                                                        |
| Local pnpm tarball (`file:` `.tgz`)                | pnpm 10 supports local tarball dependencies and `pnpm pack`; an approved CI build can hand a package artifact to each trusted installer without a paid registry. | **Hunch:** artifact handoff between separate Vercel/Render builds may not be feasible without an approved storage channel. Do not commit a private tarball or assume the CI artifact is reachable by either host; test frozen-install, integrity and provenance in each environment first. |

The current `pnpm-workspace.yaml` includes only `apps/*` and `packages/*`; root `package.json` pins pnpm `10.34.9`. A Git or tarball source cannot simply substitute for `workspace:*` in a filtered package's internal dependencies; verify all package dependencies and packed files independently. References: [pnpm 10 package sources](https://pnpm.io/10.x/package-sources), [pnpm pack](https://pnpm.io/10.x/cli/pack), [pnpm deploy](https://pnpm.io/10.x/cli/deploy), [GitHub history split guidance](https://docs.github.com/en/get-started/using-git/splitting-a-subfolder-out-into-a-new-repository).

## C2: isolated package release gate

1. After D6/full verification and explicit approval, freeze a reviewed lil.p SHA and filtered package file inventory; scan **all retained Git history**, file contents, commit metadata and release artifact for secrets, PII, confidential assets, license notices and dependency provenance. Stop on findings; do not log their values.
2. In a private, access-reviewed destination created **only by an authorized owner**, adapt generic scripts, remove monorepo-relative assumptions, document exports and peer requirements (React 19/Zod 4) in a package README, and maintain a standalone changelog with the source SHA and extraction-method record.
3. Run isolated CI on Node 22/pnpm 10 with frozen install, lint, types, unit/contract tests, built import+`createRequire` export resolution, directive/import-boundary checks, gzip measurement, neutral fixture smoke and artifact-file inspection. The source CI must have no host aliases or lil.p path imports; sensitive scans fail closed without publishing results containing values.
4. Review a `v0.1.0` candidate and its packed file list, checksum/provenance, security review and CI results. Only after a separate authorization may the owner tag/publish or make consumers install it. Do not rewrite the B1 goldens or change any builder data as part of extraction.

## C3: consumer switch and deploy-readiness gate

In a separate reviewed lil.p PR, replace `workspace:*` with the **approved exact registry version, full Git SHA, or verified local tarball reference** for every actual consumer and regenerate the lockfile with a trusted frozen reinstall. Document `CMS_CORE_READ_TOKEN` as a **placeholder variable name only** for Parker's protected local package-manager/credential-helper configuration, trusted GitHub Actions repository/environment secret, Vercel project build setting and Render **build-time** secret mechanism (if the chosen installer needs one). A fork PR has no trusted credential; design a safe blocked/no-secret path. Never create, read or print credential values, tracked auth config, or a URL containing one. Confirm platform support before declaring the build path viable.

Acceptance is a tested matrix, not a deployment request: `apps/api/Dockerfile` deps stage can fetch the dependency without baking access into an image; a trusted `pnpm --filter @portfolio/api deploy --prod --legacy` produces a runner with the core's built CJS `./engine` and `./contracts` but **no credential**; the emitted Nest CJS import boots; web public SSR imports `./react/server` without editor bytes. Review `scripts/vercel-ignore-build.sh` and the web wrapper so package/lockfile-only changes rebuild only when branch policy permits, and `render.yaml`/dashboard build filters so package/lockfile changes trigger API rebuilds. Keep EN/VI, light/dark, 1440/390, WCAG AA, keyboard, no data loss, unchanged B1 goldens and neutral/token-only default theme regression evidence. `apps/api/docker-entrypoint.sh` can run `prisma migrate deploy`: C3 must introduce no migration; any deployment requires separate approval and rollback plan.

**Rollback:** before a consumer switch, keep the last verified in-repo package/tree and lockfile available. If isolated CI or audit fails, do not publish/switch. If a later trusted install or deployment fails, revert only the distribution manifest/lockfile/config in a reviewed PR and reinstall the prior pinned build (or approved workspace baseline); retain released history and do not delete published user data, tree snapshots or migration history. Package rollback is **not** a database rollback; validate public/preview parity and golden contracts again before release. Every production rollback remains Parker-approved.
