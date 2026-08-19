import { createDemoProductApi } from "./demo-adapter";
import { createHttpProductApi } from "./http-adapter";
import type { ProductApi } from "./types";

export * from "./types";
export { createDemoProductApi } from "./demo-adapter";
export { createHttpProductApi } from "./http-adapter";

/**
 * Adapter selection.
 * - VITE_API_BASE_URL set  -> HTTP adapter against the authoritative backend.
 * - unset                  -> clearly labelled demo adapter (synthetic data).
 */
export function resolveProductApi(baseUrl = import.meta.env["VITE_API_BASE_URL"]): ProductApi {
  const trimmed = typeof baseUrl === "string" ? baseUrl.trim() : "";
  return trimmed ? createHttpProductApi(trimmed) : createDemoProductApi();
}

let singleton: ProductApi | null = null;

export function getProductApi(): ProductApi {
  if (!singleton) singleton = resolveProductApi();
  return singleton;
}

export const isDemoMode = () => getProductApi().mode === "demo";
