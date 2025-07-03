#!/bin/bash

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
  npm ci --prefix functions >/dev/null 2>&1
else
  echo "Functions packages already installed"
fi
cd frontend
if [ ! -d node_modules ]; then
  npm ci
else
  echo "Frontend packages already installed"
fi
npm run dev
