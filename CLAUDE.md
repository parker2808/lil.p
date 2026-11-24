# Claude entry point

Read [AGENTS.md](AGENTS.md) first; it is canonical. Then read [AGENT_RULES.md](AGENT_RULES.md), [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md) and [docs/LESSONS.md](docs/LESSONS.md). Context is not authority or proof of live state. This repo has no `CONTEXT.md`.

Run `pnpm check:all` as the full local gate (add `--e2e` as CI does). Heavy gates on a shared Mac run one at a time under `lockf ~/.t3/locks/lilp-e2e.lock <command>` after checking `sysctl -n vm.loadavg`. Merge and deploy require the gates and approvals in COMMON_RULES §3 (linked from [AGENTS.md](AGENTS.md#full-decision-authority)). Work runs 24/7 under those safeguards; there are no time windows.

## Claude Code permissions ([.claude/settings.json](.claude/settings.json))

Details and rationale are in [docs/claude-setup.md](docs/claude-setup.md). In short:

- Allowed: reads inside the repo, the local gate commands, exact read-only `git status/diff/log/show/branch` forms, `git fetch origin`, `git add`/`git commit -m`, and gate worktrees named `~/.t3/worktrees/lil.p/gate-*`.
- Pushes: only `git push [-u] origin <prefix>/<name>` for `chore/`, `feat/`, `fix/`, `docs/` and `test/`. Pushes to `main`/`master`, `HEAD`, `refs/*`, refspecs (`:`, `+`), any extra argument after the branch, and every dash option after the first argument (force, delete, mirror, all, clusters such as `-fu`) are denied. Any other `git push` is not allowed silently.
- Secrets: reads of `.env*`, token, credential, key and `.pem` files, `~/.t3/userdata`, `runtime` and `caches`, `~/.ssh`, `~/.aws`, `~/.config/gh`, `~/.config/render`, `~/.vercel`, `~/.netrc`, `~/tg-fallback` and Claude credentials are denied. **`~/.t3/worktrees`, `~/.t3/locks` and `~/.t3/bin` stay usable** because T3 worktrees live there (decision 24 Nov 2026).
- Deploys: `vercel --prod`, `render deploy`, `docker compose -f compose.prod.yml`, `pnpm prod:*` and bot-job `launchctl` start/stop/restart are denied; other `vercel`/`render`/`launchctl` use and `gh pr merge` ask first.
- Edits to `.claude/**` ask first.
- These glob rules are best-effort. `Read` denies do not cover every Bash reader (`cat`, `rg`, an interpreter), and a pattern cannot express "exactly one refspec". The real guards are server-side branch protection on `main`, green CI and human review of every PR.
