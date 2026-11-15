# D5 V15 full-builder target and focus audit

Stack on the accepted D5 live journeys; do not change tree, HTTP or golden contracts. The prior capture only measured `.cms-core` and tolerated 43.5px, leaving admin chrome and focus-ring contrast unproven.

## Plan

1. Measure every visible, enabled interactive control in the builder's admin shell, including chrome and open sheets, at actual CSS-pixel geometry without tolerance.
2. Measure keyboard focus indicator contrast against the adjacent painted surfaces, failing below 3:1; keep the existing EN/VI, light/dark, neutral/brand, 390/768/1440 capture matrix.
3. Fix measured host UI violations without changing neutral core tokens or unrelated routes; keep screenshots and measured audit values attached to exact-head CI.
4. Refresh Graphify and project docs; run local checks and the ready-e2e CI gate. Manual screen-reader V16 and combined D6 acceptance remain open.

The measurement reports each undersized control and each failing focus color/surface pair, not just an aggregate count. An invisible/disabled control is excluded; a keyboard-focusable active control without a visible outline or ring fails. No screenshot or token-only contrast is accepted as proof of a computed focus pair.
