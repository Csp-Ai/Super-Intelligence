# 🧠 Super-Intelligence

[![Firebase CI/CD](https://github.com/yourusername/Super-Intelligence/actions/workflows/firebase.yml/badge.svg)](https://github.com/yourusername/Super-Intelligence/actions/workflows/firebase.yml)

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

1. Install root dependencies:
   ```bash
   npm install
   ```
2. Install Cloud Functions dependencies:
   ```bash
   npm install --prefix functions
   ```
3. Install frontend dependencies:
   ```bash
   npm install --prefix frontend
   ```
4. Run tests from the repo root (requires functions dependencies):
   ```bash
   npm test --silent
   ```
5. If the Firebase emulator reports authentication errors, re-authenticate using:
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
2. Store it as `FIREBASE_TOKEN` in GitHub Actions secrets or as
   `firebase-ci-token` in Cloud Build's Secret Manager.
3. The CI workflow injects this token so `firebase deploy` runs without
   interactive login. If the token expires, re-run the command above.

### Build Frontend for Hosting

Before deploying, create a production build of the React app:

```bash
npm run build --prefix frontend
```

The command outputs static files in `frontend/build/`. Copy them to the repository's
`public/` directory or set `hosting.public` in `firebase.json` to `frontend/build` so
Firebase Hosting serves the build directory. Ensure these files are available before
running:

```bash
firebase deploy
```

To push the frontend and Cloud Functions together:

```bash
npm run build --prefix frontend && firebase deploy
```

### Running `index.js` in Production

When deploying the Node server (for example via App Engine) you must provide
Firebase credentials for `firebase-admin`. Place a `serviceAccount.json` file in
the repository root or set the `GOOGLE_APPLICATION_CREDENTIALS` environment
variable to point at your service account file. The file name is already listed
in `.gitignore` so your credentials won't be committed.

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

