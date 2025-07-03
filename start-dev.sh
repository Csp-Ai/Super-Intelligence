#!/bin/bash
set -e

function cleanup() {
  echo "\nShutting down services..."
  if [[ -n "$EMULATOR_PID" ]]; then
    kill "$EMULATOR_PID" 2>/dev/null || true
  fi
  exit 0
}
trap cleanup INT TERM

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

echo "Starting Firebase Hosting emulator..."
firebase emulators:start --only hosting &
EMULATOR_PID=$!

echo "Launching frontend dev server..."
npm install >/dev/null 2>&1
npm install --prefix functions >/dev/null 2>&1
npm run dev
