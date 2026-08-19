import { queryOptions } from "@tanstack/react-query";
import { getProductApi } from "@/lib/product-api";

const api = () => getProductApi();

export const projectsQuery = () =>
  queryOptions({ queryKey: ["projects"], queryFn: () => api().listProjects() });

export const projectQuery = (projectId: string) =>
  queryOptions({ queryKey: ["project", projectId], queryFn: () => api().getProject(projectId) });

export const documentsQuery = (projectId: string) =>
  queryOptions({
    queryKey: ["documents", projectId],
    queryFn: () => api().listDocuments(projectId),
  });

export const findingsQuery = (projectId: string) =>
  queryOptions({ queryKey: ["findings", projectId], queryFn: () => api().listFindings(projectId) });

export const findingQuery = (findingId: string) =>
  queryOptions({ queryKey: ["finding", findingId], queryFn: () => api().getFinding(findingId) });

export const auditQuery = (projectId: string) =>
  queryOptions({ queryKey: ["audit", projectId], queryFn: () => api().listAuditEvents(projectId) });

export const analysisRunQuery = (projectId: string) =>
  queryOptions({
    queryKey: ["analysis", projectId],
    queryFn: () => api().getAnalysisRun(projectId),
  });

export const settingsQuery = () =>
  queryOptions({ queryKey: ["settings"], queryFn: () => api().getSettings() });

export const operationalRunsQuery = () =>
  queryOptions({ queryKey: ["ops-runs"], queryFn: () => api().listOperationalRuns() });
