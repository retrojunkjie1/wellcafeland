# Production agent smoke gate

**Purpose:** verify the 25 registered agent workflows against the deployed `/api/aiSession` endpoint using dedicated synthetic identities. This is a paid, production-write check: each accepted call consumes AI quota and writes operational execution telemetry. Witness additionally reads a consented test relationship and writes a practitioner data-access audit event.

## Guardrails

- The runner has one hard-coded target: `https://wellnesscafe.app/api/aiSession`.
- It requires separate, unexpired client, admin, and verified-practitioner ID tokens plus an App Check token. All three account emails must contain the dedicated `+wc-smoke@` marker; the decoded token UID and email must match the configured values. Witness uses the smoke client account and requires its already-active practitioner assignment and explicitly shared synthetic data.
- It does not create accounts, alter roles, provision relationships, change consent, or seed production data.
- Requests are synthetic and sent one at a time. It stops on authentication/authorization errors, rate limits, and network failures.
- It logs only agent, outcome, HTTP status, elapsed time, and a safe error code. It never prints or saves prompts, model replies, account IDs, or tokens.
- Never use a client or practitioner account that contains real client data. The Witness test client's shared records must be synthetic and the client must have explicitly enabled the scopes the test is intended to verify.

## One-time local setup

Create a workspace-root `.env.production.smoke` file (already covered by `.env.*` ignore rules) with these values. Do not paste tokens into chat or commit the file:

```dotenv
WELLNESSCAFE_SMOKE_CLIENT_ID_TOKEN=
WELLNESSCAFE_SMOKE_CLIENT_UID=
WELLNESSCAFE_SMOKE_CLIENT_EMAIL=client+wc-smoke@example.com
WELLNESSCAFE_SMOKE_ADMIN_ID_TOKEN=
WELLNESSCAFE_SMOKE_ADMIN_UID=
WELLNESSCAFE_SMOKE_ADMIN_EMAIL=admin+wc-smoke@example.com
WELLNESSCAFE_SMOKE_PRACTITIONER_ID_TOKEN=
WELLNESSCAFE_SMOKE_PRACTITIONER_UID=
WELLNESSCAFE_SMOKE_PRACTITIONER_EMAIL=practitioner+wc-smoke@example.com
WELLNESSCAFE_SMOKE_APPCHECK_TOKEN=
```

Provision three dedicated accounts with the `+wc-smoke@` email marker and the Witness test relationship through the approved Firebase admin workflow. The admin identity needs `platform.operations.view`; the practitioner must be verified and have `provider.connections.read` and `client.shared_overview.read`; the smoke client must have an active assignment and explicit share scopes. Provision at least two synthetic check-ins so Witness can verify a non-empty shared timeline. Do not use this runner to create or change those records.

Obtain fresh ID tokens and a valid App Check token through the production app while signed in to each dedicated smoke account. Treat each token like a password and store it only in the local ignored file. Tokens expire; refresh them before a run. The runner decodes ID-token claims locally only to confirm expiration and UID/email correspondence.

## Run

```sh
npm run smoke:agents:production -- --confirm-live-smoke
```

The confirmation flag authorizes 25 model/service calls, quota consumption, and operational telemetry writes. A full pass is 25/25 with Witness returning `available: true`. A partial pass, `available: false`, or an auth/rate-limit error is not production DoD. Record the date, deployed Hosting/Functions revision, pass count, and safe error codes in the release record; never attach raw model output.

## Limits of the gate

This smoke gate proves the sampled production request path and response contracts for the tested revision and identities. It does not prove clinical efficacy, continuous monitoring, HIPAA/42 CFR Part 2 compliance, or long-term reliability. Sentinel is deterministic and does not incur a model call; Witness is deterministic and does not incur a model call, but both still exercise production authorization and telemetry paths.
