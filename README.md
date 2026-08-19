# ChangeOrder Radar

Create a NEW private Lovable project named "ChangeOrder Radar". 
Apply the tworiverops-product-shell workspace skill and workspace knowledge.
This is an independent product project, not part of a multi-product app. Do not import sibling project code. Do not enable Supabase, create replacement database tables, rewrite domain logic, or publish/deploy.
Build the Lovable customer-facing application around a typed ProductApi boundary. Define ProductApi, an HTTP adapter configured by VITE_API_BASE_URL, and an isolated clearly labeled demo adapter so the UI is immediately demoable while the existing backend remains authoritative. No secrets in source; include .env.example and architecture/API integration README.
Include provider-neutral Analytics and Billing interfaces. Instrument account_created, onboarding_completed, core_workflow_started, first_successful_outcome, core_workflow_completed, workflow_failed, repeat_usage, converted_to_paid and subscription_cancelled without sending document contents or financial line items.
Public experience: outcome-led landing page, workflow, integrations with honest Live/Pilot/Planned labels, pricing, FAQ, security/trust, sign-in, and start/request-access CTA.
Authenticated shell: dashboard, primary workflow, history, result detail, settings, account/billing, help and logout. Add admin only for operational jobs/failures if it genuinely helps this product.
Use serious high-trust operational design: light neutral, ink typography, restrained product accent, compact tables, clear evidence/status displays, excellent mobile and accessibility. No AI aesthetic, gradients, cartoon art, giant empty hero or excessive rounded cards.
Include loading, empty, error, permission-denied and success states plus tests for adapters and primary workflow transitions.

Product:
- ChangeOrder Radar — A TwoRiverOps solution.
- Outcome: Find billable scope changes and missing documentation before project closeout.
- Exact user: specialty contractor owner, project executive, project manager or controller.
- Core workflow: create project; upload contract/change orders/daily logs/emails/field notes/invoices; analyze; review evidence-backed findings; classify potential scope changes and documentation gaps; assign/resolve/dismiss; export an action register.
- Existing backend owns PDF/CSV parsing, deterministic heuristics, evidence, finding states, D1/R2, auth and audit events. Never recreate detection logic in React.
- Label file upload/PDF/CSV analysis Live. Other project-management/accounting integrations are Planned unless configured from backend data.
- Demo mode uses clearly labeled synthetic project records and illustrative amounts, never fabricated customer proof.
- Pricing: Request Private Beta CTA and configurable plan copy; do not invent a binding price.
Accent: restrained copper/amber.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/463e3857-b821-4834-90b7-2f2f88ef4338).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
