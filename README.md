# 🧠 Super-Intelligence

[![Firebase CI/CD](https://github.com/yourusername/Super-Intelligence/actions/workflows/firebase.yml/badge.svg)](https://github.com/yourusername/Super-Intelligence/actions/workflows/firebase.yml)
[![Ship Mode](https://img.shields.io/badge/Ship%20Mode-%E2%9C%85%20Ready%20to%20deploy%20anywhere-brightgreen)](https://github.com/yourusername/Super-Intelligence)

**Building ethical, human-centered superintelligence to empower individuals and transform global systems.**

---

## 🚀 Overview

This repository is the foundation for an agent-driven ecosystem that powers platforms like **Opportunity Engine**—a personal transformation engine that generates scholarships, career roadmaps, and custom resources based on user goals.

Our mission is to build **modular, ethical superintelligence** systems that:
- Align with human values
- Elevate underserved voices
- Automate opportunity matching
- Deliver explainable, scalable, and just outcomes

---

## 🛠️ Core Modules (WIP)

| Agent / Module         | Purpose |
|------------------------|---------|
| `roadmap-agent`        | Generates personalized milestone plans for users based on goals |
| `resume-agent`         | Creates tailored resume/LinkedIn profiles |
| `opportunity-agent`    | Matches grants, internships, schools, and jobs |
| `insight-agent`        | Analyzes local/global data for contextual recommendations |
| `alignment-core`       | Implements Constitutional AI principles and safety checks |

---

## 🌍 Platform Example: Opportunity Engine

A UI-driven system that allows users to input:
- Name
- Email
- Zip Code
- Current Standing
- Dream Outcome

And receive:
- 📍 A step-by-step roadmap
- 📄 A customized resume
- 🔍 Curated opportunities
- 🤖 Ongoing AI support via chat agents

---

## 📦 Tech Stack

- **Frontend**: HTML/CSS, custom neural UI, React (future)
- **Backend**: Firebase (Firestore, Functions, Auth)
- **AI**: In-house models built on open-source frameworks (planned)
- **Infra**: Node.js, GitHub Actions, Firebase Hosting

---

## 🔐 Ethical Focus

This system follows ethical design guidelines including:
- Value alignment (human-in-the-loop feedback)
- Transparency (explainable agent logic)
- Global accessibility (multi-lingual + inclusive)
- Cultural adaptability
- Long-term safety and governance

Inspired by principles from:
- UNESCO AI Ethics
- Anthropic's Constitutional AI
- Future of Life Institute

---

## 🧪 Getting Started

> ⚠️ Setup instructions and sample data coming soon.

### Local Development

1. Run the environment setup script:
   ```bash
   ./scripts/setupEnv.sh
   ```
2. Install root dependencies:
   ```bash
   npm install
   ```
3. Install Cloud Functions dependencies:
   ```bash
   npm install --prefix functions
   ```
4. Install frontend dependencies:
   ```bash
   npm install --prefix frontend
   ```
   Run this separately after the root install. The Cloud Build pipeline
   also performs `npm install` so the Vite production build works.
5. Create environment files in `frontend/` using the provided example:
   ```bash
   cp frontend/.env.example frontend/.env
   cp frontend/.env.example frontend/.env.local
   cp frontend/.env.production frontend/.env.production.local
   ```
   Edit these files to include your Firebase config such as
   `VITE_FIREBASE_API_KEY`.
6. Run tests from the repo root (requires functions dependencies):
   ```bash
   npm test --silent
   ```
7. If the Firebase emulator reports authentication errors, re-authenticate using:
   ```bash
   firebase login --reauth
   ```

### Launching Local Dev Environment

To run Firebase Hosting locally and start the frontend app:

```bash
./start-dev.sh
```
If you're not logged into Firebase, it will prompt you.

On CI, auth is handled via `FIREBASE_TOKEN`.

### CI Deploys

1. Generate a token locally using `firebase login:ci`.
2. Store it as `firebase-ci-token` in Cloud Build's Secret Manager.
3. Pushes to `main` trigger Cloud Build, which installs all dependencies,
   runs tests, builds the frontend with Vite, deploys Firebase functions using
   the secret token and finally updates the Cloud Run service with
   `gcloud run deploy`.

## 🔧 Cloud Build Setup

This project uses a custom `cloudbuild.yaml` to deploy both Firebase Functions
and Cloud Run services.

### Prerequisites

- Add the following secret to Secret Manager:
  Name: firebase-ci-token
  Value: [your Firebase CI token]
- Grant access to the Cloud Build service account.
- Link your GitHub repo to Google Cloud Build.

### Trigger Configuration

1. Go to **Cloud Build → Triggers**.
2. Click **Create Trigger**.
3. Choose:
   - **Event:** Push to a branch
   - **Branch:** `main`
   - **Configuration:** Cloud Build configuration file
   - **File location:** `/cloudbuild.yaml`
   - **Service Account:** Use custom role with only required permissions
4. Save the trigger.

✅ Your deployments will now be fully managed through this YAML file.

### Build Frontend for Hosting

Before deploying, create a production build of the React app. From the
repository root run:

```bash
npm run build
```

The command outputs static files in `frontend/build/`. Copy them to the repository's
`public/` directory or set `hosting.public` in `firebase.json` to `frontend/build` so
Firebase Hosting serves the build directory. Cloud Build runs `npm --prefix frontend run build`
automatically during CI, but you can run it manually before:

```bash
firebase deploy
```

To push the frontend and Cloud Functions together:

```bash
npm run build && firebase deploy
```

⚠️ Known issue: Transitive vulnerability in protobufjs via google-gax. Not exploitable in current setup. Awaiting upstream patch from firebase-admin maintainers.

### Running `index.js` in Production

When deploying the Node server (for example via App Engine) you must provide
Firebase credentials for `firebase-admin`. Place a `serviceAccount.json` file in
the repository root or set the `GOOGLE_APPLICATION_CREDENTIALS` environment
variable to point at your service account file. The file name is already listed
in `.gitignore` so your credentials won't be committed.

⚠️ Audit: firebase-admin → google-gax → protobufjs includes a known CVE. Not exploitable in current deployment context. Monitor firebase-admin releases.

### Debug Console

Developers can review recent agent activity through `/debug.html` once
deployed. The page authenticates with Firebase Auth and checks an email
allowlist defined by `functions.config().debug.allowlist`. It fetches
log entries from the `getLogs` Cloud Function and presents them in a
filterable, auto-refreshing table grouped by agent.

### AgentHub Console

`/agent-hub.html` offers a registry-driven view of all agents with links
to their docs and actions to re-run them. The registry is stored in
`config/agents.json` and mirrored under `public/config/agents.json` for
hosting.

### Website Analysis Flow

A new `runWebsiteAnalysis` Cloud Function executes the website-analysis
flow ported from the **ai-agent-systems** repository. Trigger it with a
POST request containing the target URL:

```bash
curl -X POST https://<REGION>-<PROJECT>.cloudfunctions.net/runWebsiteAnalysis \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com"}'
```

The response contains the captured flow state and outputs for each step.

### Troubleshooting

If Cloud Functions report `Error: Cannot find module 'firebase-admin'`, install
dependencies explicitly:

```bash
cd functions
npm install firebase-admin
npm --prefix functions install
```

Ensure `firebase-admin` appears in `functions/package.json` under
`dependencies`. Validate the installation with:

```bash
npm --prefix functions run build
timeout 3 npm --prefix functions start || true
```

If the start command complains about missing `firebase-admin`, run these
commands again to ensure the dependency installed correctly.

Both commands should exit without errors.

## \U0001F527 Deployment Troubleshooting

When deployments fail, first confirm `FIREBASE_TOKEN` and `PROJECT_ID` are
defined in your Cloud Build trigger or GitHub workflow. Verify the service
account used has permission to deploy Firebase functions and Cloud Run.

Run a local test build with:

```bash
gcloud builds submit --config cloudbuild.yaml
```

Logs stream to **Cloud Logging** by default. If a `logsBucket` is configured,
logs will also appear in that Cloud Storage bucket.


## Firebase Project Info

- **Project Name:** Super Intelligence  
- **Project ID:** `super-intelligence-7b653`  
- **Project Number:** `170923536461`

---

## 🙌 Contributing

This project is currently in active prototyping. If you're interested in building ethical agent systems, AI for public good, or opportunity pipelines for underserved communities, [get in touch](mailto:your@email.com) or open an issue.

---

## 🧭 Vision

We believe superintelligence should serve everyone—not just those with access or capital. This repo is our commitment to building systems that **lift people into alignment with their highest potential.**

> _"Ethical superintelligence isn't about replacing human ambition—it's about scaling it with justice."_

---

© 2025 Csp-Ai • Licensed under MIT

