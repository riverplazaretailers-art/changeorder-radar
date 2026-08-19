/**
 * ChangeOrder Radar — typed ProductApi boundary.
 *
 * The existing ChangeOrder Radar backend is authoritative for:
 *   - PDF/CSV parsing
 *   - deterministic detection heuristics
 *   - evidence extraction and lineage
 *   - finding state machine + audit events
 *   - D1 / R2 persistence, auth and permissions
 *
 * This interface is the ONLY way the React application reaches that backend.
 * No detection, classification or reconciliation logic may be reimplemented
 * in presentation code.
 */

export type Iso8601 = string;

export type ProjectStatus = "draft" | "analyzing" | "analyzed" | "failed" | "closed";

export type DocumentKind =
  | "contract"
  | "change_order"
  | "daily_log"
  | "email"
  | "field_note"
  | "invoice";

export type DocumentStatus = "uploaded" | "parsing" | "parsed" | "rejected";

export type FindingCategory =
  | "potential_scope_change"
  | "documentation_gap"
  | "unsigned_change_order"
  | "directive_without_co"
  | "unbilled_extra_work";

export type FindingState = "open" | "assigned" | "resolved" | "dismissed";

export type FindingConfidence = "high" | "medium" | "low";

export interface ProjectSummary {
  id: string;
  name: string;
  client: string;
  contractRef: string;
  status: ProjectStatus;
  createdAt: Iso8601;
  analyzedAt: Iso8601 | null;
  documentCount: number;
  openFindings: number;
  /** Backend-computed exposure. Never derived in the UI. */
  exposureCents: number;
  currency: string;
}

export interface ProjectDocument {
  id: string;
  projectId: string;
  filename: string;
  kind: DocumentKind;
  byteSize: number;
  status: DocumentStatus;
  uploadedAt: Iso8601;
  pageCount: number | null;
  rejectionReason: string | null;
}

export interface EvidenceRef {
  id: string;
  documentId: string;
  documentFilename: string;
  locator: string;
  excerpt: string;
  capturedAt: Iso8601;
}

export interface Finding {
  id: string;
  projectId: string;
  reference: string;
  title: string;
  category: FindingCategory;
  state: FindingState;
  confidence: FindingConfidence;
  /** Backend-estimated value at risk, in minor units. */
  amountCents: number | null;
  currency: string;
  detectedAt: Iso8601;
  rule: string;
  rationale: string;
  assignee: string | null;
  resolutionNote: string | null;
  evidence: EvidenceRef[];
}

export interface AuditEvent {
  id: string;
  at: Iso8601;
  actor: string;
  action: string;
  detail: string;
}

export interface AnalysisRun {
  id: string;
  projectId: string;
  state: "queued" | "running" | "succeeded" | "failed";
  startedAt: Iso8601;
  finishedAt: Iso8601 | null;
  documentsProcessed: number;
  findingsProduced: number;
  failureReason: string | null;
}

export type IntegrationStatus = "live" | "pilot" | "planned";

export interface Integration {
  id: string;
  name: string;
  category: string;
  status: IntegrationStatus;
  description: string;
}

export interface AccountUser {
  id: string;
  name: string;
  email: string;
  role: "owner" | "manager" | "viewer";
  company: string;
}

export interface AccountSettings {
  companyName: string;
  defaultCurrency: string;
  closeoutReminderDays: number;
  notifyOnAnalysisComplete: boolean;
}

export interface CreateProjectInput {
  name: string;
  client: string;
  contractRef: string;
}

export interface UploadDocumentInput {
  projectId: string;
  filename: string;
  kind: DocumentKind;
  byteSize: number;
}

export interface UpdateFindingInput {
  findingId: string;
  state: FindingState;
  assignee?: string | null;
  note?: string | null;
}

export interface ActionRegisterExport {
  filename: string;
  mimeType: string;
  content: string;
}

export class ProductApiError extends Error {
  constructor(
    message: string,
    readonly code: "unauthorized" | "forbidden" | "not_found" | "invalid" | "server" | "network",
    readonly status?: number,
  ) {
    super(message);
    this.name = "ProductApiError";
  }
}

export interface ProductApi {
  readonly mode: "http" | "demo";

  getCurrentUser(): Promise<AccountUser | null>;
  signIn(email: string): Promise<AccountUser>;
  signOut(): Promise<void>;

  listProjects(): Promise<ProjectSummary[]>;
  getProject(projectId: string): Promise<ProjectSummary>;
  createProject(input: CreateProjectInput): Promise<ProjectSummary>;

  listDocuments(projectId: string): Promise<ProjectDocument[]>;
  uploadDocument(input: UploadDocumentInput): Promise<ProjectDocument>;

  startAnalysis(projectId: string): Promise<AnalysisRun>;
  getAnalysisRun(projectId: string): Promise<AnalysisRun | null>;

  listFindings(projectId: string): Promise<Finding[]>;
  getFinding(findingId: string): Promise<Finding>;
  updateFinding(input: UpdateFindingInput): Promise<Finding>;

  listAuditEvents(projectId: string): Promise<AuditEvent[]>;
  exportActionRegister(projectId: string): Promise<ActionRegisterExport>;

  listIntegrations(): Promise<Integration[]>;
  getSettings(): Promise<AccountSettings>;
  updateSettings(settings: AccountSettings): Promise<AccountSettings>;

  listOperationalRuns(): Promise<AnalysisRun[]>;
}
