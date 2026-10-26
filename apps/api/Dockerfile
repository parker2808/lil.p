# syntax=docker/dockerfile:1
# Multi-stage NestJS image: build in a fat stage, copy only what runs.

FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat openssl
RUN corepack enable && corepack prepare pnpm@10.34.9 --activate
ENV HUSKY=0
WORKDIR /app

FROM base AS deps
RUN apk add --no-cache python3 make g++
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/ui/package.json packages/ui/package.json
COPY packages/contracts/package.json packages/contracts/package.json
COPY apps/api/prisma ./apps/api/prisma
COPY apps/api/prisma.config.ts ./apps/api/prisma.config.ts
RUN pnpm install --frozen-lockfile

FROM deps AS builder
COPY . .
RUN pnpm --filter @portfolio/contracts build \
  && pnpm --filter @portfolio/api build

FROM builder AS pruned
RUN pnpm --filter @portfolio/api deploy --prod --legacy /deploy/api \
  && rm -rf \
    /deploy/api/test \
    /deploy/api/src \
    /deploy/api/Dockerfile \
    /deploy/api/.dockerignore \
    /deploy/api/api.http \
    /deploy/api/STRUCTURE.md \
    /deploy/api/vitest.config.ts \
    /deploy/api/vitest.e2e.config.ts \
    /deploy/api/tsconfig.json \
    /deploy/api/tsconfig.build.json \
    /deploy/api/nest-cli.json

FROM node:22-alpine AS runner
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

RUN addgroup -g 1001 -S nodejs \
  && adduser -S nestjs -u 1001 -G nodejs

COPY --from=pruned --chown=nestjs:nodejs /deploy/api/node_modules /app/node_modules
COPY --from=pruned --chown=nestjs:nodejs /deploy/api/package.json /app/package.json
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/dist /app/dist
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/src/generated /app/src/generated
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/prisma /app/prisma
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/prisma.config.ts /app/prisma.config.ts
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/docker-entrypoint.sh /app/docker-entrypoint.sh

RUN chmod +x /app/docker-entrypoint.sh \
  && mkdir -p /app/uploads \
  && chown nestjs:nodejs /app/uploads

USER nestjs
EXPOSE 4000
ENV NODE_ENV=production
ENV API_HOST=0.0.0.0
ENV API_PORT=4000
ENV PATH="/app/node_modules/.bin:${PATH}"
ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "dist/main.js"]
