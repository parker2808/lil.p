# Enter real content (T60)

Production boots from the `baseline` seed (owner CV, projects `DRAFT`, 0
posts, no demo inbox messages or page views). Placeholders stay in the
database until you replace them in `/admin`. Do not commit the real inbox
address or phone number.

## Before you start

1. `SEED_PROFILE=baseline` (or `owner`) and `pnpm db:seed` / `pnpm prod:seed`.
2. Sign in at `/admin/login`. Change the admin password (T46).
3. Keep `<email>` / `<phone>` in git. Type the real values only in the CMS.

## Checklist

Work through `/admin` in this order. Publish only when the English and
Vietnamese fields are both real copy (no `TODO`, `Sample`, or `Lorem`).

- [ ] **Site settings** — name, domain, SEO, footer, contact intro, reply-time
      note, availability. Set the real contact email here (this is what the
      public contact page and `mailto:` use).
- [ ] **Profile** — headline, bio, languages, accent, city/country, career
      start. Phone stays private; still replace `<phone>` so the checker
      passes. Upload avatar and resumes with alt text.
- [ ] **Experience / education / principles / process / stats** — replace every
      `TODO` location, degree, and note. Confirm skill depth.
- [ ] **Projects** — keep `notMine` (teammate work) and `releaseStatus` honest.
      Do not invent metrics. Add cover + gallery alts. Publish **at least two**
      case studies when the body is ready.
- [ ] **Posts** — write and publish **at least one** note. 0 posts is the
      baseline; the live site should not stay empty.
- [ ] **Pages** — home / about / projects / notes / contact. Check content
      health for invalid blocks, missing alts, and stale drafts. Publish each
      page after the copy is real.
- [ ] **Vietnamese** — every `*Vi` field the public page shows.
- [ ] **Media alts** — every image used on a published page or case study.

## Prove it

```bash
pnpm check:content          # no CV strings / real inbox in the repo
pnpm check:placeholders     # DATABASE_URL: 0 placeholders in live rows
```

`check:placeholders` fails while the baseline seed is still in the database
(that is expected). It passes only after the live rows above are clean.

Draft projects and draft posts may still contain `TODO` — the checker ignores
them. Singletons, always-public about/nav rows, published work, `PageBlock.props`,
and published `PageVersion` snapshots must be clean.
