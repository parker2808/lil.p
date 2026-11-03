# Admin r3b fixes

## Plan

1. Keep `/design-demo-admin` as the visual fixture, and apply its approved education and media layout corrections to the real `/admin` views.
2. Create page titles only in the selected locale; leave the other locale empty so existing locale fallback remains explicit. Validate the selected locale on publish.
3. Render demo translations in React during server rendering and derive `<html lang>` from the request locale. Keep language switching as navigation/state.
4. Capture the missing EN/VI and desktop/mobile state matrix, plus real admin routes using local mock data; audit overflow and visible copy.
5. Run `pnpm check:all`, commit on the current branch, and leave databases and remote branches untouched.

## Review notes

- No Prisma schema change or migration is needed: SEO fields and localized block props already support nullable or empty alternate-locale values.
- Existing English pages retain their publish behavior. A new Vietnamese page requires Vietnamese title content, while other-locale SEO and block fallback remain available through the existing locale resolver.
- Mock capture data must be fictional and contain no contact details. Capture scripts must fail on non-200 responses or browser errors.
