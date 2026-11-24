# Claude Code setup

Claude Code reads the short entry point in `CLAUDE.md` and the canonical rules in `AGENTS.md`. `AGENT_RULES.md` points to the same rules. `PROJECT_CONTEXT.md` and `docs/LESSONS.md` supply project facts and lessons, not permission to act.

`.claude/settings.json` allows repository reads, local gates and read-only Git inspection. It denies sensitive-file reads and Git pushes, plus production deployment and bot restart commands. The push deny is deliberately broader than the main/force-push ban; branch pushes require an explicit permission change after review. The same rules apply to other tools and commands, including shell access outside Claude Code's permission matcher.

Run `pnpm check:all` before a code PR. For docs/config changes, also format the changed files and run `pnpm check:content`. Merge and deployment approvals and gates are defined in COMMON_RULES §3; a passing local gate alone does not authorize either action.
