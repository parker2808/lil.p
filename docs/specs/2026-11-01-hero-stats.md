# P4-6 T24: hero stats from site settings

## Goal

The home hero shows up to 3 stats chosen in the admin site settings, with profile stats as the fallback.

## Data

- `SiteSettings.heroStats Json?` (nullable, no default, no backfill). Migration `site_settings_hero_stats`: `ALTER TABLE site_settings ADD COLUMN heroStats JSON NULL`.
- Contracts `heroStatsSchema`: 0-3 items `{ value 1-12, suffix? <=4, labelEn 1-40, labelVi 1-40 }`.
- An empty list is stored as NULL. Stored JSON that fails the schema reads as NULL.

## API

- `PATCH /api/admin/site` accepts `heroStats` (array or `null`); an invalid list is a 400 `VALIDATION_FAILED`.
- `GET /api/admin/site` returns `heroStats` (array or `null`).
- `GET /api/public/site` returns `settings.heroStats` as `{ value, suffix, label }[]` for the locale, or `null`.

## Web

- `HeroBlock` renders a `<dl>` (`<dt>` label, `<dd>` value + suffix) after the CTAs: settings stats first, else the first 3 non-zero profile stats (StatBand order), else no row. Placeholder values and labels are dropped.
- Site settings form: "Hero stats" fieldset with up to 3 rows (value, suffix, label EN, label VI), add, remove, move up/down, inline errors on save, and "Clear (use profile stats)" that saves `null`.

## Plan

1. Prisma schema + `--create-only` migration on a throwaway local DB; check `migrate diff` shows no drift.
2. Contracts schemas + unit tests.
3. API mapper/service + unit tests and an API e2e case.
4. HeroBlock stats row + CSS in `packages/ui/src/styles/redesign.css` + unit tests.
5. SettingsForm fieldset + vi/en messages; demo seed resets `heroStats` to NULL.
6. `e2e/hero-stats.spec.ts`; re-render the `/en` home visual baselines.
7. `pnpm check:all`, PROJECT_CONTEXT §7/§9, LESSONS, PR stacked on #129.
