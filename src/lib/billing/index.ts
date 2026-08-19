/**
 * Provider-neutral billing model. No Stripe/Paddle/vendor SDK may be imported
 * by workflow code — swap the provider implementation instead.
 */

export type PlanId = "pilot" | "team" | "enterprise";
export type TrialState = "none" | "active" | "expired";
export type PaymentState = "not_required" | "current" | "past_due" | "cancelled";

export interface Plan {
  id: PlanId;
  name: string;
  /** Configurable copy. No binding price is asserted during private beta. */
  priceCopy: string;
  cadenceCopy: string;
  summary: string;
  features: string[];
  ctaLabel: string;
  highlighted?: boolean;
}

export interface UsageWindow {
  periodStart: string;
  periodEnd: string;
  projectsAnalyzed: number;
  documentsParsed: number;
  includedProjects: number | null;
}

export interface BillingAccount {
  accountId: string;
  product: "changeorder-radar";
  planId: PlanId;
  planName: string;
  mrrCents: number | null;
  currency: string;
  trialState: TrialState;
  trialEndsAt: string | null;
  paymentState: PaymentState;
  usage: UsageWindow;
}

export interface BillingProvider {
  readonly id: string;
  listPlans(): Promise<Plan[]>;
  getAccount(): Promise<BillingAccount>;
  requestPlanChange(planId: PlanId): Promise<BillingAccount>;
  cancelSubscription(reason: string): Promise<BillingAccount>;
}

export const PLANS: Plan[] = [
  {
    id: "pilot",
    name: "Pilot",
    priceCopy: "Scoped per pilot",
    cadenceCopy: "One project, fixed window",
    summary:
      "Run ChangeOrder Radar against one closing project to see what the record actually supports.",
    features: [
      "One project, unlimited documents",
      "Evidence-backed findings register",
      "Action register export (CSV)",
      "Guided review session",
    ],
    ctaLabel: "Request private beta",
  },
  {
    id: "team",
    name: "Team",
    priceCopy: "Pricing set at private beta close",
    cadenceCopy: "Per active project, billed monthly",
    summary: "For contractors running several projects to closeout at once.",
    features: [
      "Unlimited projects and documents",
      "Assignment, resolution and dismissal workflow",
      "Full audit trail and evidence lineage",
      "Role-based access for PM, PX and controller",
    ],
    ctaLabel: "Request private beta",
    highlighted: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    priceCopy: "Negotiated",
    cadenceCopy: "Annual agreement",
    summary: "Multi-division rollouts with procurement, security review and data retention terms.",
    features: [
      "SSO and provisioning review",
      "Retention and residency terms",
      "Named implementation contact",
      "Integration roadmap input",
    ],
    ctaLabel: "Talk to us",
  },
];

/** DEMO BILLING PROVIDER — synthetic account state, no payment processor. */
export class DemoBillingProvider implements BillingProvider {
  readonly id = "demo";
  private account: BillingAccount = {
    accountId: "acct_demo",
    product: "changeorder-radar",
    planId: "pilot",
    planName: "Pilot",
    mrrCents: null,
    currency: "USD",
    trialState: "active",
    trialEndsAt: "2026-09-15T00:00:00.000Z",
    paymentState: "not_required",
    usage: {
      periodStart: "2026-08-01T00:00:00.000Z",
      periodEnd: "2026-08-31T23:59:59.000Z",
      projectsAnalyzed: 2,
      documentsParsed: 10,
      includedProjects: 3,
    },
  };

  async listPlans() {
    return PLANS.map((p) => ({ ...p }));
  }
  async getAccount() {
    return { ...this.account, usage: { ...this.account.usage } };
  }
  async requestPlanChange(planId: PlanId) {
    const plan = PLANS.find((p) => p.id === planId);
    this.account = { ...this.account, planId, planName: plan?.name ?? planId };
    return this.getAccount();
  }
  async cancelSubscription(_reason: string) {
    this.account = { ...this.account, paymentState: "cancelled", trialState: "expired" };
    return this.getAccount();
  }
}

export const billing: BillingProvider = new DemoBillingProvider();

export function formatMoney(cents: number | null, currency = "USD"): string {
  if (cents == null) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}
