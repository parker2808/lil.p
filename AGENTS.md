# AGENTS.md

**Read [`PROJECT_CONTEXT.md`](PROJECT_CONTEXT.md) in full before doing anything.** It holds every requirement, confirmed and forbidden fact, and workflow rule for this repo.

Hard rules (details in PROJECT_CONTEXT.md):
- This repo is **public**: no secrets, no real contact info (use `<email>` / `<phone>` placeholders), never name or link any private data repo.
- One task = one branch/worktree = one PR. Never merge to `main` without Parker's explicit OK. Watch CI until green.
- Stay inside your task's scope; don't edit other agents' branches.
- **Every PR to `main` must update `PROJECT_CONTEXT.md` (§7 open items and §9 changelog) in the same PR.** CI (`context-check`) fails otherwise; changes only under `docs/` are exempt, and the `skip-context` label bypasses it.
