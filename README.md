# lil.p

Portfolio monorepo: Next.js public site + admin (`apps/web`), NestJS API (`apps/api`), design system (`packages/ui`), and shared zod contracts (`packages/contracts`).

Layout and naming: [STRUCTURE.md](./STRUCTURE.md). Build plan: [docs/PLAN.md](./docs/PLAN.md).

## Prerequisites

- Node 22 (`.nvmrc`; `nvm use`)
- pnpm via [corepack](https://nodejs.org/api/corepack.html) (`corepack enable`) so it matches `packageManager` in `package.json`
- Docker Desktop
- git

## Commands

```bash
pnpm install                 # all workspaces (also installs git hooks via Husky)
pnpm dev                     # web :3000 + api :4000 in parallel (MySQL via docker compose)
pnpm lint | typecheck | test | build
pnpm format | format:check   # Prettier (one root config; format:check also runs in CI)
pnpm check:content           # no CV strings in UI code, no email/phone anywhere
pnpm check:deps              # no paid Tiptap packages or private Tiptap registry; every @tiptap/* and @dnd-kit/* is MIT
docker compose up -d db adminer
```

## Git hooks

`pnpm install` sets up [Husky](https://typicode.github.io/husky/) (v9). After that:

- **pre-commit** — formats and lint-fixes only the files you staged
- **commit-msg** — commit messages must look like `chore: add hooks` or `feat(web): …` (same as PR titles)
- **pre-push** — runs `pnpm typecheck`

Beginner walkthrough: [STRUCTURE.md § Git hooks](./STRUCTURE.md#git-hooks-husky).
