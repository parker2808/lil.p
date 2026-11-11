# Contact form hydration readiness and value retention

## Plan (8 lines)

1. Reproduce the current contact failure under the shared E2E lock.
2. Compare the unmerged #183 fix and contact submission paths.
3. Keep SSR form fields editable without hydration discarding text.
4. Mark actual client interactivity after mount, not after page load.
5. Assert pre-hydration values and one client submission.
6. Repeat focused browser cases on disposable MySQL.
7. Refresh Graphify and current-behavior documentation.
8. Run the guarded full gate and open a draft PR.

## Scope and contract

On the public contact route, SSR fields can receive input before hydration.
Those DOM values must survive hydration, including name, email, message and
optional topic; client submission must read the currently posted fields and
send exactly one request. The interactive marker is set by the ContactForm
mount effect, not by a timeout or page `load`. The ordinary Playwright submit
test must await that marker before filling, so it intentionally tests the
hydrated path. A separate test delays JS, enters data first, then asserts
preservation after mount and captures the submitted payload. Preserve server
action progressive enhancement and validation; no UI copy, backend or DB
change, and no baselines/thresholds/retries.

## Verification and rollback

Red baseline: a delayed-script browser case entered name, email and message
before hydration, then failed at submission: the form showed stale TanStack
validation errors and no client POST, although DOM values and FormData held
the inputs. The original focused submit case passed 20/20. After synchronizing
the pre-hydration DOM values with form state at mount, the regression enters
name/email/message before hydration and confirms exactly one client request
with all fields: 10/10 delayed-script runs passed.

Local verification: `pnpm check:all` passed 7/7, and the guarded
disposable-MySQL `pnpm check:all --e2e` passed 11/11 (including API,
web and fixture E2E). No screenshots, baselines, golden contracts or DB
schema changed.

Graphify's code-only update covers AST symbols and dependencies, not the
meaning of this spec or README; those document changes are reviewed directly.

Record repeated green counts. Use only the guarded,
disposable-MySQL E2E script under `~/.t3/locks/lilp-e2e.lock`; check ports
before starting servers and release only our lock. `pnpm check:all --e2e`
is the final local gate. Rollback reverts this form/test-only PR; no data
or migration changes.
