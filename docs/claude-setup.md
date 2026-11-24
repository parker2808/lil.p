# Claude Code setup

Claude Code reads the short entry point in [`CLAUDE.md`](../CLAUDE.md) and the canonical rules in [`AGENTS.md`](../AGENTS.md). `AGENT_RULES.md` points to the same rules. `PROJECT_CONTEXT.md` and `docs/LESSONS.md` supply project facts and lessons, not permission to act.

`.claude/settings.json` uses the Claude Code permissions schema (`allow` / `deny` / `ask`). Deny wins over allow, and a rule that is neither allowed nor denied needs a human decision.

## What is allowed

- `Read` of repository files.
- The local gate: `pnpm check:all` (also `--static`, `--no-build`, `--e2e`), `pnpm format:check|lint|typecheck|test|build|check:content|check:deps|check:placeholders`, `pnpm install --frozen-lockfile`, and Prettier on explicit files.
- The same gate commands wrapped in `lockf ~/.t3/locks/lilp-e2e.lock` (macOS has no `flock`; `lockf` takes the same lock path), plus `sysctl -n vm.loadavg` and `uptime` for the load check.
- Exact read-only Git forms: `git status`, `git diff` (plain, `--stat`, `--cached`, `--check`, `origin/main...HEAD`), `git log --oneline` variants, `git show --stat|--name-only`, and listing forms of `git branch`. `git diff/show/log --no-index` and `--output` are denied because they can read or write outside the repository.
- `git fetch origin`, `git add`, `git commit -m` (`git add -f` is denied so ignored files cannot be forced in), and gate worktrees: `git worktree add --detach ~/.t3/worktrees/lil.p/gate-<sha> origin/main`, `git worktree remove` of the same path, `git worktree list`. Paths containing `..` are denied.

## Pushes (decision 24 Nov 2026)

Automation must be able to publish feature branches. Only `git push [-u] origin <prefix>/<name>` with prefix `chore`, `feat`, `fix`, `docs` or `test` is allowed. A permission glob cannot name a branch without also matching a tail, so the deny list removes the risky tails: every dash option after the first argument (`-f`, `-d`, `--force`, `--delete`, `--mirror`, `--all`, clusters such as `-fu`), refspec colons, `+refspec`, `refs/*`, `HEAD*`, anything containing `main` or `master` (so a branch such as `docs/domain-notes` is also refused; rename it), and a second argument after the branch. Any other `git push` is not allowed. `git push` is deliberately not under `ask`, so an `ask` rule never overrides the feature-branch allows.

## Secrets and the `~/.t3` decision (24 Nov 2026)

Denied reads: `.env*` anywhere (this also blocks `.env.example`; paste the keys you need), token files (`token.json`, `*.token`, `*_token`, `*token*.json|txt|env`), `*.secret`, `secrets.json|yml|yaml|env|txt`, `credentials.json|yml|yaml`, `*.pem`, `*.key`, `.npmrc`, `~/.netrc`, `~/.ssh`, `~/.aws`, `~/.config/gh`, `~/.config/render`, `~/.vercel`, `~/.claude/.credentials*`, `~/tg-fallback`, `~/.config/cms-core/db.env`, and the sensitive parts of `~/.t3`: `userdata`, `runtime`, `caches`, plus auth, token and secret files. A blanket `~/.t3/**` deny would block every T3 worktree, so `~/.t3/worktrees`, `~/.t3/locks` and `~/.t3/bin` stay usable. Rules use file-style names rather than `*secret*` or `*token*` anywhere, so source files such as `token.service.ts`, `secrets.ts`, `credentials.ts` and `docs/runbooks/secrets.md` stay readable. Path rules are `Read(...)` only; Claude Code applies them to Grep and Glob too.

Trade-off: denying `~/.t3/userdata` also blocks T3 chat attachments stored there. Paste the content or copy it into the worktree.

## Deploys and merges

Denied: `vercel --prod`, `render deploy`, `docker compose -f compose.prod.yml`, `pnpm prod:*` and `launchctl` start/stop/restart/kickstart/load/unload. Other `vercel`, `render`, `launchctl` and `docker compose` use, `gh pr merge`, and any edit to `.claude/**` ask first. A passing local gate alone never authorizes a merge or deploy; see COMMON_RULES §3 via [`AGENTS.md`](../AGENTS.md#full-decision-authority).

## Limits

These are best-effort glob rules. `Read` denies do not cover every Bash reader (`cat`, `rg`, `node -e`), and a glob cannot express "exactly one refspec". The real guards are server-side branch protection on `main`, green CI, and review of every PR; the same rules apply to other tools and to shell access outside Claude Code's permission matcher.

## Gate

Run `pnpm check:all` before a code PR (`--e2e` as CI does). For docs/config-only changes, format the changed files with Prettier and run `pnpm check:content`; this branch also ran the full `pnpm check:all`. Heavy runs go under `lockf ~/.t3/locks/lilp-e2e.lock` after checking `sysctl -n vm.loadavg` (below 25 start work; 25 to 40 light work only; above 40 start nothing new).
