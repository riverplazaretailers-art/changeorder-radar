import { describe, expect, it } from "vitest";
import { resolveRuntimeConfig, safeExternalUrl, secureWorkspacePath } from "../mode";
import { resolveProductApi } from "../index";
import { createDemoProductApi } from "../demo-adapter";
import { createSecureLinkProductApi } from "../secure-link-adapter";
import { createHttpProductApi } from "../http-adapter";

describe("mode selection", () => {
  it("defaults to demo", () => {
    const config = resolveRuntimeConfig({});
    expect(config.mode).toBe("demo");
    expect(config.apiBaseUrl).toBeNull();
    expect(config.secureWorkspaceUrl).toBeNull();
  });

  it("selects secure-link when the workspace URL is set", () => {
    const config = resolveRuntimeConfig({
      VITE_SECURE_WORKSPACE_URL: "https://radar.example.com/",
    });
    expect(config.mode).toBe("secure-link");
    expect(config.secureWorkspaceUrl).toBe("https://radar.example.com");
  });

  it("selects api only when base URL and contract v1 are both set", () => {
    expect(
      resolveRuntimeConfig({
        VITE_API_BASE_URL: "https://api.example.com",
        VITE_API_CONTRACT_VERSION: "v1",
      }).mode,
    ).toBe("api");
  });

  it("prefers api over secure-link when fully configured", () => {
    expect(
      resolveRuntimeConfig({
        VITE_API_BASE_URL: "https://api.example.com",
        VITE_API_CONTRACT_VERSION: "v1",
        VITE_SECURE_WORKSPACE_URL: "https://radar.example.com",
      }).mode,
    ).toBe("api");
  });
});

describe("fail-closed partial configuration", () => {
  it("never enters api mode without the contract version", () => {
    const config = resolveRuntimeConfig({ VITE_API_BASE_URL: "https://api.example.com" });
    expect(config.mode).toBe("demo");
    expect(config.apiBaseUrl).toBeNull();
    expect(config.reason).toMatch(/fail-closed/i);
  });

  it("never enters api mode on a contract version mismatch", () => {
    const config = resolveRuntimeConfig({
      VITE_API_BASE_URL: "https://api.example.com",
      VITE_API_CONTRACT_VERSION: "v2",
    });
    expect(config.mode).toBe("demo");
    expect(config.reason).toMatch(/unsupported contract version v2/i);
  });

  it("never enters api mode with a version but no base URL", () => {
    expect(resolveRuntimeConfig({ VITE_API_CONTRACT_VERSION: "v1" }).mode).toBe("demo");
  });

  it("falls back to secure-link, not api, on partial api config", () => {
    const config = resolveRuntimeConfig({
      VITE_API_BASE_URL: "https://api.example.com",
      VITE_SECURE_WORKSPACE_URL: "https://radar.example.com",
    });
    expect(config.mode).toBe("secure-link");
    expect(config.apiBaseUrl).toBeNull();
  });
});

describe("safe external URL handling", () => {
  it("rejects dangerous or malformed schemes", () => {
    for (const raw of [
      "javascript:alert(1)",
      "data:text/html,<script>",
      "//evil.example.com",
      "not a url",
      "",
      undefined,
      42,
    ]) {
      expect(safeExternalUrl(raw)).toBeNull();
    }
  });

  it("rejects embedded credentials and non-local http", () => {
    expect(safeExternalUrl("https://user:pass@radar.example.com")).toBeNull();
    expect(safeExternalUrl("http://radar.example.com")).toBeNull();
    expect(safeExternalUrl("http://localhost:8787")).toBe("http://localhost:8787");
  });

  it("keeps deep links inside the configured workspace origin", () => {
    const base = "https://radar.example.com";
    expect(secureWorkspacePath(base, "/sign-in")).toBe("https://radar.example.com/sign-in");
    expect(secureWorkspacePath(base, "projects")).toBe("https://radar.example.com/projects");
    expect(secureWorkspacePath(null, "/sign-in")).toBeNull();
  });
});

describe("capabilities", () => {
  it("hides every real action in secure-link mode", () => {
    const caps = createSecureLinkProductApi().capabilities;
    expect(Object.values(caps).every((value) => value === false)).toBe(true);
  });

  it("marks demo data as not live", () => {
    expect(createDemoProductApi().capabilities.liveData).toBe(false);
  });

  it("marks gateway data as live", () => {
    expect(createHttpProductApi("https://api.example.com").capabilities.liveData).toBe(true);
  });
});

describe("no network outside api mode", () => {
  const failingFetch = (() => {
    throw new Error("network call attempted outside api mode");
  }) as unknown as typeof fetch;

  it("demo mode performs no fetch at all", async () => {
    const original = globalThis.fetch;
    globalThis.fetch = failingFetch;
    try {
      const api = resolveProductApi({});
      await api.listProjects();
      await api.listFindings("p1").catch(() => []);
    } finally {
      globalThis.fetch = original;
    }
  });

  it("secure-link mode performs no fetch and exposes no data", async () => {
    const original = globalThis.fetch;
    globalThis.fetch = failingFetch;
    try {
      const api = resolveProductApi({ VITE_SECURE_WORKSPACE_URL: "https://radar.example.com" });
      await expect(api.listProjects()).resolves.toEqual([]);
      await expect(api.getCurrentUser()).resolves.toBeNull();
      await expect(api.createProject({ name: "x", client: "y", contractRef: "z" })).rejects.toThrow(
        /secure ChangeOrder Radar workspace/i,
      );
    } finally {
      globalThis.fetch = original;
    }
  });

  it("only the api-mode adapter issues /v1 requests", async () => {
    const calls: string[] = [];
    const api = createHttpProductApi("https://api.example.com", async (input) => {
      calls.push(String(input));
      return new Response("[]", { status: 200, headers: { "content-type": "application/json" } });
    });
    await api.listProjects();
    expect(calls.every((url) => url.includes("/v1/"))).toBe(true);
  });
});

describe("demo isolation", () => {
  it("keeps demo state out of other adapters", async () => {
    const demo = createDemoProductApi();
    await demo.createProject({ name: "Synthetic", client: "Demo GC", contractRef: "D-1" });
    const fresh = createDemoProductApi();
    const projects = await fresh.listProjects();
    expect(projects.some((p) => p.name === "Synthetic")).toBe(false);

    const link = createSecureLinkProductApi();
    await expect(link.listProjects()).resolves.toEqual([]);
  });
});
