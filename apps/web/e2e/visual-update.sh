#!/bin/sh
# Re-renders the visual.spec.ts baselines with the CI browser (Linux Chromium, x86_64)
# from any host: Playwright drives a Docker browser that reaches the local servers.
# Extra arguments go to `playwright test`, e.g. `-g "public home"`.
set -eu

version=$(pnpm exec playwright --version | awk '{print $2}')
port=${VISUAL_BROWSER_PORT:-3399}

container=$(docker run -d --rm --init --platform linux/amd64 -p "127.0.0.1:${port}:${port}" \
  "mcr.microsoft.com/playwright:v${version}-noble" \
  npx -y "playwright@${version}" run-server --port "$port" --host 0.0.0.0)
trap 'docker stop "$container" >/dev/null' EXIT

tries=0
until docker logs "$container" 2>&1 | grep -q 'Listening on'; do
  tries=$((tries + 1))
  [ "$tries" -lt 180 ] || { echo 'Playwright browser server did not start' >&2; exit 1; }
  sleep 1
done

PW_TEST_CONNECT_WS_ENDPOINT="ws://127.0.0.1:${port}/" \
  PW_TEST_CONNECT_EXPOSE_NETWORK='<loopback>' \
  pnpm exec playwright test visual.spec.ts --update-snapshots "$@"
