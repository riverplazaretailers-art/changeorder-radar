# ChangeOrder Radar — architecture and API integration

A TwoRiverOps product. This repository contains the customer-facing application
only. The existing ChangeOrder Radar backend remains authoritative for PDF/CSV
parsing, deterministic detection heuristics, evidence capture, finding state,
D1/R2 storage, authentication and audit events. None of that logic is
reimplemented in React.

## Boundary

All backend access goes through one typed interface:

- `src/lib/product-api/types.ts` — the `ProductApi` interface and domain types.
- `src/lib/product-api/http-adapter.ts` — production adapter. Configured solely
  by `VITE_API_BASE_URL`; sends the backend-issued session cookie
  (`credentials: "include"`). No keys in source.
- `src/lib/product-api/demo-adapter.ts` — DEMO ONLY. Clearly labelled synthetic
  projects and illustrative amounts. Never customer proof.
- `src/lib/product-api/index.ts` — adapter selection. `VITE_API_BASE_URL` set →
  HTTP adapter; unset → demo adapter, with a persistent demo banner in the UI.

Errors are normalised to `ProductApiError` with codes `unauthorized`,
`forbidden`, `not_found`, `invalid`, `server`, `network` so the UI can render
permission-denied and network states honestly.

### Endpoints expected by the HTTP adapter

`GET /v1/me`, `POST /v1/auth/session`, `DELETE /v1/auth/session`,
`GET|POST /v1/projects`, `GET /v1/projects/:id`,
`GET|POST /v1/projects/:id/documents`, `POST /v1/projects/:id/analysis`,
`GET /v1/projects/:id/analysis`, `GET /v1/projects/:id/findings`,
`GET|PATCH /v1/findings/:id`, `GET /v1/projects/:id/audit`,
`GET /v1/projects/:id/action-register`, `GET /v1/integrations`,
`GET|PUT /v1/settings`, `GET /v1/ops/runs`.

## Workflow rules in the UI

`src/lib/workflow/finding-transitions.ts` holds *affordance* rules only —
which actions to enable and what input to require first. The backend owns the
authoritative state machine and rejects invalid transitions regardless.

## Analytics

`src/lib/analytics/index.ts` is provider-neutral (`AnalyticsProvider`). Events:
`account_created`, `onboarding_completed`, `core_workflow_started`,
`first_successful_outcome`, `core_workflow_completed`, `workflow_failed`,
`repeat_usage`, `converted_to_paid`, `subscription_cancelled`.
`scrubProperties` strips document contents, excerpts, filenames, notes,
amounts and long free text before anything is sent.

## Billing

`src/lib/billing/index.ts` is a provider-neutral model (plan, account, MRR,
usage window, trial and payment state). No Stripe/Paddle SDK is imported by
workflow code. Pricing copy is configurable; no binding price is asserted
during private beta.

## Integrations

File upload with PDF/CSV analysis is **Live**. Project-management and
accounting integrations are **Planned** unless the backend reports otherwise
via `GET /v1/integrations`.

## Tests

`bunx vitest run` — adapter selection, HTTP error mapping, demo workflow
(create → upload → analyze → review → export), finding state transitions and
analytics privacy.
