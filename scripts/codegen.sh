#!/bin/bash

if command -v bun >/dev/null 2>&1; then
    export RUNTIME="bun"
else
    export RUNTIME="tsx"
fi

if [ "$1" = "watch" ] || [ "$1" = "--watch" ]; then
    exec $RUNTIME src/codegen/watch.ts
else
    exec $RUNTIME src/codegen/run.ts
fi
