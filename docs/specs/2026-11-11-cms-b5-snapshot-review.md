# B5 review — lossless snapshot reads

Status: follow-up to accepted draft PR #190. A reader must not accept unknown persisted page, SEO or block fields and then silently strip them through Zod. There is no root page-snapshot version in the current contract; a root `schemaVersion` (including a future value) is unsupported and must return the typed `FUTURE_VERSION` result rather than being dropped. Legacy/current block versions remain readable, future block versions remain rejected, and unknown block fields report `INVALID_BLOCK` with the block index. Unknown root or SEO keys report `INVALID_SNAPSHOT`. `props` remains arbitrary host-owned JSON and is not field-stripped.

## Plan

1. Freeze root and nested unknown-field cases.
2. Reject unsupported root versions before parsing.
3. Reject unknown fields before Zod stripping.
4. Cover legacy, current and future block versions.
5. Run focused and repository checks.
6. Regenerate Graphify and update documentation.
7. Push #190 and await green CI.

No package contract, Nest adapter, schema, migrations, dependencies, published JSON or B1 golden changes. The host's legacy missing-SEO compatibility path belongs to the stacked B5b adapter and is not removed by strict core reads. Roll back this engine reader and its tests if compatibility evidence contradicts it; never rewrite persisted rows.
