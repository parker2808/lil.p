# V17/V18/V21/V22 focused evidence gates

Test-only gates; no runtime, goldens, migration or release operation changes.
`cms-route-snapshot-evidence.e2e-spec.ts` exercises real authenticated version,
preview and restore plus public HTTP routes for legacy and tree snapshots on a
disposable MySQL service. It compares both locales' public/version-preview
semantics and retained version-row JSON hashes after reads and legacy restore;
the historical legacy fixture intentionally omits SEO fields. Its route inventory
is scoped to these two custom-page formats and their three HTTP read endpoints,
**not** a claim that every site route or exact original wire bytes are inventoried.

`cms-builder-rollback-reader.e2e-spec.ts` uses a generated pre-D2 Prisma client
against the migrated disposable database, reads five distinct published rows and
checks immutable snapshots and pointers; the existing test demonstrates that an
old writer can overwrite a tree pointer. This does **not** prove five rows were
present _before_ this test's migration, nor prove live Render freeze/drain.
V18 remains **BLOCKED** pending the coordinator's locked before/after migration
and operational no-overlap proof. No old-API rollback is safe.

The CMS core snapshot unit test checks raw JSON preservation of nested unknown
props for current versions and typed no-mutation rejection for future/invalid
versions. Final integrated-head CI and independent review must precede any row
PASS; V17's full route inventory and V21's HTTP/fixture matrix remain open if
the narrower evidence here does not cover them.
