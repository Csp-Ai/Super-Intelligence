#!/usr/bin/env bash

# Try npm ci and fallback to legacy peer deps when not running in CI
safe_npm_ci() {
  local prefix_arg=""
  if [ -n "$1" ]; then
    prefix_arg="--prefix $1"
  fi
  npm ci $prefix_arg >/dev/null 2>&1
  local status=$?
  if [ $status -ne 0 ]; then
    if [ -z "$CI" ] || [ -n "$DEV_NPM_LEGACY" ]; then
      echo "npm ci failed, retrying with --legacy-peer-deps"
      npm ci $prefix_arg --legacy-peer-deps >/dev/null 2>&1
    else
      return $status
    fi
  fi
}

# Ensure Firebase login locally
firebase login || echo "Already logged in or using CI token"

# Check for Java before starting emulators
if ! java -version >/dev/null 2>&1; then
  msg="Java is required for Firestore and PubSub emulators. Please install JDK 11+."
  echo "$msg"
  echo "https://adoptium.net"
  log_file="$(dirname "$0")/../emulator-debug.log"
  echo "$(date '+%Y-%m-%d %H:%M:%S') - $msg" >> "$log_file"
  exit 0
fi

# Start Firebase emulators for functions, Firestore, and Hosting
firebase emulators:start --only functions,firestore,hosting &

# Launch frontend dev server
if [ ! -d functions/node_modules ]; then
  safe_npm_ci functions
else
  echo "Functions packages already installed"
fi
cd frontend
if [ ! -d node_modules ]; then
  safe_npm_ci
else
  echo "Frontend packages already installed"
fi
npm run dev
