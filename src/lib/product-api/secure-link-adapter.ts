/**
 * SECURE-LINK ADAPTER.
 *
 * Used when VITE_SECURE_WORKSPACE_URL is configured. The preserved ChangeOrder
 * Radar workspace remains authoritative for sign-in, upload, deterministic
 * analysis, evidence and findings. This app has NO direct integration with it,
 * so the adapter deliberately exposes no data and no write capability: every
 * real action is handed off to the workspace via a validated external link.
 */
import {
  ProductApiError,
  type AccountSettings,
  type ProductApi,
  type ProductApiCapabilities,
} from "./types";

const CAPABILITIES: ProductApiCapabilities = {
  liveData: false,
  signIn: false,
  createProject: false,
  uploadDocuments: false,
  startAnalysis: false,
  updateFindings: false,
  exportActionRegister: false,
  writeSettings: false,
  operations: false,
};

const HANDOFF = "This action is performed in the secure ChangeOrder Radar workspace.";

function unavailable(): never {
  throw new ProductApiError(HANDOFF, "forbidden");
}

const SETTINGS: AccountSettings = {
  companyName: "",
  defaultCurrency: "USD",
  closeoutReminderDays: 14,
  notifyOnAnalysisComplete: true,
};

export function createSecureLinkProductApi(): ProductApi {
  return {
    mode: "secure-link",
    capabilities: CAPABILITIES,

    getCurrentUser: async () => null,
    signIn: async () => unavailable(),
    signOut: async () => undefined,

    listProjects: async () => [],
    getProject: async () => unavailable(),
    createProject: async () => unavailable(),

    listDocuments: async () => [],
    uploadDocument: async () => unavailable(),

    startAnalysis: async () => unavailable(),
    getAnalysisRun: async () => null,

    listFindings: async () => [],
    getFinding: async () => unavailable(),
    updateFinding: async () => unavailable(),

    listAuditEvents: async () => [],
    exportActionRegister: async () => unavailable(),

    listIntegrations: async () => [],
    getSettings: async () => SETTINGS,
    updateSettings: async () => unavailable(),

    listOperationalRuns: async () => [],
  };
}
