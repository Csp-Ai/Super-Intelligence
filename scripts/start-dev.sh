#!/bin/bash

# Ensure Firebase login locally
firebase login || echo "Already logged in or using CI token"

# Start only the hosting emulator
firebase emulators:start --only hosting &

# Launch frontend dev server
cd frontend
npm install
npm run dev
