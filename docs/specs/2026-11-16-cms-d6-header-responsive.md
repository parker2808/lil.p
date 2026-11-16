# D6 public header responsive overflow gate

## Failure and scope

The shared `SiteHeader` previously showed all navigation, search, locale and theme
controls from 768px. The combined labels exceeded the available content width
on the VI 768px public/preview captures, clipping a link and pushing the theme
toggle out of view. This is a layout failure, not a snapshot mismatch.

## Contract

- Keep compact search and the existing keyboard-accessible menu at 768 and 1024px.
  Switch to desktop navigation at 1280px in **both** CSS and `matchMedia`.
- At 768, 1024 and 1280px in EN/VI light/dark, every visible header control
  stays inside the viewport, is at least 44px in both dimensions, and the
  document has no horizontal overflow. Capture the actual header per tuple.
- At 768/1024, brand → search → menu remains the keyboard order. The menu
  opens with accessible links, locale/theme controls and 44px targets, then
  closes via Escape. At 1280, desktop nav and theme remain visible.
- The browser gate runs in the five-shard GitHub `ready-e2e` workflow; independent
  raw-image review is required before calling the visual P2 closed. This does
  not certify all page layouts or full V09/V10 acceptance.
