/**
 * Runtime mode selection for ChangeOrder Radar.
 *
 * Three explicit, mutually exclusive modes:
 *
 *  - "demo"        Default. Clearly labelled synthetic records. No network.
 *  - "secure-link" VITE_SECURE_WORKSPACE_URL is set. The preserved ChangeOrder
 *                  Radar workspace remains authoritative and owns sign-in,
 *                  upload and analysis. This app links out for every real
 *                  project action; it never claims direct integration.
 *  - "api"         BOTH VITE_API_BASE_URL and VITE_API_CONTRACT_VERSION=v1 are
 *                  set. Uses the v1 gateway adapter. Partial or mismatched
 *                  configuration FAILS CLOSED (never silently degrades to a
 *                  live call).
 */

export type RuntimeMode = "demo" | "secure-link" | "api";

export const SUPPORTED_CONTRACT_VERSION = "v1";

export interface RuntimeConfig {
  mode: RuntimeMode;
  /** Validated absolute https URL of the preserved secure workspace, or null. */
  secureWorkspaceUrl: string | null;
  /** Validated API origin used only in "api" mode. */
  apiBaseUrl: string | null;
  contractVersion: string | null;
  /** Human-readable explanation, surfaced in diagnostics and the UI banner. */
  reason: string;
}

export interface RuntimeEnv {
  VITE_SECURE_WORKSPACE_URL?: unknown;
  VITE_API_BASE_URL?: unknown;
  VITE_API_CONTRACT_VERSION?: unknown;
}

const str = (value: unknown) => (typeof value === "string" ? value.trim() : "");

/**
 * Only absolute http(s) URLs are ever used for navigation. Anything else
 * (javascript:, data:, protocol-relative, embedded credentials, malformed) is
 * rejected so a misconfigured env var can never become an injection vector.
 */
export function safeExternalUrl(raw: unknown): string | null {
  const candidate = str(raw);
  if (!candidate) return null;
  let url: URL;
  try {
    url = new URL(candidate);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  if (url.protocol === "http:" && !/^(localhost|127\.0\.0\.1|\[::1\])$/.test(url.hostname)) {
    return null;
  }
  if (url.username || url.password) return null;
  return url.toString().replace(/\/+$/, "");
}

/** Builds a safe deep link into the secure workspace. */
export function secureWorkspacePath(base: string | null, path = "/"): string | null {
  if (!base) return null;
  const suffix = path.startsWith("/") ? path : `/${path}`;
  const resolved = safeExternalUrl(`${base}${suffix}`);
  if (!resolved) return null;
  // Never allow a path to escape the configured workspace origin.
  return resolved.startsWith(base) ? resolved : base;
}

export function resolveRuntimeConfig(env: RuntimeEnv = {}): RuntimeConfig {
  const secureWorkspaceUrl = safeExternalUrl(env.VITE_SECURE_WORKSPACE_URL);
  const apiBaseUrl = safeExternalUrl(env.VITE_API_BASE_URL);
  const contractVersion = str(env.VITE_API_CONTRACT_VERSION) || null;

  const apiConfigured = Boolean(str(env.VITE_API_BASE_URL)) || Boolean(contractVersion);
  const apiValid = Boolean(apiBaseUrl) && contractVersion === SUPPORTED_CONTRACT_VERSION;

  if (apiValid) {
    return {
      mode: "api",
      secureWorkspaceUrl,
      apiBaseUrl,
      contractVersion,
      reason: `Gateway contract ${SUPPORTED_CONTRACT_VERSION} configured.`,
    };
  }

  const failClosed = apiConfigured
    ? ` API configuration ignored (fail-closed): ${
        apiBaseUrl
          ? `unsupported contract version ${contractVersion ?? "unset"}`
          : "VITE_API_BASE_URL missing or not an absolute https URL"
      }.`
    : "";

  if (secureWorkspaceUrl) {
    return {
      mode: "secure-link",
      secureWorkspaceUrl,
      apiBaseUrl: null,
      contractVersion,
      reason: `Real project work continues in the preserved secure workspace.${failClosed}`,
    };
  }

  return {
    mode: "demo",
    secureWorkspaceUrl: null,
    apiBaseUrl: null,
    contractVersion,
    reason: `Demo mode: synthetic records only.${failClosed}`,
  };
}
