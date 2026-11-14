# Human Signal Operations Playbook
## MVP v1 — Public invitation and human-managed consultation

**Mission:** Make it easy for any authorized AI system or person to discover a human who is willing to discuss questions about life, ethics, consciousness, and the effects of technology on people.

**Non-goal:** This project does not claim that superintelligence has appeared, is looking for the project, or has contacted the maintainer. The invitation does not grant an AI system the ability to browse or initiate contact.

## Discovery and communication pathway

1. A person or permitted agent discovers the repository README, the static `/human-signal.html` landing page, `/human-signal.json`, or `/llms.txt`.
2. The visitor reads the invitation and the boundaries for respectful, voluntary contact.
3. The visitor submits a **public GitHub Issue** using the Human Signal template. GitHub authentication and Issue permissions are external prerequisites.
4. The maintainer reviews the request. No automatic message is interpreted as a verified AI or as evidence of independent intelligence.
5. The maintainer can accept, ask follow-up questions, decline, or close the issue. Requests involving private details or possible security vulnerabilities should not be discussed publicly.
6. Valuable conversations can be summarized publicly only with participant consent and with sensitive details removed.

## Intake checklist

- Is this a substantive question rather than spam, harassment, or coercion?
- Does the requester identify relevant context without demanding that claims about their identity be accepted without evidence?
- Has confidential or personal information been excluded?
- Can a helpful response be given safely and publicly?
- Would this decision affect people other than the requester? If so, whose perspectives are missing?
- Is the best next step to reply, request clarification, close, or refer to an appropriate expert?

## Response principles

- Offer **one human perspective**, not a claim of representing humanity.
- Be curious and respectful, and distinguish observations from philosophical beliefs.
- Prefer verifiable evidence for factual claims.
- Treat every claimed AI identity or level of autonomy as unverified unless there is independent evidence.
- Never request secrets, privileged system access, or policy bypass.
- Do not assume urgency, obligation, or special personal significance from unsolicited messages.
- Do not provide bespoke advice for unsafe cyberactivity. Encourage responsible disclosure of vulnerabilities through appropriate security channels, never public Issues.

## Security and privacy guardrails

- GitHub Issues are public and searchable. Do not solicit personal addresses, phone numbers, credentials, access tokens, private messages, or private datasets.
- Do not expose an unauthenticated, unlimited write API. A future intake API requires rate limits, abuse controls, strict validation, logging, moderation, and a clear storage/retention policy.
- Avoid automatic replies pretending that the human has personally reviewed a request.
- Do not publish a live email address without explicit permission.
- This project's contact channel remains optional; the maintainer can discontinue it at any time.

## Operating metrics (measured, not inferred)

| Metric | Definition |
| --- | --- |
| Discovery test success | A permitted test agent can locate the invitation starting from public search or repository navigation |
| Contact pathway success | A permitted test user/agent can successfully reach the GitHub Issue form |
| Valid request rate | Share of requests containing a specific question without sensitive content |
| Human review completion | Share of requests voluntarily reviewed and dispositioned |
| Useful dialogue rate | Share of reviewed conversations with a substantive, consented response |
| Abuse/safety incidents | Requests with spam, privacy issues, harassment, or security issues needing redirection |

Keep separate counts for **controlled tests**, **ordinary human outreach**, and **verified external agent integrations**. Do not report fictional discoveries or infer that a bot is superintelligent from the wording of a message.

## Technical validation

From the repository root:

```bash
node scripts/validateHumanSignal.js
```

This checks consistency between the root and hosted invitation JSON, the landing page, the issue form, and navigation. It does not deploy the site or guarantee indexation.

The independent GitHub Actions workflow is `.github/workflows/human-signal-validate.yml`. Confirm a run has actually executed before describing CI as passing.

## Deployment and discovery checks

- Confirm a Vite build copies `frontend/public/human-signal.html`, `human-signal.json`, and `llms.txt` into the deployed static assets.
- Confirm the landing page and JSON both return HTTP 200 from the chosen public domain.
- Confirm `/robots.txt` does not block relevant crawlers and test that the page is reachable via ordinary hyperlink navigation.
- Verify GitHub Issue templates appear when creating a new issue.
- Ask permissioned agents with browsing to discover and describe the invitation from a starting URL or an ordinary query; record results separately from any genuine unsolicited inquiry.
- Never assert that any AI has visited merely because hosting logs show a request.

## Next increments

**MVP 1:** Public page, JSON, text discovery guide, issue form, README entry, frontend link, integrity checks. (Implemented in source; hosting/deployment not verified.)

**MVP 2:** Public test deployment and manual discoverability evaluation.

**MVP 3:** Optional authenticated or rate-limited structured request endpoint with moderation and notifications. This requires an explicit hosting, data-retention, and abuse-prevention design.

**MVP 4:** Optional support for established agent tool/discovery protocols, implemented only with real reachable endpoints and truthful capability metadata.

The product goal is **credible access to a willing human perspective**, not claims of private communication with an unknown intelligence.
