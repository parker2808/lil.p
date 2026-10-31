<!-- Archived verbatim from docs/plans/ui-redesign.md (11. Future, out of scope (needs backend)); links re-pointed. Index: ../../plans/ui-redesign.md -->

## 11. Future, out of scope (needs backend)

None of these are part of R1–R16 (including R4b). Each needs a NestJS / Prisma / API change.

| Idea                                                                                     | Why it needs BE                                                                            | Frontend stop-gap in this plan                                                                                       |
| ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------- |
| `TODO_PLACEHOLDER` health issue kind                                                     | `/api/admin/health` has no such kind                                                       | Client-side check in `PublishChecks` and the field warning (R14); public guard (R2).                                 |
| Scheduled publishing (“Scheduled” status)                                                | Status enum is DRAFT / PUBLISHED / ARCHIVED; no future `publishedAt` workflow for projects | Not shown.                                                                                                           |
| Stored image placeholders (blurhash / dominant color computed at upload) and focal point | No such fields on media                                                                    | Cloudinary LQIP derived from the URL at render time (R4b `CmsImage`), plus `GenerativeCover` and aspect-ratio boxes. |
| Remembering the real block order per page for `loading.tsx` on a cold cache              | The public API has no lightweight “layout only” endpoint                                   | `loading.tsx` uses the cached page layout when present, or else a per-route default skeleton.                        |
| Public project gallery                                                                   | Public detail schema has no `images[]`                                                     | Images inside markdown only.                                                                                         |
| Per-block “hide on public when empty” setting                                            | Visibility is computed, not stored                                                         | Computed in the renderer (R2) and shown in the page builder (R14).                                                   |
| `INVERSE` block surface                                                                  | `BLOCK_SURFACES` is PLAIN / BAND                                                           | `cta-band` renders inverse by block type.                                                                            |
| Server-side diacritics-insensitive search for posts/projects                             | Search runs client-side over the loaded page                                               | Client filter (R11, R12).                                                                                            |
| Pinned / featured post flag                                                              | No such field                                                                              | “Pinned” = the newest published post.                                                                                |
| Per-locale OG images generated from the new design                                       | Needs an image route with fonts + data; could run on Vercel OG but touches SEO config      | Existing OG.                                                                                                         |

---

