#!/bin/bash

declare -a bg_pids=()

cleanup() {
    local exit_code=$?

    # Only run cleanup once
    if [[ "${cleanup_done:-}" == "true" ]]; then
        return $exit_code
    fi
    cleanup_done=true

    # Kill background processes if any exist
    if [[ ${#bg_pids[@]} -gt 0 ]]; then
        for pid in "${bg_pids[@]}"; do
            if kill -0 "$pid" 2>/dev/null; then
                kill "$pid" 2>/dev/null
            fi
        done

        # Wait for processes to terminate gracefully
        for pid in "${bg_pids[@]}"; do
            wait "$pid" 2>/dev/null
        done
    fi

    exit $exit_code
}

trap 'cleanup' SIGINT SIGTERM EXIT

# Start background process and store its PID
yarn gen:watch &
bg_pids+=($!)

cross-env NODE_ENV=development webpack-dev-server --config webpack.config.development.js --mode development --progress
