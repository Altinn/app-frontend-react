#!/bin/bash

cleanup() {
    kill $(jobs -p) 2>/dev/null
    exit
}

trap cleanup SIGINT SIGTERM EXIT
yarn gen:watch &
cross-env NODE_ENV=development webpack-dev-server --config webpack.config.development.js --mode development --progress
cleanup
]
