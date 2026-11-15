# D5 V15 full-builder target and focus audit

Stack on the accepted D5 live journeys; do not change tree, HTTP or golden contracts. The prior capture only measured `.cms-core` and tolerated 43.5px, leaving admin chrome and focus-ring contrast unproven.

## Plan

1. Measure every visible, enabled interactive control in the builder's admin shell, including chrome and open sheets, at actual CSS-pixel geometry without tolerance.
2. Measure keyboard focus indicator contrast against the adjacent painted surfaces, failing below 3:1; keep the existing EN/VI, light/dark, neutral/brand, 390/768/1440 capture matrix.
3. Fix measured host UI violations without changing neutral core tokens or unrelated routes; keep screenshots and measured audit values attached to exact-head CI.
4. Refresh Graphify and project docs; run local checks and the ready-e2e CI gate. Manual screen-reader V16 and combined D6 acceptance remain open.

The measurement reports each undersized control and each failing focus color/surface pair, not just an aggregate count. An invisible/disabled control is excluded; a keyboard-focusable active control without a visible outline or ring fails. No screenshot or token-only contrast is accepted as proof of a computed focus pair.

The stacked #204 all-20 fixture also resolves `BLOCK_EDITOR_META.labelKey` against the real EN/VI messages. Until the separate host-label change from #215 is in this branch, its heading assertion accepts either the current raw type text or its translated label; once combined, both languages must continue finding all 20 controls without assuming a raw `hero` label.

Compute color contrast from browser Canvas sRGB pixels for CSS-computed colors rather than parsing only `rgb()` and hex. Composite painted ancestor surfaces and translucent rings, reject invisible rings (1:1), and measure each visible control's viewport/overflow-clipped geometry; do not lower the focus 3:1 or target 44px thresholds. A real Tab traversal covers the keyboard journey's active builder controls; manual SR and full combined-stack EN/VI localization remain separate gates.

CI 43696256038 showed that the 1440px canvas has its own horizontal scroller: a full-size `Move ↓` button was clipped to 21px, while the sidebar's full-size `Inbox` link was clipped to 2.4375px vertically. For partially exposed full-size controls, the audit temporarily scrolls their ancestors into view, measures the actually exposed hit area, and restores scroll positions. If the area still measures below 44×44px, the gate fails; intrinsically small controls are never rescued by scrolling. This distinction does not claim that partially exposed controls satisfy the target size without scrolling.

CI 43698491275 exposed a two-layer Select focus shadow: a white offset gap (1.08:1 against the light host surface) precedes the colored outer ring. The gap is not the focus indicator. The audit now evaluates all actually painted outline/ring layers of at least 2px and requires one visible layer to reach ≥3:1 against every adjacent painted surface; a transparent placeholder or offset gap alone cannot pass.
