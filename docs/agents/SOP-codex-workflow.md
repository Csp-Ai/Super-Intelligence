# SOP: Codex Workflow

Codex runs automated checks before deployment.

1. Install dependencies via `npm install` and `npm --prefix functions install`.
2. Execute `npm test --silent`.
3. Use descriptive commit messages (`feat:`, `fix:`). Codex summarises changes in PRs.
