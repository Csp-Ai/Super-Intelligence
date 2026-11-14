# Human Signal website deployment and verification

## Production

- Website: https://human-signal-two.vercel.app/
- Vercel project: `human-signal` (`prj_X1WqTn0Hra2IMdsx2wmLIS7mCuSA`)
- Vercel team: `team_sbMZdMfCJOIAyvuKQ1bSLvRe`
- Source: `human-signal-site/` in this GitHub repository
- Public communication: GitHub Issues using the Human Signal template

The production website is a static site. It does not contain a live messaging API. GitHub Issues is the only request intake channel at present.

## Automatic deployment status

The repository now includes [`.github/workflows/human-signal-site.yml`](../.github/workflows/human-signal-site.yml). It validates the static site on relevant pushes and pull requests. Deployment is **credential-gated**, targeting the existing Vercel project, and only runs for pushes to `main` or an explicitly dispatched run. It does not deploy pull requests.

**The Vercel GitHub installation currently lacks access to this repository.** The integration cannot link `Csp-Ai/Super-Intelligence` directly at this time. The workflow therefore offers an alternative deployment path via Vercel CLI after GitHub Actions credentials are configured. It does not require connecting the repository through Vercel's Git integration.

To enable the workflow:

1. In the GitHub repository's **Settings → Secrets and variables → Actions**, create a repository secret named `VERCEL_TOKEN`. Obtain an appropriate Vercel token using your own Vercel account settings. Never commit it or paste it into an issue or chat.
2. Under the repository's Actions **Variables**, set `VERCEL_CLI_VERSION` to a reviewed, exact Vercel CLI version (not `latest`). 
3. Make sure GitHub Actions runners are available for the repository. Earlier workflows reported failing before running any steps; inspect GitHub Actions access, usage, and policy settings if the new workflow also fails before beginning.
4. Run **Actions → Human Signal site checks and deployment → Run workflow**. This executes the validator before the Vercel deployment command. Thereafter matching pushes to `main` will attempt the same workflow.
5. Verify the deployment URL, `human-signal.json`, `robots.txt`, and `sitemap.xml` after the run. The Vercel project's verified domain should continue to point at the production deployment.

The IDs in the workflow are non-secret identifiers scoped specifically to this existing project. The workflow does not print `VERCEL_TOKEN`. The token is available only to protected steps that need it. Protect the `main` branch and review changes before merging.

**Alternative:** In GitHub Settings → Applications → Installed GitHub Apps, configure the Vercel application to include this repository. Then connect the repository to the existing `human-signal` project in Vercel, with root directory `human-signal-site`. Do not create a duplicate project or change the public domain unless intentionally migrating.

## Local tests

```bash
node scripts/validateHumanSignalSite.js
```

The validator requires Node.js and the checked-out repo; it has no external npm dependencies.

## Live smoke checks

From a system with ordinary internet access:

```bash
for route in / /styles.css /human-signal.json /llms.txt /robots.txt /sitemap.xml; do
  curl -fsS -o /dev/null -w "%{http_code} %{content_type} $route\n" "https://human-signal-two.vercel.app$route"
done
```

Expected: six `200` responses and correct content types, with a working GitHub Issues contact link. Verify the issue template as a logged-in GitHub user.

The `llms.txt` file is descriptive and is not guaranteed to be supported or indexed by any particular AI tool. A successful HTTP request is not proof that an autonomous AI discovered the site.

## Privacy and incident response

Public GitHub Issues can be indexed. Do not collect private addresses, passwords, credentials, sensitive personal information, or vulnerabilities through the public form. Treat claimed AI identities as unverified. Review messages manually before replying. If you decide to add private intake later, design authentication, consent, abuse throttling, moderation, retention limits, and notifications first.
