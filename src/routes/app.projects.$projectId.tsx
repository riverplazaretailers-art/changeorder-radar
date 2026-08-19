import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Download, Play, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AppShell } from "@/components/app-shell";
import { EmptyState, ErrorState, LoadingState, SuccessState } from "@/components/states";
import { FindingStatePill, ProjectStatusPill, StatusPill } from "@/components/status-pill";
import {
  analysisRunQuery,
  documentsQuery,
  findingsQuery,
  projectQuery,
} from "@/lib/queries";
import { getProductApi, type DocumentKind } from "@/lib/product-api";
import { formatMoney } from "@/lib/billing";
import {
  CONFIDENCE_LABEL,
  DOCUMENT_KIND_LABEL,
  FINDING_CATEGORY_LABEL,
  formatBytes,
  formatDateTime,
} from "@/lib/display";
import { analytics } from "@/lib/analytics";
import { useSession } from "@/lib/session";
import { canActOnFindings } from "@/lib/workflow/finding-transitions";

export const Route = createFileRoute("/app/projects/$projectId")({
  component: ProjectDetailPage,
});

const KINDS = Object.keys(DOCUMENT_KIND_LABEL) as DocumentKind[];

function ProjectDetailPage() {
  const { projectId } = Route.useParams();
  const queryClient = useQueryClient();
  const { user } = useSession();
  const canAct = canActOnFindings(user?.role);

  const project = useQuery(projectQuery(projectId));
  const documents = useQuery(documentsQuery(projectId));
  const findings = useQuery(findingsQuery(projectId));
  const run = useQuery({
    ...analysisRunQuery(projectId),
    // The backend owns the run; the UI simply polls until it settles.
    refetchInterval: (query) => {
      const state = query.state.data?.state;
      return state === "queued" || state === "running" ? 1500 : false;
    },
  });

  const [kind, setKind] = useState<DocumentKind>("contract");
  const [exported, setExported] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const invalidate = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["documents", projectId] }),
      queryClient.invalidateQueries({ queryKey: ["findings", projectId] }),
      queryClient.invalidateQueries({ queryKey: ["project", projectId] }),
      queryClient.invalidateQueries({ queryKey: ["analysis", projectId] }),
      queryClient.invalidateQueries({ queryKey: ["audit", projectId] }),
      queryClient.invalidateQueries({ queryKey: ["projects"] }),
    ]);
  };

  const runState = run.data?.state;
  useEffect(() => {
    if (runState !== "succeeded" && runState !== "failed") return;
    void Promise.all([
      queryClient.invalidateQueries({ queryKey: ["findings", projectId] }),
      queryClient.invalidateQueries({ queryKey: ["project", projectId] }),
      queryClient.invalidateQueries({ queryKey: ["documents", projectId] }),
      queryClient.invalidateQueries({ queryKey: ["audit", projectId] }),
      queryClient.invalidateQueries({ queryKey: ["projects"] }),
    ]);
  }, [runState, projectId, queryClient]);



  const upload = useMutation({
    mutationFn: async (file: File) =>
      getProductApi().uploadDocument({
        projectId,
        filename: file.name,
        kind,
        byteSize: file.size,
      }),
    onSuccess: async () => {
      // Only metadata is instrumented — never filenames or document contents.
      analytics.track("core_workflow_started", { step: "document_uploaded", kind });
      await invalidate();
    },
  });

  const analyze = useMutation({
    mutationFn: () => getProductApi().startAnalysis(projectId),
    onSuccess: async (result) => {
      if (result.state === "failed") {
        analytics.track("workflow_failed", { stage: "analysis" });
      } else {
        analytics.track("first_successful_outcome", {
          findings_produced: result.findingsProduced,
        });
      }
      await invalidate();
    },
    onError: () => analytics.track("workflow_failed", { stage: "analysis" }),
  });

  const exportRegister = useMutation({
    mutationFn: () => getProductApi().exportActionRegister(projectId),
    onSuccess: async (file) => {
      analytics.track("core_workflow_completed", { artifact: "action_register" });
      const blob = new Blob([file.content], { type: file.mimeType });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = file.filename;
      anchor.click();
      URL.revokeObjectURL(url);
      setExported(file.filename);
      await queryClient.invalidateQueries({ queryKey: ["audit", projectId] });
    },
  });

  if (project.isPending) {
    return (
      <AppShell title="Project">
        <LoadingState label="Loading project" rows={4} />
      </AppShell>
    );
  }

  if (project.isError) {
    return (
      <AppShell title="Project">
        <ErrorState error={project.error} onRetry={() => project.refetch()} />
      </AppShell>
    );
  }

  const p = project.data;
  const docs = documents.data ?? [];
  const findingList = findings.data ?? [];
  const analysisFailed = run.data?.state === "failed";

  return (
    <AppShell
      title={p.name}
      description={`${p.client}${p.contractRef ? ` · ${p.contractRef}` : ""}`}
      breadcrumb={
        <Link to="/app/projects" className="hover:text-foreground">
          Projects
        </Link>
      }
      actions={
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => exportRegister.mutate()}
            disabled={exportRegister.isPending || findingList.length === 0}
          >
            <Download className="size-4" aria-hidden />
            Export register
          </Button>
          <Button
            size="sm"
            onClick={() => analyze.mutate()}
            disabled={analyze.isPending || docs.length === 0 || !canAct}
          >
            <Play className="size-4" aria-hidden />
            {analyze.isPending ? "Analyzing…" : "Run analysis"}
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="panel p-4">
            <p className="eyebrow">Status</p>
            <div className="mt-2"><ProjectStatusPill status={p.status} /></div>
          </div>
          <div className="panel p-4">
            <p className="eyebrow">Documents</p>
            <p className="numeric mt-2 text-2xl font-semibold">{p.documentCount}</p>
          </div>
          <div className="panel p-4">
            <p className="eyebrow">Open findings</p>
            <p className="numeric mt-2 text-2xl font-semibold">{p.openFindings}</p>
          </div>
          <div className="panel p-4">
            <p className="eyebrow">Identified exposure</p>
            <p className="numeric mt-2 text-2xl font-semibold">
              {formatMoney(p.exposureCents, p.currency)}
            </p>
          </div>
        </div>

        {analysisFailed ? (
          <div className="panel border-destructive/30 bg-destructive/5 p-4" role="alert">
            <p className="text-sm font-semibold text-destructive">Last analysis run failed</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {run.data?.failureReason ?? "The backend reported a failure."} Re-run once the
              document is readable, or check Operations.
            </p>
          </div>
        ) : null}

        {exported ? (
          <SuccessState
            title="Action register exported"
            description={`${exported} downloaded. The export is recorded in the audit history.`}
          />
        ) : null}

        <section className="panel overflow-hidden">
          <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border px-4 py-3">
            <div>
              <h2 className="text-sm font-semibold">Documents</h2>
              <p className="text-xs text-muted-foreground">
                Contract, change orders, daily logs, emails, field notes and invoices. Parsing runs
                on the backend.
              </p>
            </div>
            <div className="flex items-end gap-2">
              <div className="space-y-1">
                <Label htmlFor="doc-kind" className="text-xs">
                  Document type
                </Label>
                <Select value={kind} onValueChange={(value) => setKind(value as DocumentKind)}>
                  <SelectTrigger id="doc-kind" className="w-44">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {KINDS.map((k) => (
                      <SelectItem key={k} value={k}>
                        {DOCUMENT_KIND_LABEL[k]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.csv,.txt,.eml"
                className="sr-only"
                aria-label="Choose a document to upload"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) upload.mutate(file);
                  event.target.value = "";
                }}
              />
              <Button
                size="sm"
                variant="outline"
                disabled={upload.isPending || !canAct}
                onClick={() => fileRef.current?.click()}
              >
                <Upload className="size-4" aria-hidden />
                {upload.isPending ? "Uploading…" : "Upload"}
              </Button>
            </div>
          </div>

          {upload.isError ? (
            <div className="p-4">
              <ErrorState error={upload.error} />
            </div>
          ) : null}

          {documents.isPending ? (
            <div className="p-4">
              <LoadingState label="Loading documents" rows={2} />
            </div>
          ) : docs.length === 0 ? (
            <div className="p-4">
              <EmptyState
                title="No documents yet"
                description="Upload the executed contract first, then the change orders and field record."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th scope="col">File</th>
                    <th scope="col">Type</th>
                    <th scope="col">Status</th>
                    <th scope="col" className="text-right">Pages</th>
                    <th scope="col" className="text-right">Size</th>
                    <th scope="col">Uploaded</th>
                  </tr>
                </thead>
                <tbody>
                  {docs.map((doc) => (
                    <tr key={doc.id}>
                      <td className="font-medium">
                        {doc.filename}
                        {doc.rejectionReason ? (
                          <p className="text-xs text-destructive">{doc.rejectionReason}</p>
                        ) : null}
                      </td>
                      <td className="text-muted-foreground">{DOCUMENT_KIND_LABEL[doc.kind]}</td>
                      <td>
                        <StatusPill
                          tone={
                            doc.status === "parsed"
                              ? "success"
                              : doc.status === "rejected"
                                ? "danger"
                                : "info"
                          }
                        >
                          {doc.status}
                        </StatusPill>
                      </td>
                      <td className="numeric text-right">{doc.pageCount ?? "—"}</td>
                      <td className="numeric text-right">{formatBytes(doc.byteSize)}</td>
                      <td className="text-muted-foreground">{formatDateTime(doc.uploadedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="panel overflow-hidden">
          <div className="border-b border-border px-4 py-3">
            <h2 className="text-sm font-semibold">Findings</h2>
            <p className="text-xs text-muted-foreground">
              Produced by backend heuristics. Every finding links to the evidence it came from.
            </p>
          </div>

          {findings.isPending ? (
            <div className="p-4">
              <LoadingState label="Loading findings" rows={3} />
            </div>
          ) : findings.isError ? (
            <div className="p-4">
              <ErrorState error={findings.error} onRetry={() => findings.refetch()} />
            </div>
          ) : findingList.length === 0 ? (
            <div className="p-4">
              <EmptyState
                title="No findings yet"
                description="Run the analysis once the contract and field record are uploaded."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th scope="col">Ref</th>
                    <th scope="col">Finding</th>
                    <th scope="col">Category</th>
                    <th scope="col">Confidence</th>
                    <th scope="col">State</th>
                    <th scope="col" className="text-right">Value at risk</th>
                    <th scope="col" className="text-right">Evidence</th>
                  </tr>
                </thead>
                <tbody>
                  {findingList.map((finding) => (
                    <tr key={finding.id}>
                      <td className="numeric text-xs text-muted-foreground">{finding.reference}</td>
                      <td>
                        <Link
                          to="/app/findings/$findingId"
                          params={{ findingId: finding.id }}
                          className="font-medium hover:text-primary"
                        >
                          {finding.title}
                        </Link>
                      </td>
                      <td className="text-muted-foreground">
                        {FINDING_CATEGORY_LABEL[finding.category]}
                      </td>
                      <td className="text-muted-foreground">
                        {CONFIDENCE_LABEL[finding.confidence]}
                      </td>
                      <td><FindingStatePill state={finding.state} /></td>
                      <td className="numeric text-right">
                        {formatMoney(finding.amountCents, finding.currency)}
                      </td>
                      <td className="numeric text-right">{finding.evidence.length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
