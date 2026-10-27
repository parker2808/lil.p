# Swagger UI for the API

- [x] Confirm why `http://127.0.0.1:4000/` fails (every route is under `/api` → 404)
- [x] Add `@nestjs/swagger@^11` (v12 needs Nest 12)
- [x] `setupSwagger`: UI at `/api/docs`, JSON at `/api/docs-json`, `/` redirects there; off in production
- [x] Fill request bodies / query params from the `ZodValidationPipe` schemas (no controller changes)
- [x] Tag operations by controller path
- [x] Multipart body for `POST /admin/media`
- [x] `OriginGuard`: allow same-origin writes while docs are enabled (Try it out)
- [x] Unit tests, typecheck, lint, manual check against the running API

## Review

- CI steps run locally: `pnpm install --frozen-lockfile`, `format:check`, `lint`, `typecheck`, `test` (365 passed), `check:content`, `check:deps`, `build`. API e2e: 106/106 (the analytics spec needs `ANALYTICS_SALT_SECRET` set; a blank value in the local `.env` skips view writes).
- Production mode (`NODE_ENV=production`, built `dist` and the `apps/api/Dockerfile` image): `/`, `/api/docs`, `/api/docs-json` → 404, `/api/health` → 200, same-origin write → 403, write from `WEB_ORIGIN` → 200. `@nestjs/swagger` ships in the pruned image.
