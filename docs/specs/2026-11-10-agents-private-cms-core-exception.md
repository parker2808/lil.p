# Private CMS core naming exception

## Decision and scope

The public `lil.p` repo may name and link **only** the private repository that distributes `@parker2808/cms-core`, and may declare that package as a dependency. This exception does not authorize revealing its contents, access details, secrets, tokens, credentials, private data, or any other private repository. `AGENT_RULES.md` remains a pointer to the canonical `AGENTS.md`.

## Plan

1. Add the narrow exception to `AGENTS.md` and align the conflicting rule in `PROJECT_CONTEXT.md`.
2. Document the exception in the root README, current changelog, and lessons.
3. Run Prettier on changed files and `pnpm check:content`; open a docs-only PR without merging.

## Acceptance and rollback

Only the named package and its private source repository can appear in public documentation or package metadata. No credential or private content appears in the diff. Roll back by reverting this PR.
