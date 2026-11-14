# Duplicate block limit

## Problem

`PagesService.duplicateBlock` currently creates a copy without checking the block definition's `maxPerPage`, while `createBlock` checks it. This can exceed the configured page limit.

## Plan

1. Check the current count with `assertWithinLimit` before writing the duplicate.
2. Add a service unit test and Nest HTTP test for a limit-one block.
3. Update the README, `PROJECT_CONTEXT.md` §7/§9 and lessons.
4. Refresh Graphify after code changes and run `pnpm check:all --e2e` on disposable local MySQL.

## Acceptance and rollback

Duplicating a block at `maxPerPage` returns HTTP 409 with code `BLOCK_LIMIT` and writes no duplicate. No DB schema or API shape changes. Revert this PR to roll back.
