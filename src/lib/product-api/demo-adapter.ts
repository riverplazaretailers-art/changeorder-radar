/**
 * DEMO ADAPTER — SYNTHETIC DATA ONLY.
 *
 * Every project, document, finding and amount here is invented for product
 * demonstration. It is not customer data and is not customer proof.
 * This module is never used when VITE_API_BASE_URL is configured, and it
 * contains no detection logic — findings are pre-canned fixtures standing in
 * for the authoritative backend's deterministic heuristics.
 */
import {
  ProductApiError,
  type AccountSettings,
  type AccountUser,
  type ActionRegisterExport,
  type AnalysisRun,
  type AuditEvent,
  type CreateProjectInput,
  type Finding,
  type Integration,
  type ProductApi,
  type ProjectDocument,
  type ProjectSummary,
  type UpdateFindingInput,
  type UploadDocumentInput,
} from "./types";

const DEMO_BANNER = "Synthetic demo record";

function iso(daysAgo: number, hour = 9): string {
  const d = new Date(Date.UTC(2026, 6, 20, hour, 0, 0));
  d.setUTCDate(d.getUTCDate() - daysAgo);
  return d.toISOString();
}

let counter = 0;
const nextId = (prefix: string) => `${prefix}_${(++counter).toString(36)}${Date.now().toString(36)}`;

interface DemoState {
  user: AccountUser | null;
  projects: ProjectSummary[];
  documents: ProjectDocument[];
  findings: Finding[];
  runs: AnalysisRun[];
  audit: AuditEvent[];
  settings: AccountSettings;
}

function evidence(
  id: string,
  documentId: string,
  filename: string,
  locator: string,
  excerpt: string,
  daysAgo: number,
) {
  return { id, documentId, documentFilename: filename, locator, excerpt, capturedAt: iso(daysAgo) };
}

function seed(): DemoState {
  const projects: ProjectSummary[] = [
    {
      id: "prj_northline",
      name: "Northline Medical Fit-Out — Phase 2",
      client: "Northline Health (demo)",
      contractRef: "NL-2261",
      status: "analyzed",
      createdAt: iso(34),
      analyzedAt: iso(3, 14),
      documentCount: 6,
      openFindings: 3,
      exposureCents: 8734000,
      currency: "USD",
    },
    {
      id: "prj_harbor",
      name: "Harbor Logistics Warehouse Retrofit",
      client: "Harbor Logistics (demo)",
      contractRef: "HL-0918",
      status: "analyzed",
      createdAt: iso(61),
      analyzedAt: iso(11, 16),
      documentCount: 4,
      openFindings: 1,
      exposureCents: 2145000,
      currency: "USD",
    },
    {
      id: "prj_civic",
      name: "Civic Center Mechanical Upgrade",
      client: "Metro Civic Authority (demo)",
      contractRef: "MC-4407",
      status: "draft",
      createdAt: iso(2),
      analyzedAt: null,
      documentCount: 0,
      openFindings: 0,
      exposureCents: 0,
      currency: "USD",
    },
  ];

  const documents: ProjectDocument[] = [
    ["doc_nl_1", "prj_northline", "NL-2261_prime_contract.pdf", "contract", 2_418_000, 48],
    ["doc_nl_2", "prj_northline", "NL-2261_CO_01-04.pdf", "change_order", 812_000, 12],
    ["doc_nl_3", "prj_northline", "daily_logs_may.csv", "daily_log", 96_000, null],
    ["doc_nl_4", "prj_northline", "owner_correspondence.pdf", "email", 341_000, 22],
    ["doc_nl_5", "prj_northline", "field_notes_level3.pdf", "field_note", 188_000, 9],
    ["doc_nl_6", "prj_northline", "pay_app_07.csv", "invoice", 41_000, null],
    ["doc_hl_1", "prj_harbor", "HL-0918_contract.pdf", "contract", 1_902_000, 36],
    ["doc_hl_2", "prj_harbor", "HL_change_orders.csv", "change_order", 22_000, null],
    ["doc_hl_3", "prj_harbor", "site_logs_q1.csv", "daily_log", 118_000, null],
    ["doc_hl_4", "prj_harbor", "rfi_thread.pdf", "email", 210_000, 14],
  ].map(([id, projectId, filename, kind, byteSize, pageCount], i) => ({
    id: id as string,
    projectId: projectId as string,
    filename: filename as string,
    kind: kind as ProjectDocument["kind"],
    byteSize: byteSize as number,
    status: "parsed" as const,
    uploadedAt: iso(20 - i),
    pageCount: pageCount as number | null,
    rejectionReason: null,
  }));

  const findings: Finding[] = [
    {
      id: "fnd_nl_1",
      projectId: "prj_northline",
      reference: "CR-001",
      title: "Level 3 duct rerouting performed on verbal direction",
      category: "directive_without_co",
      state: "open",
      confidence: "high",
      amountCents: 4120000,
      currency: "USD",
      detectedAt: iso(3, 14),
      rule: "verbal_direction_without_change_order",
      rationale:
        "Daily logs record added crew hours for duct rerouting on three consecutive days; no executed change order references that scope.",
      assignee: null,
      resolutionNote: null,
      evidence: [
        evidence(
          "ev_1",
          "doc_nl_3",
          "daily_logs_may.csv",
          "row 214",
          "Rerouted Level 3 supply duct per owner rep verbal direction — 3 sheet metal, 9.5 hrs.",
          3,
        ),
        evidence(
          "ev_2",
          "doc_nl_4",
          "owner_correspondence.pdf",
          "page 11",
          "Please proceed with the reroute; we will paper it later.",
          3,
        ),
        evidence(
          "ev_3",
          "doc_nl_2",
          "NL-2261_CO_01-04.pdf",
          "index",
          "CO 01-04 cover none of the Level 3 duct scope.",
          3,
        ),
      ],
    },
    {
      id: "fnd_nl_2",
      projectId: "prj_northline",
      reference: "CR-002",
      title: "Change order 03 executed but never billed",
      category: "unbilled_extra_work",
      state: "assigned",
      confidence: "high",
      amountCents: 2864000,
      currency: "USD",
      detectedAt: iso(3, 14),
      rule: "executed_co_absent_from_billing",
      rationale:
        "CO 03 is signed by both parties. No line on pay applications 05 through 07 references CO 03.",
      assignee: "Dana Whitfield",
      resolutionNote: null,
      evidence: [
        evidence("ev_4", "doc_nl_2", "NL-2261_CO_01-04.pdf", "page 7", "CO 03 — executed.", 3),
        evidence("ev_5", "doc_nl_6", "pay_app_07.csv", "schedule of values", "No CO 03 line.", 3),
      ],
    },
    {
      id: "fnd_nl_3",
      projectId: "prj_northline",
      reference: "CR-003",
      title: "Missing signature page on change order 04",
      category: "documentation_gap",
      state: "open",
      confidence: "medium",
      amountCents: 1750000,
      currency: "USD",
      detectedAt: iso(3, 14),
      rule: "unsigned_change_order",
      rationale: "CO 04 pricing pages are present; the execution page is absent from the packet.",
      assignee: null,
      resolutionNote: null,
      evidence: [
        evidence("ev_6", "doc_nl_2", "NL-2261_CO_01-04.pdf", "page 12", "CO 04 — pricing only.", 3),
      ],
    },
    {
      id: "fnd_nl_4",
      projectId: "prj_northline",
      reference: "CR-004",
      title: "Acceleration hours logged during owner-caused delay window",
      category: "potential_scope_change",
      state: "resolved",
      confidence: "medium",
      amountCents: 980000,
      currency: "USD",
      detectedAt: iso(3, 14),
      rule: "overtime_during_owner_delay",
      rationale: "Overtime spike coincides with the documented owner access restriction.",
      assignee: "Marcus Oyelaran",
      resolutionNote: "Included in CO 05 submitted 2026-07-12.",
      evidence: [
        evidence("ev_7", "doc_nl_3", "daily_logs_may.csv", "rows 301-318", "OT 46 hrs.", 3),
      ],
    },
    {
      id: "fnd_hl_1",
      projectId: "prj_harbor",
      reference: "CR-001",
      title: "RFI response expanded dock leveler scope",
      category: "potential_scope_change",
      state: "open",
      confidence: "high",
      amountCents: 2145000,
      currency: "USD",
      detectedAt: iso(11, 16),
      rule: "rfi_response_expands_scope",
      rationale: "RFI 22 response specifies heavier levelers than the contract schedule.",
      assignee: null,
      resolutionNote: null,
      evidence: [
        evidence("ev_8", "doc_hl_4", "rfi_thread.pdf", "page 6", "Use 30k lb units.", 11),
        evidence("ev_9", "doc_hl_1", "HL-0918_contract.pdf", "page 19", "20k lb units.", 11),
      ],
    },
    {
      id: "fnd_hl_2",
      projectId: "prj_harbor",
      reference: "CR-002",
      title: "Duplicate daily log entry",
      category: "documentation_gap",
      state: "dismissed",
      confidence: "low",
      amountCents: null,
      currency: "USD",
      detectedAt: iso(11, 16),
      rule: "duplicate_log_entry",
      rationale: "Two identical log rows for the same crew and date.",
      assignee: null,
      resolutionNote: "Clerical duplicate, no cost impact.",
      evidence: [evidence("ev_10", "doc_hl_3", "site_logs_q1.csv", "rows 88-89", "Duplicate.", 11)],
    },
  ];

  const runs: AnalysisRun[] = [
    {
      id: "run_nl_1",
      projectId: "prj_northline",
      state: "succeeded",
      startedAt: iso(3, 13),
      finishedAt: iso(3, 14),
      documentsProcessed: 6,
      findingsProduced: 4,
      failureReason: null,
    },
    {
      id: "run_hl_1",
      projectId: "prj_harbor",
      state: "succeeded",
      startedAt: iso(11, 15),
      finishedAt: iso(11, 16),
      documentsProcessed: 4,
      findingsProduced: 2,
      failureReason: null,
    },
    {
      id: "run_hl_0",
      projectId: "prj_harbor",
      state: "failed",
      startedAt: iso(12, 10),
      finishedAt: iso(12, 10),
      documentsProcessed: 1,
      findingsProduced: 0,
      failureReason: "Scanned contract exceeded OCR page budget.",
    },
  ];

  return {
    user: null,
    projects,
    documents,
    findings,
    runs,
    audit: [
      {
        id: "aud_1",
        at: iso(3, 14),
        actor: "system",
        action: "analysis.completed",
        detail: "6 documents processed, 4 findings produced.",
      },
      {
        id: "aud_2",
        at: iso(2, 10),
        actor: "Dana Whitfield",
        action: "finding.assigned",
        detail: "CR-002 assigned to Dana Whitfield.",
      },
      {
        id: "aud_3",
        at: iso(1, 15),
        actor: "Marcus Oyelaran",
        action: "finding.resolved",
        detail: "CR-004 resolved.",
      },
    ],
    settings: {
      companyName: "Demo Mechanical Contractors",
      defaultCurrency: "USD",
      closeoutReminderDays: 14,
      notifyOnAnalysisComplete: true,
    },
  };
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export interface DemoApiOptions {
  /** Latency simulation in ms. Set to 0 in tests. */
  latencyMs?: number;
}

export function createDemoProductApi(options: DemoApiOptions = {}): ProductApi {
  const latency = options.latencyMs ?? 260;
  const state = seed();
  const wait = () => (latency > 0 ? delay(latency) : Promise.resolve());

  function requireProject(id: string): ProjectSummary {
    const project = state.projects.find((p) => p.id === id);
    if (!project) throw new ProductApiError("Project not found", "not_found", 404);
    return project;
  }

  function recount(projectId: string) {
    const project = requireProject(projectId);
    const findings = state.findings.filter((f) => f.projectId === projectId);
    project.openFindings = findings.filter(
      (f) => f.state === "open" || f.state === "assigned",
    ).length;
    project.exposureCents = findings
      .filter((f) => f.state !== "dismissed")
      .reduce((sum, f) => sum + (f.amountCents ?? 0), 0);
    project.documentCount = state.documents.filter((d) => d.projectId === projectId).length;
  }

  return {
    mode: "demo",
    capabilities: {
      liveData: false,
      signIn: true,
      createProject: true,
      uploadDocuments: true,
      startAnalysis: true,
      updateFindings: true,
      exportActionRegister: true,
      writeSettings: true,
      operations: true,
    },

    async getCurrentUser() {
      await wait();
      return state.user;
    },
    async signIn(email: string) {
      await wait();
      if (!email.includes("@")) throw new ProductApiError("Enter a valid email", "invalid", 400);
      state.user = {
        id: "usr_demo",
        name: (email.split("@")[0] ?? "demo").replace(/[._]/g, " "),
        email,
        role: "owner",
        company: state.settings.companyName,
      };
      return state.user;
    },
    async signOut() {
      await wait();
      state.user = null;
    },

    async listProjects() {
      await wait();
      return state.projects.map((p) => ({ ...p }));
    },
    async getProject(id) {
      await wait();
      return { ...requireProject(id) };
    },
    async createProject(input: CreateProjectInput) {
      await wait();
      if (!input.name.trim()) throw new ProductApiError("Project name is required", "invalid", 400);
      const project: ProjectSummary = {
        id: nextId("prj"),
        name: input.name.trim(),
        client: input.client.trim() || DEMO_BANNER,
        contractRef: input.contractRef.trim(),
        status: "draft",
        createdAt: new Date().toISOString(),
        analyzedAt: null,
        documentCount: 0,
        openFindings: 0,
        exposureCents: 0,
        currency: state.settings.defaultCurrency,
      };
      state.projects = [project, ...state.projects];
      return { ...project };
    },

    async listDocuments(projectId) {
      await wait();
      requireProject(projectId);
      return state.documents.filter((d) => d.projectId === projectId).map((d) => ({ ...d }));
    },
    async uploadDocument(input: UploadDocumentInput) {
      await wait();
      requireProject(input.projectId);
      const doc: ProjectDocument = {
        id: nextId("doc"),
        projectId: input.projectId,
        filename: input.filename,
        kind: input.kind,
        byteSize: input.byteSize,
        status: "parsed",
        uploadedAt: new Date().toISOString(),
        pageCount: input.filename.toLowerCase().endsWith(".csv") ? null : 4,
        rejectionReason: null,
      };
      state.documents.push(doc);
      recount(input.projectId);
      return { ...doc };
    },

    async startAnalysis(projectId) {
      await wait();
      const project = requireProject(projectId);
      const docs = state.documents.filter((d) => d.projectId === projectId);
      if (docs.length === 0) {
        const failed: AnalysisRun = {
          id: nextId("run"),
          projectId,
          state: "failed",
          startedAt: new Date().toISOString(),
          finishedAt: new Date().toISOString(),
          documentsProcessed: 0,
          findingsProduced: 0,
          failureReason: "Upload at least one document before analysis.",
        };
        state.runs = [failed, ...state.runs];
        project.status = "failed";
        throw new ProductApiError(failed.failureReason!, "invalid", 400);
      }

      project.status = "analyzing";
      const run: AnalysisRun = {
        id: nextId("run"),
        projectId,
        state: "running",
        startedAt: new Date().toISOString(),
        finishedAt: null,
        documentsProcessed: 0,
        findingsProduced: 0,
        failureReason: null,
      };
      state.runs = [run, ...state.runs];

      const finish = () => {
        run.state = "succeeded";
        run.finishedAt = new Date().toISOString();
        run.documentsProcessed = docs.length;
        const existing = state.findings.filter((f) => f.projectId === projectId);
        if (existing.length === 0) {
          const sample: Finding = {
            id: nextId("fnd"),
            projectId,
            reference: "CR-001",
            title: "Field-directed work without a matching change order",
            category: "directive_without_co",
            state: "open",
            confidence: "medium",
            amountCents: 1450000,
            currency: project.currency,
            detectedAt: new Date().toISOString(),
            rule: "verbal_direction_without_change_order",
            rationale: `${DEMO_BANNER}: illustrative finding produced by the demo adapter.`,
            assignee: null,
            resolutionNote: null,
            evidence: [
              evidence(
                nextId("ev"),
                docs[0]!.id,
                docs[0]!.filename,
                "page 1",
                `${DEMO_BANNER} excerpt.`,
                0,
              ),
            ],
          };
          state.findings.push(sample);
        }
        run.findingsProduced = state.findings.filter((f) => f.projectId === projectId).length;
        project.status = "analyzed";
        project.analyzedAt = run.finishedAt;
        recount(projectId);
      };

      if (latency > 0) setTimeout(finish, latency * 4);
      else finish();

      return { ...run };
    },
    async getAnalysisRun(projectId) {
      await wait();
      const run = state.runs.find((r) => r.projectId === projectId);
      return run ? { ...run } : null;
    },

    async listFindings(projectId) {
      await wait();
      requireProject(projectId);
      return state.findings.filter((f) => f.projectId === projectId).map((f) => ({ ...f }));
    },
    async getFinding(findingId) {
      await wait();
      const finding = state.findings.find((f) => f.id === findingId);
      if (!finding) throw new ProductApiError("Finding not found", "not_found", 404);
      return { ...finding };
    },
    async updateFinding(input: UpdateFindingInput) {
      await wait();
      const finding = state.findings.find((f) => f.id === input.findingId);
      if (!finding) throw new ProductApiError("Finding not found", "not_found", 404);
      if (state.user?.role === "viewer") {
        throw new ProductApiError("Viewers cannot change finding state", "forbidden", 403);
      }
      if (input.state === "assigned" && !(input.assignee ?? finding.assignee)) {
        throw new ProductApiError("An assignee is required", "invalid", 400);
      }
      if (input.state === "resolved" && !(input.note ?? finding.resolutionNote)) {
        throw new ProductApiError("A resolution note is required", "invalid", 400);
      }
      finding.state = input.state;
      if (input.assignee !== undefined) finding.assignee = input.assignee;
      if (input.note !== undefined) finding.resolutionNote = input.note;
      state.audit.unshift({
        id: nextId("aud"),
        at: new Date().toISOString(),
        actor: state.user?.name ?? "demo user",
        action: `finding.${input.state}`,
        detail: `${finding.reference} set to ${input.state}.`,
      });
      recount(finding.projectId);
      return { ...finding };
    },

    async listAuditEvents(projectId) {
      await wait();
      requireProject(projectId);
      return state.audit.map((e) => ({ ...e }));
    },
    async exportActionRegister(projectId) {
      await wait();
      const project = requireProject(projectId);
      const rows = state.findings
        .filter((f) => f.projectId === projectId)
        .map((f) =>
          [
            f.reference,
            f.category,
            f.state,
            f.confidence,
            f.amountCents == null ? "" : (f.amountCents / 100).toFixed(2),
            f.assignee ?? "",
            f.evidence.length,
          ].join(","),
        );
      return {
        filename: `${project.contractRef || project.id}-action-register.csv`,
        mimeType: "text/csv",
        content: ["reference,category,state,confidence,amount,assignee,evidence_count", ...rows].join(
          "\n",
        ),
      };
    },

    async listIntegrations() {
      await wait();
      return DEMO_INTEGRATIONS.map((i) => ({ ...i }));
    },
    async getSettings() {
      await wait();
      return { ...state.settings };
    },
    async updateSettings(settings: AccountSettings) {
      await wait();
      state.settings = { ...settings };
      return { ...state.settings };
    },

    async listOperationalRuns() {
      await wait();
      return state.runs.map((r) => ({ ...r }));
    },
  };
}

/**
 * Integration status is honest and conservative: only file-based intake and
 * PDF/CSV analysis is Live today. Everything else is Planned until the
 * backend reports otherwise.
 */
export const DEMO_INTEGRATIONS: Integration[] = [
  {
    id: "file_intake",
    name: "File upload intake (PDF, CSV)",
    category: "Document intake",
    status: "live",
    description:
      "Upload contracts, change orders, daily logs, emails, field notes and invoices. Parsing and evidence capture run in the ChangeOrder Radar backend.",
  },
  {
    id: "email_forward",
    name: "Email forwarding address",
    category: "Document intake",
    status: "planned",
    description: "Forward owner correspondence to a project inbox for automatic intake.",
  },
  {
    id: "procore",
    name: "Procore",
    category: "Project management",
    status: "planned",
    description: "Pull contracts, change orders, RFIs and daily logs directly from the project record.",
  },
  {
    id: "autodesk_build",
    name: "Autodesk Build",
    category: "Project management",
    status: "planned",
    description: "Sync issues, RFIs and daily reports.",
  },
  {
    id: "sage300",
    name: "Sage 300 CRE",
    category: "Accounting",
    status: "planned",
    description: "Reconcile billed change order values against job cost.",
  },
  {
    id: "quickbooks",
    name: "QuickBooks",
    category: "Accounting",
    status: "planned",
    description: "Match invoices and pay applications to executed change orders.",
  },
];
