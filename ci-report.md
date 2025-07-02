# Agent Test Coverage

✅ roadmap-agent - tested  
✅ resume-agent - tested  
✅ opportunity-agent - tested  
⚠️ anomaly-agent - failing  
✅ insights-agent - tested  
⚠️ trends-agent - failing  
❌ alignment-core - missing  

## Firebase Hosting
- Endpoint: localhost:5000 (emulator)

## Build
- 2025-07-02: Added `app.yaml` for Cloud Build and reauthenticated emulator with `firebase login --reauth`.
- 2025-07-02: Configured CI to use `FIREBASE_TOKEN` for non-interactive `firebase deploy`.

## Local Launch Tools
- 2025-07-02: Added `start-dev.sh` to automatically log in via `firebase login:ci` and run the frontend with the Hosting emulator.

## Local Launch Fixes
- 2025-07-02: ✅ Added placeholder `dev` script and environment check in `start-dev.sh`.
