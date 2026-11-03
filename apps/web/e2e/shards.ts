// CI runs web-e2e in {4} shards, each with its own MySQL. Playwright's built-in
// `--shard` cannot pin files together, so files are assigned here instead:
// the pixel (visual) and Lighthouse specs always share shard 1, and the rest
// are balanced by measured CI duration. Order inside a shard follows SPECS.
export const SHARD_COUNT = 4;

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
  'brand-foundation.spec.ts',
  'admin-shell-insights.spec.ts',
  'admin-collections-r3.spec.ts',
  'admin-editors-r3.spec.ts',
] as const;

/** Specs that must run together in shard 1 (pixel baselines, Lighthouse scores). */
const PINNED: Record<string, number> = {
  'visual.spec.ts': 1,
  'lighthouse.spec.ts': 1,
};

/** CI seconds per file, measured on run 41382787431; unknown files count as 4. */
const WEIGHT: Record<string, number> = {
  'a11y.spec.ts': 63,
  'lighthouse.spec.ts': 58,
  'visual.spec.ts': 27,
  'redesign.spec.ts': 10,
  'footer.spec.ts': 9,
  'navigation-progress.spec.ts': 8,
  'editor-split.spec.ts': 8,
  'split-js.spec.ts': 8,
  'ux-overlay.spec.ts': 6,
  'metadata.spec.ts': 6,
  'admin-scroll.spec.ts': 6,
  'admin-vi-editors.spec.ts': 6,
  'admin-tables.spec.ts': 6,
  'admin-vi-core.spec.ts': 6,
  'admin-inbox.spec.ts': 6,
  'ux-targets.spec.ts': 5,
};

function assign(): Map<string, number> {
  const load = Array.from({ length: SHARD_COUNT }, () => 0);
  const out = new Map<string, number>();
  for (const [file, shard] of Object.entries(PINNED)) {
    out.set(file, shard);
    load[shard - 1] = (load[shard - 1] ?? 0) + (WEIGHT[file] ?? 4);
  }
  const rest = SPECS.filter((f) => !out.has(f)).sort(
    (a, b) => (WEIGHT[b] ?? 4) - (WEIGHT[a] ?? 4) || SPECS.indexOf(a) - SPECS.indexOf(b),
  );
  for (const file of rest) {
    const shard = load.indexOf(Math.min(...load)) + 1;
    out.set(file, shard);
    load[shard - 1] = (load[shard - 1] ?? 0) + (WEIGHT[file] ?? 4);
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
