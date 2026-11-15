# V16 automated builder accessibility subset

The registered browser spec `apps/web/e2e/cms-builder-v16-automated.spec.ts` uses the real admin API and activated tree builder in English and Vietnamese. It checks the full-page WCAG A/AA axe scan before and after keyboard insertion and delete confirmation, accessible palette/dialog names, polite status announcements for insert, pickup, cancel and delete, focus restoration, and reduced-motion media/CSS. It creates disposable pages only on the CI test database.

This is **supporting automated evidence**, not V16 acceptance. VoiceOver/NVDA spoken output and reading order, public/preview heading hierarchy, and manual EN/VI keyboard/screen-reader review still require independent signoff. Do not promote V16 to PASS from a green CI result alone.

Matrix status after #221 (`b2671d6c`, CI `43732468521`): **V16 GAP / manual signoff OPEN**. The V15 target/focus audit and this automated builder subset do not establish spoken output in VoiceOver/NVDA, editor/public reading and H1 order, or a reviewed EN/VI screen-reader journey. Record those observations on the final combined head before changing V16 to PASS.
