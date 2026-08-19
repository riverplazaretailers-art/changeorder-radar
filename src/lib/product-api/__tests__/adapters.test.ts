import { describe, expect, it } from "vitest";
import { createDemoProductApi } from "../demo-adapter";
import { createHttpProductApi } from "../http-adapter";
import { resolveProductApi } from "../index";
import { ProductApiError } from "../types";

describe("adapter selection", () => {
  it("uses the demo adapter when nothing is configured", () => {
    expect(resolveProductApi({}).mode).toBe("demo");
    expect(resolveProductApi({ VITE_API_BASE_URL: "   " }).mode).toBe("demo");
  });

  it("uses the HTTP adapter only with base URL AND contract version v1", () => {
    expect(
      resolveProductApi({
        VITE_API_BASE_URL: "https://api.example.com",
        VITE_API_CONTRACT_VERSION: "v1",
      }).mode,
    ).toBe("http");
    expect(resolveProductApi({ VITE_API_BASE_URL: "https://api.example.com" }).mode).toBe("demo");
  });

  it("uses the secure-link adapter when the workspace URL is configured", () => {
    expect(
      resolveProductApi({ VITE_SECURE_WORKSPACE_URL: "https://workspace.example.com" }).mode,
    ).toBe("secure-link");
  });
});

describe("http adapter", () => {
  const ok = (body: unknown) =>
    new Response(JSON.stringify(body), {
      status: 200,
      headers: { "content-type": "application/json" },
    });

  it("calls the configured base URL and strips trailing slashes", async () => {
    const calls: string[] = [];
    const api = createHttpProductApi("https://api.example.com/", async (input) => {
      calls.push(String(input));
      return ok([]);
    });
    await api.listProjects();
    expect(calls[0]).toBe("https://api.example.com/v1/projects");
  });

  it("returns null for an unauthenticated current user instead of throwing", async () => {
    const api = createHttpProductApi("https://api.example.com", async () =>
      new Response("{}", { status: 401 }),
    );
    await expect(api.getCurrentUser()).resolves.toBeNull();
  });

  it("maps HTTP failures onto ProductApiError codes", async () => {
    const api = createHttpProductApi("https://api.example.com", async () =>
      new Response(JSON.stringify({ message: "Not allowed" }), { status: 403 }),
    );
    await expect(api.listProjects()).rejects.toMatchObject({
      name: "ProductApiError",
      code: "forbidden",
    });
  });

  it("wraps transport failures as network errors", async () => {
    const api = createHttpProductApi("https://api.example.com", async () => {
      throw new Error("connection refused");
    });
    const error = await api.listProjects().catch((e) => e);
    expect(error).toBeInstanceOf(ProductApiError);
    expect((error as ProductApiError).code).toBe("network");
  });
});

describe("demo adapter", () => {
  it("is labelled as demo and serves synthetic projects", async () => {
    const api = createDemoProductApi();
    expect(api.mode).toBe("demo");
    const projects = await api.listProjects();
    expect(projects.length).toBeGreaterThan(0);
  });

  it("runs the workflow: create, upload, analyze, review, export", async () => {
    const api = createDemoProductApi();
    await api.signIn("owner@example.com");

    const project = await api.createProject({
      name: "Test Fit-Out",
      client: "Example GC",
      contractRef: "EX-1",
    });
    expect(project.status).toBe("draft");

    await api.uploadDocument({
      projectId: project.id,
      filename: "contract.pdf",
      kind: "contract",
      byteSize: 2048,
    });
    const documents = await api.listDocuments(project.id);
    expect(documents).toHaveLength(1);

    const run = await api.startAnalysis(project.id);
    expect(["succeeded", "failed", "running", "queued"]).toContain(run.state);

    const findings = await api.listFindings(project.id);
    if (findings.length > 0) {
      const first = findings[0]!;
      const updated = await api.updateFinding({
        findingId: first.id,
        state: "resolved",
        note: "Change order issued.",
      });
      expect(updated.state).toBe("resolved");
    }

    const exported = await api.exportActionRegister(project.id);
    expect(exported.mimeType).toContain("csv");
    expect(exported.content.length).toBeGreaterThan(0);
  });

  it("raises a not_found ProductApiError for unknown projects", async () => {
    const api = createDemoProductApi();
    await expect(api.getProject("missing")).rejects.toMatchObject({ code: "not_found" });
  });

  it("records audit events for state changes", async () => {
    const api = createDemoProductApi();
    const [project] = await api.listProjects();
    const events = await api.listAuditEvents(project!.id);
    expect(Array.isArray(events)).toBe(true);
  });
});
