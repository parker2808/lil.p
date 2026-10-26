# Launch checklist (T61)

Hosting is Vercel (web) + Render (API) + TiDB Cloud Serverless + Cloudinary
(PLAN D28). Tick these before sharing the public URL.

- [ ] Custom domain (optional) on Vercel; `WEB_ORIGIN` / `NEXT_PUBLIC_SITE_URL`
      / `WEB_INTERNAL_URL` match it
- [ ] `https://<web>/en` and `/vi` return 200
- [ ] `https://<api>/api/health` returns `{ "status": "ok", "db": "ok" }`
- [ ] TLS is on both origins (Vercel and Render provide it)
- [ ] Production `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` are fresh
      `openssl rand -base64 48` values, not the local-dev pair
      ([runbooks/secrets.md](./runbooks/secrets.md))
- [ ] Admin password rotated after the first seed
- [ ] `CROSS_SITE_COOKIES=1` on Render; login from the Vercel origin sets
      `SameSite=None; Secure` cookies
- [ ] Cloudinary keys set; a test upload appears in the media library
- [ ] `pnpm check:content` is green in CI
- [ ] Parker entered real copy ([runbooks/content-entry.md](./runbooks/content-entry.md));
      `pnpm check:placeholders` against production `DATABASE_URL` is green
- [ ] At least two case studies and one post are published
- [ ] Every page published; content health shows no invalid blocks
- [ ] 404 and 500 pages render
- [ ] OG preview (`/api/og` or a shared link) looks right
- [ ] `/sitemap.xml` and `/robots.txt` resolve; submit the sitemap if you use
      Search Console
- [ ] Analytics on (`analyticsEnabled` in site settings) if you want views
- [ ] An uptime ping hits `https://<api>/api/health` (and optionally the
      Vercel origin). Render free-tier sleep is expected; `ApiWarmup` plus
      the ping keep it honest
- [ ] A restore drill of the latest TiDB backup has been run
      ([runbooks/restore.md](./runbooks/restore.md) — use TiDB's backup or
      `mysqldump` against the serverless endpoint)
