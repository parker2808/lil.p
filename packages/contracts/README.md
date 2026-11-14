# Portfolio host contracts

`@portfolio/contracts` owns lil.p's twenty block definitions, their EN/VI copy,
the finite HTTP block-type schema and the host registry composed from those
definitions. Nest and Next continue to use its existing public contract paths.

`@parker2808/cms-core/contracts` owns generic Zod page/block/locale/snapshot
schemas, `defineBlock`, `createRegistry` (duplicate types throw), and the
page-allowance predicate. Importing core alone does not load portfolio block
definitions. The host passes its definitions to `createRegistry`; the package
does not embed the portfolio or change the existing HTTP contract.
