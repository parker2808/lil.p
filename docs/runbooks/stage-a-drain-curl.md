# Stage A curl and instance-drain checklist (release owner only)

**Prepared only; do not run against production without separate deployment and
verification approval.** This checklist sends unauthenticated requests with an
invalid body, nonexistent page key and invalid numeric IDs. It must not send
cookies, bearer tokens, real page keys or personal data. A successful HTTP
probe is **not** proof that all old instances have drained; a Render “Live”
deploy or repeated 503 responses is not proof either.

## Before the Stage A deploy

1. Pin the approved pre-D2 Stage A image commit and confirm it includes the
   write-freeze middleware but **no D2 migration**. The release owner must
   separately authorize the deploy and keep auto-deploy disabled.
2. In the authenticated Render service view, record the **complete set** of
   active API instance IDs and their image commits before deploying. Also
   record the service ID, deploy ID and capture time, without copying session
   credentials or unredacted logs into the PR. If the active-instance inventory
   or commit association is unavailable, stop: there is no no-overlap proof.
3. Obtain the direct Render HTTPS origin from the approved service settings and
   the Vercel production origin from its deployment settings. Supply these
   origins to the following commands in an authorized terminal; do not put
   credentials, paths, query strings or a trailing slash in either value.

## Curl-only ingress probes, before and after drain

Use the exact approved origins (the placeholders are **not** usable URLs):

```sh
RENDER_ORIGIN='https://<actual-render-host>'
VERCEL_ORIGIN='https://<actual-vercel-host>'

for origin in "$RENDER_ORIGIN" "$VERCEL_ORIGIN"; do
  printf '\n%s GET /api/health: expect HTTP 200, {"status":"ok","db":"ok"}\n' "$origin"
  curl --silent --show-error --max-time 10 --include "$origin/api/health"
done
for path in /en /vi; do
  printf '\nVercel GET %s: expect HTTP 200\n' "$path"
  curl --silent --show-error --max-time 10 --include "$VERCEL_ORIGIN$path"
done

while read -r method path; do
  for origin in "$RENDER_ORIGIN" "$VERCEL_ORIGIN"; do
    printf '\n%s %s %s: expect HTTP 503 and Retry-After: 120\n' "$origin" "$method" "$path"
    curl --silent --show-error --max-time 10 --include --request "$method" \
      --header 'Content-Type: application/json' --data '{}' "$origin$path"
  done
done <<'MUTATIONS'
POST /api/admin/pages
PATCH /api/admin/pages/stage-a-probe-not-a-page
POST /api/admin/pages/stage-a-probe-not-a-page/blocks
PATCH /api/admin/pages/stage-a-probe-not-a-page/blocks/order
PATCH /api/admin/pages/stage-a-probe-not-a-page/blocks/0
POST /api/admin/pages/stage-a-probe-not-a-page/blocks/0/duplicate
DELETE /api/admin/pages/stage-a-probe-not-a-page/blocks/0
POST /api/admin/pages/stage-a-probe-not-a-page/publish
POST /api/admin/pages/stage-a-probe-not-a-page/versions/0/restore
POST /api/admin/pages/stage-a-probe-not-a-page/discard
POST /api/admin/pages/stage-a-probe-not-a-page/builder/activate
PUT /api/admin/pages/stage-a-probe-not-a-page/builder/draft
POST /api/admin/pages/stage-a-probe-not-a-page/builder/publish
POST /api/admin/pages/stage-a-probe-not-a-page/versions/0/builder/restore
MUTATIONS
```

Inspect **every** result, not just the last command's exit code: 2 health
responses and both localized public reads must be 200, and all 28 mutation
responses must be 503 with `Retry-After: 120` and the Stage A JSON error
(`statusCode: 503`, `code: INTERNAL`, `message: Page writes temporarily paused`,
nonempty `requestId`). A 401, 404, redirect, unrelated 503, timeout or malformed
body is **STOP**. Do not follow redirects or accept cache hits as write
evidence. The existing `node scripts/probe-stage-a-d2.mjs` automates these
33 public checks, including the Vercel root read, but is not needed for this
curl-only checklist. Admin page/version **GETs require an admin session** and
cannot be asserted 200 by these credential-free commands; the release owner
must verify those read-only routes separately in an authorized session without
printing credentials. Public EN/VI pages and health are the credential-free
read-availability checks here.

## Read-only Render drain check (no API token in commands)

1. In Render's authenticated service deploy view, verify the _approved_ Stage A
   commit and deploy status. Compare the current active-instance inventory and
   instance/startup/shutdown events against the **pre-deploy instance-ID set**;
   each old ID must be absent, and each remaining ID must match the approved
   Stage A commit. Confirm shutdown and in-flight request completion rather
   than relying on a fixed wait period. A Live deploy alone is insufficient.
2. Using the existing admin session, inspect read-only
   `GET /api/admin/deployment-state` for `pageWritesFrozen: true` and the
   approved commit, service and instance IDs. This endpoint reports one
   responding instance, **not** a full fleet inventory. Match _every_ current
   instance against the Render inventory and approved image; missing/malformed
   IDs, unknown replicas, unmapped ingress or a missing pre-deploy roster are
   **STOP**. Do not print session cookies, tokens or unredacted logs.
3. Rerun the curl matrix after the old-instance set disappears. Record the
   timestamp, approved SHA, deploy ID, **redacted** before/after instance-ID
   comparison and 33/33 HTTP result in the release owner's private evidence
   channel. If any observation is incomplete, **do not deploy D2**. This
   checklist is preparation, not a production drain attestation or migration
   approval; keep the freeze and use the forward-only sequence in the
   [Stage A spec](../specs/2026-11-15-cms-pre-d2-write-freeze.md).
