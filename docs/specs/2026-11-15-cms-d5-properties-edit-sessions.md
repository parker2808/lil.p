# D5 Properties edit sessions

Blur ends a text/number property's history coalescing session. Two edits to the same property on opposite sides of a keyboard blur remain separate undo entries even when less than 600 ms apart; no extra autosave occurs on blur alone.

A successful Clear override removes the overridden key and all local pending, raw and invalid-error entries for that key (including nested localized descendants). Failed Clear operations retain the drafts for correction. Unit tests cover EN/VI, exact-time undo and invalid number clearing. The registered `cms-builder-history.spec.ts` browser test uses a real activated draft, EN/VI keyboard blur, undo and responsive invalid override clearing. Exact-head CI and independent review remain required; this does not close the manual screen-reader or combined release gates.
