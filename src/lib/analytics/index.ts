/**
 * Provider-neutral analytics.
 *
 * Privacy rule enforced here: never send document contents, evidence
 * excerpts, financial line items, filenames, emails or tokens. Only
 * identifiers, counts and coarse outcome descriptors are permitted.
 */

export type AnalyticsEventName =
  | "account_created"
  | "onboarding_completed"
  | "core_workflow_started"
  | "first_successful_outcome"
  | "core_workflow_completed"
  | "workflow_failed"
  | "repeat_usage"
  | "converted_to_paid"
  | "subscription_cancelled";

export interface AnalyticsContext {
  product: "changeorder-radar";
  accountId?: string;
  userId?: string;
  workflowId?: string;
  outcomeId?: string;
}

export type AnalyticsProperties = Record<string, string | number | boolean | null | undefined>;

export interface AnalyticsEvent {
  name: AnalyticsEventName;
  context: AnalyticsContext;
  properties: AnalyticsProperties;
  at: string;
}

export interface AnalyticsProvider {
  readonly id: string;
  send(event: AnalyticsEvent): void;
}

/** Keys that must never leave the app, whatever a caller passes. */
const BLOCKED_KEYS = [
  "content",
  "excerpt",
  "text",
  "body",
  "filename",
  "file",
  "email",
  "name",
  "amount",
  "amountcents",
  "total",
  "price",
  "lineitem",
  "line_items",
  "token",
  "rationale",
  "note",
  "client",
];

export function scrubProperties(properties: AnalyticsProperties): AnalyticsProperties {
  const safe: AnalyticsProperties = {};
  for (const [key, value] of Object.entries(properties)) {
    const normalized = key.toLowerCase().replace(/[^a-z_]/g, "");
    if (BLOCKED_KEYS.some((blocked) => normalized.includes(blocked.replace(/[^a-z_]/g, "")))) {
      continue;
    }
    if (typeof value === "string" && value.length > 64) continue;
    safe[key] = value;
  }
  return safe;
}

export class ConsoleAnalyticsProvider implements AnalyticsProvider {
  readonly id = "console";
  send(event: AnalyticsEvent) {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.info("[analytics]", event.name, event.properties);
    }
  }
}

export class MemoryAnalyticsProvider implements AnalyticsProvider {
  readonly id = "memory";
  readonly events: AnalyticsEvent[] = [];
  send(event: AnalyticsEvent) {
    this.events.push(event);
  }
}

export class Analytics {
  private context: AnalyticsContext = { product: "changeorder-radar" };
  private seenOutcome = false;
  private workflowCompletions = 0;

  constructor(private readonly provider: AnalyticsProvider) {}

  identify(partial: Omit<AnalyticsContext, "product">) {
    this.context = { ...this.context, ...partial };
  }

  reset() {
    this.context = { product: "changeorder-radar" };
  }

  track(name: AnalyticsEventName, properties: AnalyticsProperties = {}) {
    this.provider.send({
      name,
      context: { ...this.context },
      properties: scrubProperties(properties),
      at: new Date().toISOString(),
    });
  }

  /** Emits first_successful_outcome once, then core_workflow_completed / repeat_usage. */
  trackWorkflowCompleted(properties: AnalyticsProperties = {}) {
    if (!this.seenOutcome) {
      this.seenOutcome = true;
      this.track("first_successful_outcome", properties);
    }
    this.workflowCompletions += 1;
    this.track("core_workflow_completed", properties);
    if (this.workflowCompletions > 1) {
      this.track("repeat_usage", { completions: this.workflowCompletions });
    }
  }
}

export const analytics = new Analytics(new ConsoleAnalyticsProvider());
