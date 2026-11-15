# D6 SSR and language gate

- Resolve the custom-tree tenant from the request host on the server; the configured site host uses the lil.p override, other hosts use neutral core tokens. Disable shared HTML ISR for this host-dependent route while retaining tagged API fetch caching.
- Publish a nested tree through the real API and assert complete no-script EN/VI SSR content; capture neutral and branded public/preview output and require a visible screenshot difference.
- Run the same four public/preview navigations independently for EN and VI so each locale retains full brand/preview coverage within its Playwright timeout; keep exact geometry and byte parity checks.
- Attach unmodified full-page public/preview captures, including the preview banner. For strict link pixel parity with scripts disabled, measure and subtract the banner's exact height from the preview link's bounding box, then apply a screenshot-only stylesheet hiding the banner and compare PNG bytes without a tolerance. Playwright `addStyleTag` hangs with JavaScript disabled; the banner otherwise shifts the link and produces repeatable corner raster differences despite matching text and interior pixels.
- Supply VI contact-form defaults without changing any golden fixture or stored row; separate block-copy language from locale-specific site settings.
- Translate schema metadata labels and nested leaf labels in the builder; retain operation paths and wire payloads. No V10 files change.
- The all-20 builder-origin browser journey must locate the localized VI `showFeatured` switch by its accessible label, not the raw schema key; its persisted `showFeatured: false` assertion remains unchanged.
- V03/V14 remain GAP until exact-head CI and independent artifact review establish full tuple coverage.
