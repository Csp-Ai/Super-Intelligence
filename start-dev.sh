#!/bin/bash
set -e

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

trap "echo '\nShutting down services...'" INT TERM

echo "Checking Firebase authentication..."
if ! firebase projects:list >/dev/null 2>&1; then
  echo "Logging in via browser..."
  firebase login:ci --no-localhost || {
    echo "Firebase login failed"; exit 1; }
else
  echo "Firebase CLI already authenticated"
fi

if grep -q "FIREBASE_" .env 2>/dev/null; then
  echo "Environment setup detected."
fi

# Check for Java before starting emulators
if ! java -version >/dev/null 2>&1; then
  msg="Java is required for Firestore and PubSub emulators. Please install JDK 11+."
  echo "$msg"
  echo "https://adoptium.net"
  echo "$(date '+%Y-%m-%d %H:%M:%S') - $msg" >> emulator-debug.log
  exit 0
fi

echo "Launching development environment..."

if [ ! -d node_modules ]; then
  echo "Installing root npm packages..."
  safe_npm_ci
else
  echo "Root packages already installed"
fi

if [ ! -d functions/node_modules ]; then
  echo "Installing functions npm packages..."
  safe_npm_ci functions
else
  echo "Functions packages already installed"
fi

npm run dev
