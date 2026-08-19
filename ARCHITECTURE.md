# ChangeOrder Radar — architecture and API integration

A TwoRiverOps product. This repository contains the customer-facing application
only. The preserved ChangeOrder Radar backend remains authoritative for PDF/CSV
parsing, deterministic detection heuristics, evidence capture, finding state,
D1/R2 storage, authentication and audit events. None of that logic is
reimplemented in React.

## Runtime modes

Mode resolution lives in `src/lib/product-api/mode.ts` and is deliberately
explicit and fail-closed.

| Mode | Selected when | Behaviour |
| --- | --- | --- |
| `demo` | nothing configured (default) | Clearly labelled synthetic records, no network calls |
| `secure-link` | `VITE_SECURE_WORKSPACE_URL` set | Every real project / sign-in / upload / analyze CTA links out to the preserved secure workspace. No data held here. |
| `api` | `VITE_API_BASE_URL` **and** `VITE_API_CONTRACT_VERSION=v1` both set | v1 gateway adapter |

Partial or mismatched API configuration never enables `api` mode; it falls back
to `secure-link` when a workspace URL exists, otherwise to `demo`, and reports
the reason in `RuntimeConfig.reason`.

`safeExternalUrl` accepts only absolute `https:` URLs (plus `http://localhost`
for development), rejects embedded credentials, `javascript:`, `data:` and
protocol-relative values. `secureWorkspacePath` cannot escape the configured
origin.

## Preserved backend routes (authoritative today)

The preserved workspace exposes:

```
GET    /api/changeorder/projects
POST   /api/changeorder/projects
GET    /api/changeorder/projects/:id
DELETE /api/changeorder/projects/:id
POST   /api/changeorder/projects/:id/files   (multipart)
PATCH  /api/changeorder/findings/:id
```

Important behaviour: **analysis is triggered by upload.** Posting files to
`/api/changeorder/projects/:id/files` runs the deterministic detection pass;
there is no separate "start analysis" endpoint. The workspace also owns its own
secure sign-in. This application is **not** directly integrated with those
routes — it links to the workspace instead, and makes no integration claim.

## Future gateway contract (`api` mode only)

`src/lib/product-api/http-adapter.ts` targets a `/v1/...` gateway that is not
yet deployed. It is retained only as the forward contract and is unreachable
unless both env vars above are set. The gateway must be same-origin with the
app (or CORS-credential capable) so the backend-issued session cookie is sent
with `credentials: "include"`; no API keys are ever placed in the browser.

## Boundary

All backend access goes through one typed interface:

- `src/lib/product-api/types.ts` — `ProductApi`, `ProductApiCapabilities` and domain types.
- `src/lib/product-api/http-adapter.ts` — future v1 gateway adapter.
- `src/lib/product-api/secure-link-adapter.ts` — hand-off adapter: no data, all capabilities false.
- `src/lib/product-api/demo-adapter.ts` — DEMO ONLY, synthetic and labelled. Never customer proof.
- `src/lib/product-api/index.ts` — mode-driven adapter selection.

### Capabilities

`ProductApiCapabilities` (`liveData`, `signIn`, `createProject`,
`uploadDocuments`, `startAnalysis`, `updateFindings`, `exportActionRegister`,
`writeSettings`, `operations`) drives the UI: an action the active adapter
cannot honour is hidden or disabled rather than failing at click time.

Errors are normalised to `ProductApiError` with codes `unauthorized`,
`forbidden`, `not_found`, `invalid`, `server`, `network`.

## Workflow rules in the UI

`src/lib/workflow/finding-transitions.ts` holds *affordance* rules only. The
backend owns the authoritative state machine and rejects invalid transitions
regardless.

## Analytics

`src/lib/analytics/index.ts` is provider-neutral. Events: `account_created`,
`onboarding_completed`, `core_workflow_started`, `first_successful_outcome`,
`core_workflow_completed`, `workflow_failed`, `repeat_usage`,
`converted_to_paid`, `subscription_cancelled`. `scrubProperties` strips document
contents, excerpts, filenames, notes, amounts and long free text.

## Billing

`src/lib/billing/index.ts` is a provider-neutral model. No Stripe/Paddle SDK is
imported by workflow code, and no binding price is asserted during private beta.

## Integrations

File upload with PDF/CSV analysis is **Live** in the preserved workspace.
Project-management and accounting integrations are **Planned**.

## Tests

`bunx vitest run` — mode selection, fail-closed partial config, safe external
URL handling, capability gating, demo isolation, "no /v1 calls outside api
mode", adapter selection, HTTP error mapping, demo workflow (create → upload →
analyze → review → export), finding transitions and analytics privacy.
