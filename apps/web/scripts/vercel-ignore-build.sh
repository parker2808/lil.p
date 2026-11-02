#!/bin/sh
# Shim for Vercel's "Ignored Build Step". Vercel runs `sh scripts/vercel-ignore-build.sh`
# from the project's Root Directory; when that is apps/web, this file forwards to the
# real rule in the repo-root scripts/ directory.
here=$(dirname "$0")
exec sh "$here/../../../scripts/vercel-ignore-build.sh"
