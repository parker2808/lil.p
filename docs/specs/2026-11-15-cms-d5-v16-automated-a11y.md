# V16 automated builder accessibility subset

The registered browser spec `apps/web/e2e/cms-builder-v16-automated.spec.ts` uses the real admin API and activated tree builder in English and Vietnamese. It checks the full-page WCAG A/AA axe scan before and after keyboard insertion and delete confirmation, accessible palette/dialog names, polite status announcements for insert, pickup, cancel and delete, focus restoration, and reduced-motion media/CSS. It creates disposable pages only on the CI test database.

This is **supporting automated evidence**, not V16 acceptance. VoiceOver/NVDA spoken output and reading order, public/preview heading hierarchy, and manual EN/VI keyboard/screen-reader review still require independent signoff. Do not promote V16 to PASS from a green CI result alone.
