# API

The Nest API serves the existing CMS HTTP contracts for admin editing, publishing, previews, saved versions, and public pages. The [root README](../../README.md) covers the monorepo and deployment setup.

PR #186 fixes a custom page with only a Vietnamese SEO title: published and saved-version responses use that title with `lang: vi` for EN and VI requests, matching the draft preview. Built-in and bilingual fallback rules stay unchanged. When #186 and B1 (#177) are combined, update only B1's documented VI-only `KNOWN BUG` golden expectation. See the [locale SEO spec](../../docs/specs/2026-11-10-custom-page-locale-seo.md).
