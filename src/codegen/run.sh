#!/bin/env bash

set -e
set -u

cd "$(dirname "$0")"
cd ../..

function runScript {
  local script=$1
  node -r ts-node/register/transpile-only -r tsconfig-paths/register "$script"
}

runScript src/codegen/stage1.ts
runScript src/codegen/stage2.ts
