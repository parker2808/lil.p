# D6 host-gallery neutral token correction

The 20-type public/version-preview matrix already runs EN/VI, light/dark,
390/768/1440 and neutral/lil.p in five CI shards. On the `ba2fe0e8` report
(`43740815473`), 476 of 480 neutral/lil.p host-image pairs were byte-identical:
the test checked `--builder-accent` on the host but the rendered block used
site tokens such as `--primary`. This is not evidence of a neutral visual theme.

Keep the core stylesheet neutral and the existing lil.p host unchanged. Adapt
only the neutral host's inherited site palette to the core tokens at the host
boundary. Assert the computed color of the rendered hero accent in all four
locale/theme cases and a changed neutral/branded hero image at each width;
assert the whole document fits the viewport rather than relying on cropped
block screenshots; retain strict public/version-preview pixel parity and
unwaived axe checks.
Neutral SSR on a real tenant and review of the raw CI images remain separate
release gates. V03 starter-component coverage and V05 Properties validation
are not inferred from this gallery.

Graphify freshness: `graphify update .` was attempted twice in the isolated
worktree. Both scans reached full AST extraction, then stalled in path
resolution; the local runs were interrupted without changing the tracked
report. `graphify-out/GRAPH_REPORT.md` still attributes its graph to
`0e50d605`, not to this fix. Do not present it as a fresh topology audit.
