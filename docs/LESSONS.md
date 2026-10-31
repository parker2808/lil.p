# Lessons

- 2026-10-31: An agent edited the main checkout on `main` instead of its worktree; always use a T3 worktree branch, and the pre-commit hook now blocks `main`.
- 2026-10-31: A free model failed silently or hit quota; run work via `~/ai-tools/t3-run.sh` watchdog, which switches models and reports failures.
- 2026-10-31: A big task skipped planning; write a plan and a spec in `docs/specs/` before coding.
