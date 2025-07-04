# CI/CD Workflows

This repository uses several GitHub Actions workflows stored in `.github/workflows`.
Each workflow automates part of the deploy or validation process.

## Firebase Preview (`preview.yml`)

**Trigger:** `pull_request`

**Steps**
1. Checkout the repository and set up Node `18`.
2. Install root and frontend dependencies.
3. Install the Firebase CLI with `npm install -g firebase-tools`.
4. Run tests and build the project.
5. Deploy to a preview Hosting channel with `firebase hosting:channel:deploy preview`.

-**Environment Variables**
- `FIREBASE_TOKEN` &mdash; Firebase deploy token retrieved from repository secrets. Generate it with `firebase login:ci` and store the value under **Settings > Secrets and variables > Actions**. If the secret isn't defined, workflows read `FIREBASE_TOKEN` from a local `.env` file and warn if absent. Functions deploy is skipped when the token is missing.

- `NODE_VERSION` &mdash; set to `18.x`.

## Firebase CI/CD (`firebase.yml`)

**Trigger:** push to `main` branch.

**Jobs**
- `binary-check` ensures no binary files are committed.
- `deploy` installs dependencies, validates agent metadata, runs lint and tests, verifies Hosting targets, installs the Firebase CLI, and deploys functions, hosting and Firestore.

**Environment Variables**
- `FIREBASE_TOKEN` &mdash; deploy token from repository secrets. Optional; functions deploy is skipped if the token is not provided. If unset, the CI job looks for `FIREBASE_TOKEN` in `.env`.

- `FIREBASE_PROJECT_ID` &mdash; Firebase project ID secret used during deploy.

## Firebase Config Validation (`firebase-validate.yml`)

**Trigger:** push or pull request targeting `main`.

**Jobs**
- `tests` runs `setup.sh` and executes `npm test`.
- `firebase-validate` sets up Node and checks Firebase configuration using `checkFirebaseTargets.js`.

## Update AGENTS Directory (`agents-md.yml`)

**Trigger:** push to `main` when `config/agents.json`, `scripts/generateAgentsMd.js`, or the workflow itself changes.

**Steps**
1. Checkout code and set up Node.
2. Run `scripts/generateAgentsMd.js` to regenerate `AGENTS.md`.
3. Commit and push the updated file if it changed.

## Sync Agent Registry (`registry-sync.yml`)

**Trigger:** push when `functions/agents/**` or `config/agents.json` are modified.

**Steps**
1. Checkout repository and set up Node.
2. Execute `updateAgentRegistry.js` to sync registries.
3. Commit updates to `config/agents.json` and `public/config/agents.json` if they changed.

**Environment Variables**
- None

The repository does not currently include separate `deploy-prod.yml` or `test-agents.yml` workflows; production deployment and agent tests are handled within the existing workflows above.

## Cloud Build (`cloudbuild.yaml`)

Google Cloud Build triggers on pushes to `main` and orchestrates the entire deployment. It installs all backend, functions and frontend dependencies with `npm install`, then runs tests. The React app is compiled using `npm --prefix frontend run build` so the Vite build succeeds. After building, Cloud Build deploys Firebase functions using the optional `firebase-ci-token` secret exposed as `_FIREBASE_TOKEN` and finally updates the Cloud Run service via `gcloud run deploy`.
If the token isn't configured, the functions deploy step is skipped.

To create the secret, run:

```bash
firebase login:ci
gcloud secrets create firebase-ci-token --replication-policy=automatic
printf '%s' "$FIREBASE_TOKEN" | \
  gcloud secrets versions add firebase-ci-token --data-file=-
gcloud secrets add-iam-policy-binding firebase-ci-token \
  --member="serviceAccount:$PROJECT_ID@cloudbuild.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```
