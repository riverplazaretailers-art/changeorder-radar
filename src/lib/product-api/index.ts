import { createDemoProductApi } from "./demo-adapter";
import { createHttpProductApi } from "./http-adapter";
import { createSecureLinkProductApi } from "./secure-link-adapter";
import { resolveRuntimeConfig, secureWorkspacePath, type RuntimeConfig, type RuntimeEnv } from "./mode";
import type { ProductApi } from "./types";

export * from "./types";
export * from "./mode";
export { createDemoProductApi } from "./demo-adapter";
export { createHttpProductApi } from "./http-adapter";
export { createSecureLinkProductApi } from "./secure-link-adapter";

/**
 * Adapter selection is driven exclusively by the resolved runtime mode.
 *  - api         -> v1 gateway adapter (future contract; same-origin/cookie auth)
 *  - secure-link -> hand-off adapter, no data, no writes
 *  - demo        -> clearly labelled synthetic adapter
 */
export function resolveProductApi(env?: RuntimeEnv): ProductApi {
  const config = resolveRuntimeConfig(env ?? (import.meta.env as unknown as RuntimeEnv));
  if (config.mode === "api" && config.apiBaseUrl) return createHttpProductApi(config.apiBaseUrl);
  if (config.mode === "secure-link") return createSecureLinkProductApi();
  return createDemoProductApi();
}

let singleton: ProductApi | null = null;
let configSingleton: RuntimeConfig | null = null;

export function getRuntimeConfig(): RuntimeConfig {
  if (!configSingleton) {
    configSingleton = resolveRuntimeConfig(import.meta.env as unknown as RuntimeEnv);
  }
  return configSingleton;
}

export function getProductApi(): ProductApi {
  if (!singleton) singleton = resolveProductApi();
  return singleton;
}

export const isDemoMode = () => getProductApi().mode === "demo";
export const isSecureLinkMode = () => getProductApi().mode === "secure-link";
export const capabilities = () => getProductApi().capabilities;

/** Validated deep link into the preserved workspace, or null when unavailable. */
export function workspaceLink(path = "/"): string | null {
  return secureWorkspacePath(getRuntimeConfig().secureWorkspaceUrl, path);
}
