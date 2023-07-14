#!/bin/env bash

set -e
set -u

cd "$(dirname "$0")"
cd ../..

function runScript {
  local script=$1
  if command -v bun &> /dev/null; then
    # Run with bun if available
    set +e
    bun run "$script"
    set -e
  else
    # Run with node/ts-node if bun is not available
    npx ts-node -r tsconfig-paths/register "$script"
  fi
}

runScript src/codegen/stage1.ts
runScript src/codegen/stage2.ts
