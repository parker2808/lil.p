# Stage A curl and instance-drain checklist (release owner only)

Parker's reported **forward-only policy approval (“OK”, 2026-11-15 08:54 ICT)**
sets the required pause, old-instance drain, D2 verification and roll-forward
recovery policy. It is not, by itself, an independently verified grant for the
#210 production merge/deploy, mutation probes, #199 migration, D2-aware reopen
or reopen verification. The release owner must confirm separate authorization
for each production action before the merge chain (1125a5b3) and coordinator
execute it; each stage also requires the preceding evidence gate to pass.
Render auto-deploy remains ON, so an authorized `main` merge that matches its
build filter can trigger a production deploy. **Do not send mutation probes
until the authorized Stage A freeze is live.** This checklist sends
unauthenticated requests with an invalid body, nonexistent page key and invalid
numeric IDs. It must not send
cookies, bearer tokens, real page keys or personal data. A successful HTTP
probe is **not** proof that all old instances have drained; a Render “Live”
deploy or repeated 503 responses is not proof either.

## Read-only inventory worksheet (prepare before requesting a deploy)

These requests are **read-only** and intended for the coordinator's
already-authorized Render connector/API session and the release owner's Vercel
session. There is no Render CLI on the operator Mac: do not install one or
request a login to fill this worksheet. Do not paste credentials on the command
line, in logs or in a PR. Never run a deploy, restart, migration, DB command or
the mutation probes below merely to fill this worksheet.

Coordinator-run via the authenticated Render API (the paths are request
descriptions, **not** shell commands; use the approved service/workspace IDs in
the connector, without publishing credentials or raw responses):

1. `GET /v1/services/{serviceId}`: confirm workspace, region, branch, build
   filter, auto-deploy setting, Docker configuration and configured instance
   count. **Keep Render auto-deploy ON**: merging #210 and #199 to `main` with
   `apps/api/**` changes triggers their deploys; this configuration is not
   authorization to merge or deploy. Complete the pre-merge
   inventory before #210 and verify each stage before merging the next. Keep
   `main` quiet until reopen: another `apps/api/**` or `packages/contracts/**`
   merge during this window could also deploy an API image.
2. `GET /v1/services/{serviceId}/deploys` (follow every pagination cursor),
   then `GET /v1/services/{serviceId}/deploys/{deployId}` for the live and
   adjacent deploys: record commit, status, timestamps and prior deactivation.
3. `GET /v1/services/{serviceId}/instances` **before and after** the approved
   Stage A deploy: capture complete sets B and A, verify each ID's deploy/image
   association and compare `B ∩ A`. A configured count of one is not a
   complete live-instance roster.
4. `GET /v1/logs` scoped by the authorized workspace (`ownerId`), service
   (`resource`), and a bounded `startTime`/`endTime`; follow `hasMore` with
   `nextStartTime`/`nextEndTime`. Correlate shutdown and in-flight completion
   per old instance; redact log contents before sharing. Logs alone cannot
   attest to a complete fleet.

The coordinator's read-only observation at 12:48 ICT, 2026-11-16 found the
direct Render API health endpoint at HTTP 200, with one instance configured
and the prior deploy still live. This is **not** a pre/post Stage A instance
inventory, a drain proof, or permission to send writes. The approved direct
origin stays in the coordinator's private worksheet; after the #210 merge has
deployed the live freeze, supply it as `--render-url` to
`scripts/probe-stage-a-d2.mjs` for the direct leg alongside Vercel `/api`.

```sh
# Run from the already-linked, authorized Vercel project (or supply its name).
vercel list --environment production
vercel inspect "$VERCEL_DEPLOYMENT"
```

Render API references: [service](https://api-docs.render.com/reference/retrieve-service),
[deploys](https://api-docs.render.com/reference/list-deploys),
[instances](https://api-docs.render.com/reference/list-instances),
[logs](https://api-docs.render.com/reference/list-logs). Vercel
[list](https://vercel.com/docs/cli/list) / [inspect](https://vercel.com/docs/cli/inspect)
are read-only; verify the active workspace/project **before** trusting output.
Do not publish raw instance IDs, origins, headers or unredacted logs; keep the
detailed worksheet in the release owner's private evidence channel and share
only a redacted summary.

| Evidence point      | Release-owner record (private)                                                                                                                                                                                              | STOP if                                                                                                                             |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Before Stage A      | Capture time, service/deploy IDs, reviewed image SHA, complete active instance-ID set **B** and ingress mapping. Check other page writers/jobs and Render startup/pre-deploy commands.                                      | Missing instance/commit association, unknown writer or ingress, or another API-bearing merge to `main` during the rollout.          |
| After Stage A       | Capture time, Stage A deploy ID/SHA, complete active instance-ID set **A**, each image identity and shutdown/in-flight completion events for every ID in **B**.                                                             | `B ∩ A` is nonempty, any instance is not Stage A, shutdown/in-flight state is unknown or roster completeness cannot be established. |
| Before D2 migration | Confirm reviewed D2 image **retains the freeze**; inventory every writer, scheduled job, one-off command and startup/pre-deploy hook. The tracked Docker entrypoint runs `prisma migrate deploy` **before** the API starts. | An old unfrozen writer survives, migration might run before drain, or an unaccounted job can write pages. Do not deploy D2.         |
| Vercel `/api`       | Record active production deployment/commit and verify `/api/:path*` rewrite points at the approved Render service.                                                                                                          | Alias/deployment or rewrite target differs, or another API ingress is unaccounted for.                                              |

The CLI roster is a point-in-time observation, not proof of finished requests:
correlate deployment events, shutdown/in-flight evidence and repeated complete
inventories. The admin `deployment-state` read samples **one** API instance,
not the fleet. If Render cannot attest the full fleet or all ingress paths,
keep Stage A frozen rather than guessing from a timer, health check or green CI.

**Local repository inventory performed (2026-11-16, read-only):**
`render.yaml` declares one Docker web service with `/api/health` health check;
`apps/api/Dockerfile` invokes `apps/api/docker-entrypoint.sh`, which runs
`prisma migrate deploy` at startup; `apps/web/next.config.ts` rewrites
`/api/:path*` to the configured API origin. These tracked files cannot reveal
live Render instance IDs, active commits, Vercel alias or outside writers.
The coordinator's initial Render API observation is **not** a pre/post drain
inventory; Vercel production inventory and mutation probes remain unexecuted.
Stage A stays **HOLD**.

## Before the Stage A deploy

1. Pin the reviewed pre-D2 Stage A image commit and confirm it includes the
   write-freeze middleware but **no D2 migration**. Keep auto-deploy on;
   merge #210 to `main` only with separate production authorization and after
   the pre-merge inventory is complete.
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
   checklist is preparation, not a production drain attestation; keep the freeze
   and use the forward-only sequence in the
   [Stage A spec](../specs/2026-11-15-cms-pre-d2-write-freeze.md).

## Reopen and failure path

After the D2 migration/data checks pass, keep writes frozen until the full
roster contains only the reviewed D2-aware image. With separate production
authorization, the merge chain then deploys the D2-aware reopen and performs
controlled, authenticated
save/restore/publish/activation CAS verification on an approved
disposable record via **both** Render and Vercel ingress, with read-back; the
unauthenticated sentinel probes above are **not** a reopen test. On any missing
evidence or failed gate, **do not reopen**: retain the freeze and roll forward
to a corrected D2-aware image. Never roll back to a pre-D2 API writer after
the migration. See the [deploy runbook](./deploy.md#stage-a--d2-page-write-rollout-release-owner-only).
