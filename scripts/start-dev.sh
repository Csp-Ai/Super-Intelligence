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

# Start only the hosting emulator
firebase emulators:start --only hosting &

# Launch frontend dev server
cd frontend
npm install
npm run dev
