# 🧠 Super-Intelligence Repository Guide

Welcome to the **Super-Intelligence** project — a platform for open-source, ethical AI agents with cosmic-inspired UX. This document helps you or any contributor quickly navigate the codebase and understand what's going on.

---

## 🔍 Project Overview

Super-Intelligence is composed of modular agents connected via neural-style UI, backed by Firebase. Key technologies include React, Tailwind CSS, Lucide icons, Firestore, and GitHub Actions CI/CD.

---

## 🗂️ Directory Structure

### Root Level

| Path           | Purpose                                                                  |
| -------------- | ------------------------------------------------------------------------ |
| `.github/`     | Contains CI/CD workflows (e.g., `firebase.yml`, GitHub Actions)          |
| `config/`      | Configuration files shared across components (constants, settings, etc.) |
| `devtools/`    | Local developer tools and utilities                                      |
| `docs/`        | Internal and external documentation                                      |
| `flows/`       | Agent workflows and logic pipelines (e.g., roadmap → resume → jobs)      |
| `frontend/`    | React application and UI components                                      |
| `functions/`   | Firebase backend (Cloud Functions, Firestore triggers, etc.)             |
| `logs/`        | Debug or output logs — should be gitignored                              |
| `.gitignore`   | Prevents tracking of sensitive or build-related files                    |
| `README.md`    | This file :)                                                             |
| `package.json` | Project metadata, scripts, and dependencies                              |

### `frontend/`

| Path                  | Purpose                                             |
| --------------------- | --------------------------------------------------- |
| `modules/`            | Shared React component libraries (WIP)              |
| `node_modules/`       | Dependency folder (auto-managed)                    |
| `public/`             | Static assets (e.g., `index.html`, images, favicon) |
| `src/`                | Main React application code                         |
| `src/App.js`          | Root component                                      |
| `src/firebase.js`     | Firebase initialization and config                  |
| `src/index.css`       | Tailwind base + global CSS                          |
| `src/reportWebVitals` | Performance measurement (optional)                  |
| `src/setupTests.js`   | Jest testing environment                            |

---

## 🚀 Getting Started

### Local Dev

```bash
# Install dependencies
npm install

# Start frontend
npm run start

# Start Firebase Functions emulator (if needed)
firebase emulators:start
```

### Deploy

```bash
# Run deployment pipeline
npm run deploy
```

### CI/CD Notes

* Deployment and tests are handled via `.github/workflows/firebase.yml`
* Ensure agent metadata is validated by running:

```bash
npm run sync-agents
node scripts/validateAgentMetadata.js
```

---

## 🔁 Key Flows

* `functions/agents/` — Each intelligent agent lives here.
* `functions/core/agentFlowEngine.js` — Shared logic for invoking and chaining agents.
* `functions/triggers/onCreateUser.js` — Example trigger to run a flow when a user is added.
* `flows/` — Future site of full user-agent pipelines (e.g., `flow-career.js`).

---

## 🎨 UI Component: NeuroCosmicInterface

This is the interactive canvas-based visualization of your agent network.
It’s located in `frontend/src/components/NeuroCosmicInterface.js` (or soon to be).

Features:

* Animated canvas agent connections
* Live activity pulsing
* Governance dashboards (Ethics, Confidence, Transparency)
* Cosmic-style UI using Tailwind + gradients + blur + icons

---

## 🧠 Firebase Overview

* Firestore — for logs, user data, metrics
* Functions — for running agents and triggering chains
* Hosting — for static frontend

---

## 📌 To-Dos / WIP

* [ ] Modularize `NeuroCosmicInterface` into subcomponents
* [ ] Remove `.env` + logs from version control
* [ ] Add Firebase target validation in CI
* [ ] Implement real-time Firestore data for agent metrics
* [ ] Add tooltips, onboarding, and interactive guidance to UI

---

## 💬 Questions or Feedback?

DM the founder or open an issue. We love contributors.

---

Build with brains, beauty, and responsibility. ✨
