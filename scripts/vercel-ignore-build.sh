#!/bin/sh
# Vercel "Ignored Build Step": exit 1 builds, exit 0 skips.
# `main` (production) always deploys. `hotfix/*` branches deploy only when
# HOTFIX_DEPLOYS_ENABLED is 1; every other branch is skipped so stacked feature PRs
# do not burn the Vercel deployment quota.
#
# Toggle: set HOTFIX_DEPLOYS_ENABLED=1 to re-enable hotfix/* preview deploys.
# Disabled on 2026-11-01 while the Vercel deployment rate limit resets.
HOTFIX_DEPLOYS_ENABLED=0

branch="${VERCEL_GIT_COMMIT_REF:-}"
case "$branch" in
  main)
    echo "Deploying main"
    exit 1
    ;;
  hotfix/*)
    if [ "$HOTFIX_DEPLOYS_ENABLED" = 1 ]; then
      echo "Deploying $branch"
      exit 1
    fi
    echo "Skipping $branch: hotfix deploys are disabled (HOTFIX_DEPLOYS_ENABLED=0)"
    exit 0
    ;;
  *)
    echo "Skipping deploy for branch '${branch:-unknown}' (only main and hotfix/* deploy)"
    exit 0
    ;;
esac
