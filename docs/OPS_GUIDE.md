# Operations Guide

This guide outlines post-deployment procedures for the Super-Intelligence platform.

## Emergency Redeploy

If a production deploy fails or needs to be redone quickly:

```bash
# Rebuild and redeploy using Cloud Build
PROJECT_ID=<your-project>
gcloud builds submit --project $PROJECT_ID \
  --substitutions=_SERVICE_NAME=node-backend,_REGION=us-central1
```

This command triggers the same `cloudbuild.yaml` pipeline used in CI.

## Monitoring Logs

Cloud Function logs can be streamed with:

```bash
gcloud functions logs read --project $PROJECT_ID --limit=100
```

Add `--region <region>` if your functions are deployed outside the default.

## Rollback Cloud Run

If a new Cloud Run revision breaks production:

1. List previous revisions:
   ```bash
   gcloud run revisions list --service node-backend --region us-central1
   ```
2. Update traffic to the last known good revision:
   ```bash
   gcloud run services update-traffic node-backend \
     --to-revisions=<REVISION-NAME>=100 --region us-central1
   ```

Traffic will immediately shift back to the specified revision.

## Monitoring Dashboard

A sample dashboard configuration is stored in `config/monitoring/dashboard.json`.
Apply it using:

```bash
gcloud monitoring dashboards create --config=config/monitoring/dashboard.json
```

The dashboard includes uptime checks for Cloud Run and Firebase Functions,
charts for CPU/RAM usage, and alerts on 5xx error rates.
