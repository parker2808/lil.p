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
pnpm install                 # all workspaces
pnpm dev                     # web :3000 + api :4000 in parallel (MySQL via docker compose)
pnpm lint | typecheck | test | build
pnpm check:content           # no CV strings in UI code, no email/phone anywhere
pnpm check:deps              # no paid Tiptap packages or private Tiptap registry; every @tiptap/* and @dnd-kit/* is MIT
docker compose up -d db adminer
```
