#!/bin/sh
set -eu
cd "$(dirname "$0")"
if command -v node >/dev/null 2>&1; then
  musical_node=$(command -v node)
else
  musical_node="$HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node"
fi
if [ ! -x "$musical_node" ]; then
  echo 'Install Node.js 20.19+ or 22.12+ to start this prototype.' >&2
  exit 1
fi
if [ ! -f node_modules/vite/bin/vite.js ]; then
  echo 'Install dependencies first with pnpm install.' >&2
  exit 1
fi
exec "$musical_node" node_modules/vite/bin/vite.js --host 0.0.0.0
