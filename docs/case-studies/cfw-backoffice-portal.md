# Portfolio notes — CFW Back Office Portal (cfw-backoffice-portal)

Source: analysis of `c:\Users\vvhung6\Desktop\cfw\cfw-backoffice-portal` on 2026-10-26, branch `feat/YIMCMC-3837-workitem-flow` (includes `sit`).
Company: Central Food Wholesale (Central Group). Product: CDP Back Office — internal portal for customer master data, registration, and customer verification. Teammates on the same repo are mostly CMC Global (Jack Nguyen, Lea Nguyen) plus Central staff.

## Facts (verified via git)

- Two identities, counted from 1 Jun 2026. Do not merge them into one author.
  - Parker: `lilparker28 <<email>>` — same person as Parker on the Particula notes. 17 Jul 2026 – 21 Oct 2026. 7 commits on the branch tip (the earlier commits on the feature branches were squashed into these), about +5,213 / −589 lines. Owns the customer-verification field-config slice.
  - Bond Tran: `cmc-bond-tran` / `Bond <<email>>`. 15 Jun 2026 – 16 Jul 2026. Six squashed PRs on `sit` (#1194, #1195, #1196, #1198, #1199, #1204), about +1,019 / −240 lines. Branch commits before those squashes are the same work, not extra scope. Two co-author lines on other people's PRs (#1205 Thanh, #1208 Parker).
- Parker shipped on `sit`: hotfix #1208, #1214, #1215, YIMCMC-3734 (#1223), YIMCMC-3751 (#1227).
- Bond shipped on `sit`: YIMCMC-3150/3151 (#1194, #1195), YIMCMC-3181/3182 (#1196, #1198), YIMCMC-3152/3180 (#1199), YIMCMC-3145 column fix (#1204).
- Not on `sit` as of 2026-10-26: Parker's YIMCMC-3836 / YIMCMC-3837 and the TypeScript → JavaScript conversion (`feat/YIMCMC-3837-workitem-flow`). Bond's checkbox-active styling (`hotfix/styling-communication-checkbox-active`, 16 Jul) is also unmerged. Do not describe those as released.
- Stack of the portal (shared, not authored by Parker): Nuxt 3 SPA (`ssr: false`), Vue 3, Pinia, Vuetify 3, Tailwind with `tw-` prefix, vee-validate + yup, Firebase Auth + `@cfw-cg-passport` SSO, i18n `en-US` / `th-TH`, deployed to Cloud Run.
- Later commits (3734 follow-ups, 3751, 3836/3837, the TS conversion) list `Co-authored-by: Cursor`. Public write-ups should stay in Parker's voice and describe the behavior, not the assistant.

## Highlights authored by Parker

1. Field configuration admin (YIMCMC-3734, merged #1223, sole feature author, 15 files, +1,952). Screen at `/customer-verification/field-config` where an editor sets each customer field to `LOCK`, `VERIFY`, or `OPEN`. Catalog labels cover 16 groups and 205 field keys (profile, segment & attribute, business / billing / mailing address, delivery address 1–10, others), reused from the customer-detail i18n keys instead of a second string table. Pinia draft stores only modes that differ from the server, so reverting a field leaves no trace. Save sends a diff-only PUT to `customer-verification/field-configs`, each row carrying `expected_version` from the latest GET. A 409 `FIELD_CONFIG_VERSION_CONFLICT` is handled as a stale edit. Edit is gated by the field-config `CAN_EDIT` permission; route read access stays on the global auth middleware. UI is split into group list (mode counts + pending edits), detail panel, row, mode chip, legend, and an old → new confirm dialog.

2. Apply that config on the customer info form (YIMCMC-3751, merged #1227, 19 files, +2,586 / −295). `customerFieldRegistry` builds field codes from the same locale keys and maps them onto form paths: profile, segment (`segment_code`, `type_code`), business / billing / mailing address, delivery slots 1–6 with coordinates, delivery slots 7–10 without latitude/longitude. Alcohol license is registered as a document field and skipped by the form diff. Dynamic segment attributes match `SEGMENT_AND_ATTRIBUTE.<KEY_ID>` only when that code exists in the loaded catalog; anything else stays unmapped. `collectCustomerChanges` buckets a diff into verify / open / unmapped and drops `LOCK` (locked fields are not submitted). `planCustomerInfoSave`: if any VERIFY field changed, save opens a confirm dialog and does not call the API yet; confirm then sends catalog changes (verify + open) with `expected_config_versions`; leftover fields that are not in the catalog still go through the existing master PUT. Pending verifications in `PENDING_DATA`, `PENDING_APPROVAL`, `APPROVED`, or `REWORK_REQUIRED` overlay the latest `new_value` per field (latest `submitted_at`, then source order) back onto the form. OPEN edit needs customer view + edit. VERIFY edit also needs work-item view + edit. `positionAllowsEdit` allows the edit when the customer level is greater than or equal to the staff level, and does not block when either level is missing. A confirm gate ignores a second click while a request is in flight. Lock state and the previous value are provided into profile, segment attributes, billing / mailing / delivery / shop address lists, and document upload.

3. Assignee “Update Data” and rework prefill (YIMCMC-3836 / YIMCMC-3837, 6 files, +453). Not merged to `sit` yet. On top of the existing work-item detail dialog, assignees with work-item view and edit open an Update Data dialog and submit `POST customer-verification/work-items/{id}/submission` with `expected_version`, every scoped field, and a remark. If any field already has a saved `new_value` (Rework Required, or Pending Data after a failed apply), the dialog prefills those values and `submission_remark`. A 409 closes the dialog and asks the list to reload. The success toast distinguishes a work item that comes back `COMPLETED` from one that is only submitted. Field labels go through the same `useFieldConfigLabels` helper as the config screen.

4. TypeScript → JavaScript on the same unmerged branch (15 files, +221 / −348). Converts the field-config store, its composables and types, plus files Bond added in June (`date` / `number` / `text` utils, dropdown options, communication-channel constants) to plain JS. `COMMUNICATION_CHANNEL_ENUM` becomes a frozen object. `nuxt.config.ts` and Vue files that still use `lang="ts"` are left alone.

5. Small hotfixes already on `sit`:
   - #1208 — communication-channel “other” input kept a local draft, so each keystroke no longer cloned a stale prop and wiped the previous character. Co-authored with Bond (`<email>`). That PR also removed a Vitest setup.
   - #1214 (YIMCMC-3326) — five Thai strings.
   - #1215 — closed-business label in Thai and English, and the dropdown constant trimmed to match.

## Highlights authored by Bond Tran (from Jun 2026)

1. Communication channels (YIMCMC-3150 / 3151, #1194 + #1195, 18 Jun). New checkbox group on the contact method: Go Mail, Line, Facebook, Go App, Others. At least one channel is required when validation is on. Choosing Others reveals a free-text field, max 1,000 characters, required, reusing the existing required rule. Selection is stored as channel ids plus the other-channel string and wired through `ContactMethod.vue` into the customer page. #1195 only tightened that Others validation.

2. Customer credit info (YIMCMC-3181 UI #1196, 19 Jun; YIMCMC-3182 API #1198, 22 Jun). Read-only panel on the customer page: credit limit, used, remaining (decimal currency), effective date through expiry date, active / inactive chip, credit term in days, customer tier price, and lock yes / no. Empty values render as "-". #1198 is the integration pass: the panel reads `creditInfo` from the customer payload, and Bond added `formatDate`, `formatCurrency` / `formatInt`, and `isEmpty` in `date.util.ts`, `number.util.ts`, and `text.util.ts`. The same PR also touched the consent dialog, consent view, and dropped a few lines in `stores/consent.js`; that is a side edit, not a consent feature. The pricing-group block now sitting under this panel is Jack's YIMCMC-3698 (#1218), added later.

3. New profile fields (YIMCMC-3152 / 3180, #1199, 25 Jun, +168). On `ListProfile.vue`: position, space, VIP (Yes / No), closed-business status (Active / Closed Business), sponsorships (Yes / No), with en-US and th-TH labels and dropdown constants. Parker's later field-config registry maps VIP, closed business, and sponsorships onto these paths. Parker's #1214 / #1215 only changed the closed-business copy.

4. Layout hotfix (YIMCMC-3145, #1204, 1 Jul). One column class on the new profile section so the row stopped breaking. The later space/position API integration under the same ticket is Lea (#1206), not Bond.

5. Co-author only, do not list as Bond's features:
   - #1205 (2 Jul, author Thanh) — communication checkbox was selected by default; Bond is on the co-author line.
   - #1208 (17 Jul, author Parker) — the other-channel keystroke draft. Bond co-authored.
   - 16 Jul, unmerged: active-state styling on the communication checkbox.

## NOT either of them (don't claim)

- Parker does not claim Bond's June PRs. Bond does not claim field config, the customer-info verify flow, or Update Data.
- Customer Verification module shell, navigation, and permissions: Jack YIMCMC-3739 (#1221), Lea YIMCMC-3737 (#1224) and YIMCMC-3738 (#1222).
- Work-item dashboard and request list: Jack YIMCMC-3773 (#1228).
- Work-item list and work-item detail dialog: Lea YIMCMC-3757 (#1233). Parker added Update Data on that dialog; he did not build the list or the detail view.
- Create Assignment dialog and its search field: Lea YIMCMC-3772 (#1232, #1239).
- VIP → Elite label rename: Jack YIMCMC-3722 (#1217). The field code stayed `vip`; Parker only mapped `ProfileFieldCode.VIP` onto the existing form path.
- The rest of the portal: customer search, bulk update, parent-and-child, consent, user management, activity log, print member card, review docs, SSO / login, environment config, Cloud Run pipelines.
- Verification itself (who approves, how a work item is created) runs on the backend. The portal classifies the edit, sends `expected_config_versions` or `expected_version`, and renders the pending value.
