#!/bin/sh
# Vercel "Ignored Build Step": exit 1 builds, exit 0 skips.
# Only `main` (production) and `hotfix/*` branches deploy; every other branch is skipped
# so stacked feature PRs do not burn the Vercel deployment quota.
case "${VERCEL_GIT_COMMIT_REF:-}" in
  main | hotfix/*)
    echo "Deploying ${VERCEL_GIT_COMMIT_REF}"
    exit 1
    ;;
  *)
    echo "Skipping deploy for branch '${VERCEL_GIT_COMMIT_REF:-unknown}' (only main and hotfix/* deploy)"
    exit 0
    ;;
esac
