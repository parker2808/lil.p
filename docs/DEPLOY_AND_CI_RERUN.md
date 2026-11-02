# Deploying main to Vercel and re-running CI

Runbook for the day the Vercel deployment rate limit resets (planned for
2026-11-02, Asia/Saigon). It covers the first production deploy of `main` after
the Phase 5–6 merges, re-running every CI and Vercel check, re-enabling `hotfix/*`
deploys, verification and rollback.

> Automation: a scheduled routine runs at **19:30 on 2026-11-02 (Asia/Saigon)**. It
> deploys `main` to production and re-enables `hotfix/*` deploys using the steps
> below. Run them by hand only if that routine fails or is cancelled, and check
> its result before repeating anything.

## 1. Current setup

- `vercel.json` → `git.deploymentEnabled` is `{ "**": false, "main": true }`. Vercel
  creates deployments (and PR checks) only for `main`.
- `scripts/vercel-ignore-build.sh` (`ignoreCommand`) is a second guard: `main`
  builds, `hotfix/*` builds only when `HOTFIX_DEPLOYS_ENABLED=1` (currently `0`),
  every other branch is skipped.
- GitHub Actions `CI` runs on pushes to `main`, on every pull request and on
  `workflow_dispatch`. `context-check` runs on PRs into `main`.
- Free plan limit: 100 deployments per day. Keep preview deploys off for feature
  branches.

## 2. Before deploying

1. Confirm the rate limit has reset: Vercel dashboard → project → Deployments.
   A new deployment must not show "rate limited".
2. Confirm `main` CI is green:

   ```sh
   gh run list --branch main --workflow CI --limit 3
   gh run view <run-id> --json conclusion -q .conclusion   # expect "success"
   ```

3. Database: the Render API runs `prisma migrate deploy` on start. Check which
   migrations are pending on production **before** the API redeploys, and get
   Parker's go-ahead for any schema change (for example P4-6 T24
   `20261101082635_site_settings_hero_stats`). Agents never run migrations on
   TiDB.

## 3. Deploy main to production

Pick one option.

**Dashboard.** Project → Deployments → latest `main` deployment (or the last one
that failed with the rate limit) → ⋯ → **Redeploy** → leave "Use existing Build
Cache" off → Redeploy. It goes to Production because the branch is `main`.

**Vercel CLI** (from a clean checkout of `origin/main`, project linked with
`vercel link`):

```sh
git fetch origin && git checkout --detach origin/main
vercel deploy --prod          # build on Vercel from the current tree
# or redeploy an existing deployment:
vercel ls lil-p --prod        # find a deployment URL
vercel redeploy <deployment-url> --target production
```

**Git trigger.** Any push to `main` (for example merging a PR) deploys it
automatically. An empty commit also works, but prefer the dashboard so `main`
history stays clean.

## 4. Re-run CI and Vercel checks

Re-run the latest CI on `main`:

```sh
gh workflow run CI --ref main
gh run watch "$(gh run list --branch main --workflow CI --limit 1 --json databaseId -q '.[0].databaseId')"
```

Re-run failed jobs on every open PR:

```sh
for pr in $(gh pr list --state open --json number -q '.[].number'); do
  run=$(gh run list --branch "$(gh pr view "$pr" --json headRefName -q .headRefName)" \
    --workflow CI --limit 1 --json databaseId -q '.[0].databaseId')
  [ -n "$run" ] && gh run rerun "$run" --failed
done
gh pr checks <number>        # per-PR status
```

Vercel checks: feature branches have no Vercel check by design. For `main`, use
the Redeploy button (section 3). For a `hotfix/*` PR after section 5, push a new
commit or use Redeploy on that branch's deployment.

## 5. Re-enable `hotfix/*` deploys

In one PR from a `hotfix/*` or normal branch into `main`:

1. `vercel.json`:

   ```json
   "git": { "deploymentEnabled": { "**": false, "main": true, "hotfix/**": true } }
   ```

2. `scripts/vercel-ignore-build.sh`: set `HOTFIX_DEPLOYS_ENABLED=1` and update the
   date comment.
3. Update `PROJECT_CONTEXT.md` §7 (Vercel deploys item) and §9 (changelog); the
   `context-check` job requires it.
4. After merge, test with a throwaway `hotfix/vercel-smoke` branch: it should get a
   Vercel preview deployment; any other branch should not.

The agreed flow stays: change code in a PR → merge to `main` → production deploy.
If production breaks, open a `hotfix/*` PR; only those branches get preview deploys.

## 6. Verify production

- Vercel deployment status is **Ready** and assigned to the production domain.
- Open `/en`, `/vi`, `/en/projects`, one case study, `/en/about`, `/en/contact`
  and `/admin/login`; sign in and open the admin dashboard.
- `curl -sI https://<production-domain>/en | head -1` → `200`.
- API health through the web origin: `curl -s https://<production-domain>/api/health`.
- Check Vercel → Logs and Render → Logs for errors during the first minutes.

## 7. Rollback

- **Vercel (instant):** dashboard → Deployments → previous good production
  deployment → ⋯ → **Instant Rollback** (or `vercel rollback <deployment-url>`).
  This does not rebuild and does not count as a new build.
- **Code:** open a `hotfix/*` PR that reverts the bad merge
  (`git revert -m 1 <merge-sha>`), let CI pass, merge. Never force-push `main`.
- **Database:** migrations are not rolled back automatically. Any data or schema
  fix on TiDB needs Parker's approval and is done by Parker.
- After a rollback, auto-promotion of new `main` deploys may be paused; promote
  the fixed deployment from the dashboard (**Promote to Production**).
