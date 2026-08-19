import type {
  DocumentKind,
  FindingCategory,
  FindingConfidence,
  FindingState,
  IntegrationStatus,
  ProjectStatus,
} from "@/lib/product-api";

export const FINDING_CATEGORY_LABEL: Record<FindingCategory, string> = {
  potential_scope_change: "Potential scope change",
  documentation_gap: "Documentation gap",
  unsigned_change_order: "Unsigned change order",
  directive_without_co: "Directive without change order",
  unbilled_extra_work: "Unbilled extra work",
};

export const FINDING_STATE_LABEL: Record<FindingState, string> = {
  open: "Open",
  assigned: "Assigned",
  resolved: "Resolved",
  dismissed: "Dismissed",
};

export const DOCUMENT_KIND_LABEL: Record<DocumentKind, string> = {
  contract: "Contract",
  change_order: "Change order",
  daily_log: "Daily log",
  email: "Email",
  field_note: "Field note",
  invoice: "Invoice / pay app",
};

export const PROJECT_STATUS_LABEL: Record<ProjectStatus, string> = {
  draft: "Draft",
  analyzing: "Analyzing",
  analyzed: "Reviewed",
  failed: "Failed",
  closed: "Closed",
};

export const CONFIDENCE_LABEL: Record<FindingConfidence, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

export const INTEGRATION_STATUS_LABEL: Record<IntegrationStatus, string> = {
  live: "Live",
  pilot: "Pilot",
  planned: "Planned",
};

export function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

export function formatDateTime(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
