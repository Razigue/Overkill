#!/bin/sh
set -eu

# Synchronise le volume node_modules après un pull qui modifie package-lock.json.
npm install --no-audit --no-fund

exec "$@"
