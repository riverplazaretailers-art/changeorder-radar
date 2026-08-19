import { describe, expect, it } from "vitest";
import { Analytics, MemoryAnalyticsProvider, scrubProperties } from "../index";

describe("scrubProperties", () => {
  it("drops document contents and financial values", () => {
    const safe = scrubProperties({
      amount_cents: 100,
      excerpt: "the contract says",
      filename: "co-14.pdf",
      note: "resolved",
      step: "document_uploaded",
      count: 3,
    });
    expect(safe).toEqual({ step: "document_uploaded", count: 3 });
  });

  it("drops long free-text values", () => {
    const safe = scrubProperties({ label: "x".repeat(100) });
    expect(safe).toEqual({});
  });
});

describe("Analytics", () => {
  it("emits first_successful_outcome once and repeat_usage afterwards", () => {
    const provider = new MemoryAnalyticsProvider();
    const analytics = new Analytics(provider);
    analytics.trackWorkflowCompleted();
    analytics.trackWorkflowCompleted();
    const names = provider.events.map((e) => e.name);
    expect(names.filter((n) => n === "first_successful_outcome")).toHaveLength(1);
    expect(names.filter((n) => n === "core_workflow_completed")).toHaveLength(2);
    expect(names).toContain("repeat_usage");
  });

  it("attaches identity context without leaking payload data", () => {
    const provider = new MemoryAnalyticsProvider();
    const analytics = new Analytics(provider);
    analytics.identify({ userId: "u1", accountId: "a1" });
    analytics.track("account_created", { excerpt: "secret" });
    expect(provider.events[0]!.context).toMatchObject({ userId: "u1", accountId: "a1" });
    expect(provider.events[0]!.properties).toEqual({});
  });
});
