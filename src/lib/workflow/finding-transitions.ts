/**
 * UI affordance rules only.
 *
 * The backend owns the authoritative finding state machine and rejects any
 * invalid transition. These rules exist so the interface can disable actions
 * the user cannot take and prompt for required input first. They must stay a
 * subset of backend behaviour — never a replacement for it.
 */
import type { FindingState } from "@/lib/product-api";

export type WorkflowRole = "owner" | "manager" | "viewer";

export const ALLOWED_TRANSITIONS: Record<FindingState, FindingState[]> = {
  open: ["assigned", "resolved", "dismissed"],
  assigned: ["resolved", "dismissed", "open"],
  resolved: ["open"],
  dismissed: ["open"],
};

export function canTransition(from: FindingState, to: FindingState): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}

export function canActOnFindings(role: WorkflowRole | undefined): boolean {
  return role === "owner" || role === "manager";
}

export interface TransitionRequirements {
  assignee: boolean;
  note: boolean;
}

export function requirementsFor(to: FindingState): TransitionRequirements {
  return { assignee: to === "assigned", note: to === "resolved" || to === "dismissed" };
}

export type TransitionCheck =
  | { ok: true }
  | { ok: false; reason: "forbidden" | "invalid_transition" | "assignee_required" | "note_required" };

export function checkTransition(input: {
  from: FindingState;
  to: FindingState;
  role: WorkflowRole | undefined;
  assignee?: string | null;
  note?: string | null;
}): TransitionCheck {
  if (!canActOnFindings(input.role)) return { ok: false, reason: "forbidden" };
  if (input.from === input.to) return { ok: false, reason: "invalid_transition" };
  if (!canTransition(input.from, input.to)) return { ok: false, reason: "invalid_transition" };
  const req = requirementsFor(input.to);
  if (req.assignee && !input.assignee?.trim()) return { ok: false, reason: "assignee_required" };
  if (req.note && !input.note?.trim()) return { ok: false, reason: "note_required" };
  return { ok: true };
}

/** Project-level workflow phase, derived for progress display only. */
export type WorkflowPhase = "created" | "documents" | "analyzing" | "review" | "exported";

export function phaseFor(input: {
  documentCount: number;
  status: string;
  exported: boolean;
}): WorkflowPhase {
  if (input.exported) return "exported";
  if (input.status === "analyzing") return "analyzing";
  if (input.status === "analyzed") return "review";
  if (input.documentCount > 0) return "documents";
  return "created";
}
