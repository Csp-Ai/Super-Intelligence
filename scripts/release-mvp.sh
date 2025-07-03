#!/bin/bash
# release-mvp.sh - Commit changes, tag, push, and create GitHub release for Super-Intelligence MVP
set -e

# Checkout main branch
git checkout main

# Commit any pending changes
if [[ -n $(git status --porcelain) ]]; then
  git add -A
  git commit -m "MVP complete: dashboard panels, agent sync, CI/CD, toggles, and timeline"
fi

# Tag the release
git tag -a -f v1.0-mvp -m "MVP release: fully integrated AI agent dashboard with modular UI, Firestore sync, and Codex-powered governance"

# Push branch and tag
git push origin main
git push origin v1.0-mvp

# Create GitHub release with notes
notes=$(cat <<'NOTES'
- Agent opt-in/out system
- Agent knowledge sharing with CanvasNetwork visualization
- Unified global activity timeline
- Resume/Roadmap/OpportunityCard components
- Trends, Analytics, and Insights panels
- Lifecycle timeline and agent state tracking
- CI test coverage, schema validation, and automated docs
NOTES
)

gh release create v1.0-mvp --title "Super-Intelligence MVP" --notes "$notes"

