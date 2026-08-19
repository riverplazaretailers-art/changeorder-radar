/**
 * HTTP adapter for the authoritative ChangeOrder Radar backend.
 * Configured entirely by VITE_API_BASE_URL. No secrets in source:
 * the browser sends the session cookie issued by the backend.
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

function mapStatus(status: number): ProductApiError["code"] {
  if (status === 401) return "unauthorized";
  if (status === 403) return "forbidden";
  if (status === 404) return "not_found";
  if (status >= 400 && status < 500) return "invalid";
  return "server";
}

export function createHttpProductApi(baseUrl: string, fetchImpl: typeof fetch = fetch): ProductApi {
  const root = baseUrl.replace(/\/+$/, "");

  async function request<T>(path: string, init?: RequestInit): Promise<T> {
    let response: Response;
    try {
      response = await fetchImpl(`${root}${path}`, {
        ...init,
        credentials: "include",
        headers: {
          Accept: "application/json",
          ...(init?.body ? { "Content-Type": "application/json" } : {}),
          ...(init?.headers ?? {}),
        },
      });
    } catch (cause) {
      throw new ProductApiError(
        cause instanceof Error ? cause.message : "Network request failed",
        "network",
      );
    }

    if (response.status === 204) return undefined as T;

    if (!response.ok) {
      let message = `Request failed (${response.status})`;
      try {
        const body = (await response.json()) as { message?: string; error?: string };
        message = body.message ?? body.error ?? message;
      } catch {
        /* non-JSON error body */
      }
      throw new ProductApiError(message, mapStatus(response.status), response.status);
    }

    return (await response.json()) as T;
  }

  const json = (body: unknown) => ({ body: JSON.stringify(body) });

  return {
    mode: "http",
    capabilities: {
      liveData: true,
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
      try {
        return await request<AccountUser>("/v1/me");
      } catch (error) {
        if (error instanceof ProductApiError && error.code === "unauthorized") return null;
        throw error;
      }
    },
    signIn: (email) =>
      request<AccountUser>("/v1/auth/session", { method: "POST", ...json({ email }) }),
    signOut: () => request<void>("/v1/auth/session", { method: "DELETE" }),

    listProjects: () => request<ProjectSummary[]>("/v1/projects"),
    getProject: (id) => request<ProjectSummary>(`/v1/projects/${encodeURIComponent(id)}`),
    createProject: (input: CreateProjectInput) =>
      request<ProjectSummary>("/v1/projects", { method: "POST", ...json(input) }),

    listDocuments: (projectId) =>
      request<ProjectDocument[]>(`/v1/projects/${encodeURIComponent(projectId)}/documents`),
    uploadDocument: (input: UploadDocumentInput) =>
      request<ProjectDocument>(`/v1/projects/${encodeURIComponent(input.projectId)}/documents`, {
        method: "POST",
        ...json({ filename: input.filename, kind: input.kind, byteSize: input.byteSize }),
      }),

    startAnalysis: (projectId) =>
      request<AnalysisRun>(`/v1/projects/${encodeURIComponent(projectId)}/analysis`, {
        method: "POST",
      }),
    getAnalysisRun: (projectId) =>
      request<AnalysisRun | null>(`/v1/projects/${encodeURIComponent(projectId)}/analysis`),

    listFindings: (projectId) =>
      request<Finding[]>(`/v1/projects/${encodeURIComponent(projectId)}/findings`),
    getFinding: (findingId) => request<Finding>(`/v1/findings/${encodeURIComponent(findingId)}`),
    updateFinding: (input: UpdateFindingInput) =>
      request<Finding>(`/v1/findings/${encodeURIComponent(input.findingId)}`, {
        method: "PATCH",
        ...json({ state: input.state, assignee: input.assignee, note: input.note }),
      }),

    listAuditEvents: (projectId) =>
      request<AuditEvent[]>(`/v1/projects/${encodeURIComponent(projectId)}/audit`),
    exportActionRegister: (projectId) =>
      request<ActionRegisterExport>(
        `/v1/projects/${encodeURIComponent(projectId)}/action-register`,
      ),

    listIntegrations: () => request<Integration[]>("/v1/integrations"),
    getSettings: () => request<AccountSettings>("/v1/settings"),
    updateSettings: (settings) =>
      request<AccountSettings>("/v1/settings", { method: "PUT", ...json(settings) }),

    listOperationalRuns: () => request<AnalysisRun[]>("/v1/ops/runs"),
  };
}
