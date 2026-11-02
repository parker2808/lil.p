// CI runs web-e2e in {3} shards, each with its own MySQL. Playwright's built-in
// `--shard` cannot pin files together, so files are assigned here instead:
// the pixel (visual) and Lighthouse specs always share shard 1, and the rest
// are balanced by measured CI duration. Order inside a shard follows SPECS.
export const SHARD_COUNT = 3;

export const SPECS = [
  'public.spec.ts',
  'redesign.spec.ts',
  'contact.spec.ts',
  'admin-publish.spec.ts',
  'admin-pages.spec.ts',
  'admin-save-status.spec.ts',
  'a11y.spec.ts',
  'lighthouse.spec.ts',
  'ux-overlay.spec.ts',
  'admin-scroll.spec.ts',
  'ux-404.spec.ts',
  'content-guard.spec.ts',
  'hero-shader.spec.ts',
  'admin-login.spec.ts',
  'segmented-control.spec.ts',
  'admin-tables.spec.ts',
  'admin-back-link.spec.ts',
  'url-view-state.spec.ts',
  'admin-table-styles.spec.ts',
  'admin-locale.spec.ts',
  'admin-vi-core.spec.ts',
  'admin-vi-editors.spec.ts',
  'metadata.spec.ts',
  'projects-filters.spec.ts',
  'project-cards.spec.ts',
  'ux-targets.spec.ts',
  'admin-components.spec.ts',
  'editor-mode-toggle.spec.ts',
  'editor-mobile-toolbar.spec.ts',
  'case-study-end.spec.ts',
  'about-page.spec.ts',
  'case-study-layout.spec.ts',
  'admin-detail-error.spec.ts',
  'navigation-progress.spec.ts',
  'split-js.spec.ts',
  'hero-stats.spec.ts',
  'footer.spec.ts',
  'search-palette.spec.ts',
  'visual.spec.ts',
  'admin-ia.spec.ts',
  'admin-bottom-bar.spec.ts',
  'editor-split.spec.ts',
  'admin-dashboard.spec.ts',
  'admin-inbox.spec.ts',
  'admin-palette.spec.ts',
  'admin-table-filters.spec.ts',
] as const;

/** Specs that must run together in shard 1 (pixel baselines, Lighthouse scores). */
const PINNED: Record<string, number> = {
  'visual.spec.ts': 1,
  'lighthouse.spec.ts': 1,
};

/** Rough CI seconds per file; unknown files count as 5. Tune from shard timings. */
const WEIGHT: Record<string, number> = {
  'lighthouse.spec.ts': 40,
  'visual.spec.ts': 25,
  'a11y.spec.ts': 20,
};

function assign(): Map<string, number> {
  const load = Array.from({ length: SHARD_COUNT }, () => 0);
  const out = new Map<string, number>();
  for (const [file, shard] of Object.entries(PINNED)) {
    out.set(file, shard);
    load[shard - 1] = (load[shard - 1] ?? 0) + (WEIGHT[file] ?? 5);
  }
  const rest = SPECS.filter((f) => !out.has(f)).sort(
    (a, b) => (WEIGHT[b] ?? 5) - (WEIGHT[a] ?? 5) || SPECS.indexOf(a) - SPECS.indexOf(b),
  );
  for (const file of rest) {
    const shard = load.indexOf(Math.min(...load)) + 1;
    out.set(file, shard);
    load[shard - 1] = (load[shard - 1] ?? 0) + (WEIGHT[file] ?? 5);
  }
  return out;
}

/** All specs when `shard` is unset; otherwise the files for shard 1..SHARD_COUNT. */
export function specsForShard(shard: string | undefined): string[] {
  if (!shard) return [...SPECS];
  const n = Number(shard);
  if (!Number.isInteger(n) || n < 1 || n > SHARD_COUNT) {
    throw new Error(`E2E_SHARD must be 1..${SHARD_COUNT}, got ${shard}`);
  }
  const map = assign();
  return SPECS.filter((f) => map.get(f) === n);
}
