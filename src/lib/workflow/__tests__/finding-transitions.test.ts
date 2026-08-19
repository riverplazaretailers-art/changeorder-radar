import { describe, expect, it } from "vitest";
import {
  canActOnFindings,
  canTransition,
  checkTransition,
  phaseFor,
  requirementsFor,
} from "../finding-transitions";

describe("finding transitions", () => {
  it("allows triage from open", () => {
    expect(canTransition("open", "assigned")).toBe(true);
    expect(canTransition("open", "resolved")).toBe(true);
    expect(canTransition("open", "dismissed")).toBe(true);
  });

  it("only allows reopening from a closed state", () => {
    expect(canTransition("resolved", "open")).toBe(true);
    expect(canTransition("resolved", "dismissed")).toBe(false);
    expect(canTransition("dismissed", "assigned")).toBe(false);
  });

  it("restricts state changes to owners and managers", () => {
    expect(canActOnFindings("owner")).toBe(true);
    expect(canActOnFindings("manager")).toBe(true);
    expect(canActOnFindings("viewer")).toBe(false);
    expect(canActOnFindings(undefined)).toBe(false);
  });

  it("requires an assignee to assign and a note to close", () => {
    expect(requirementsFor("assigned")).toEqual({ assignee: true, note: false });
    expect(requirementsFor("resolved")).toEqual({ assignee: false, note: true });
    expect(requirementsFor("dismissed")).toEqual({ assignee: false, note: true });
    expect(requirementsFor("open")).toEqual({ assignee: false, note: false });
  });
});

describe("checkTransition", () => {
  it("rejects viewers", () => {
    expect(checkTransition({ from: "open", to: "resolved", role: "viewer", note: "x" })).toEqual({
      ok: false,
      reason: "forbidden",
    });
  });

  it("rejects a no-op change", () => {
    expect(checkTransition({ from: "open", to: "open", role: "owner" })).toEqual({
      ok: false,
      reason: "invalid_transition",
    });
  });

  it("rejects an illegal transition", () => {
    expect(checkTransition({ from: "dismissed", to: "resolved", role: "owner", note: "x" })).toEqual(
      { ok: false, reason: "invalid_transition" },
    );
  });

  it("requires an assignee", () => {
    expect(checkTransition({ from: "open", to: "assigned", role: "manager", assignee: "  " })).toEqual(
      { ok: false, reason: "assignee_required" },
    );
  });

  it("requires a note", () => {
    expect(checkTransition({ from: "open", to: "dismissed", role: "manager", note: "" })).toEqual({
      ok: false,
      reason: "note_required",
    });
  });

  it("accepts a valid resolution", () => {
    expect(
      checkTransition({ from: "assigned", to: "resolved", role: "owner", note: "CO issued" }),
    ).toEqual({ ok: true });
  });
});

describe("phaseFor", () => {
  it("advances through the project workflow", () => {
    expect(phaseFor({ documentCount: 0, status: "draft", exported: false })).toBe("created");
    expect(phaseFor({ documentCount: 3, status: "draft", exported: false })).toBe("documents");
    expect(phaseFor({ documentCount: 3, status: "analyzing", exported: false })).toBe("analyzing");
    expect(phaseFor({ documentCount: 3, status: "analyzed", exported: false })).toBe("review");
    expect(phaseFor({ documentCount: 3, status: "analyzed", exported: true })).toBe("exported");
  });
});
