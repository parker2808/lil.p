# Standalone CMS core fixture

This small React/Vite consumer imports only the built `@parker2808/cms-core` package's public `./contracts`, `./engine`, `./react/server`, `./react` and `./theme.css` exports. No Next, Nest, portfolio UI or API/DB connection is required. Build core before running the fixture:

```sh
pnpm --filter @parker2808/cms-core build
pnpm --filter @parker2808/cms-core-fixture build
pnpm --filter @parker2808/cms-core-fixture dev
```

Open `/en/` or `/vi/`, then `/components`, `/editor`, or `/unknown`. The editor is a **local in-memory Phase B block list**, not a production builder: it cannot save or publish. Focus a row and use Alt+Up/Down to reorder; components and localized labels are host-registered. Unknown input is displayed safely in draft and never executed publicly. Raw snapshot fixtures prove typed rejection or lossless acceptance, not an API migration. The core owns neutral light/dark defaults; `src/override.css` changes only palette tokens for the optional lil.p comparison.

Run `pnpm --filter @parker2808/cms-core-fixture test` for the pure and DOM checks. Under the shared E2E lock, run `FIXTURE_CAPTURE=1 pnpm --filter @parker2808/cms-core-fixture test:e2e` to check Chromium axe/keyboard behavior and refresh the 80 EN/VI × light/dark × neutral/lil.p × 1440/390 screenshots and `e2e/__screenshots__/manifest.json`. Review the rendered PNGs before approving design changes.
