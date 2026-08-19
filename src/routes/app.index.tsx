import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppShell } from "@/components/app-shell";
import { EmptyState, ErrorState, LoadingState } from "@/components/states";
import { ProjectStatusPill, StatusPill } from "@/components/status-pill";
import { projectsQuery, operationalRunsQuery } from "@/lib/queries";
import { formatMoney } from "@/lib/billing";
import { formatDate } from "@/lib/display";

export const Route = createFileRoute("/app/")({
  component: DashboardPage,
});

function Metric({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="panel p-4">
      <p className="eyebrow">{label}</p>
      <p className="numeric mt-2 text-2xl font-semibold tracking-tight">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

function DashboardPage() {
  const projects = useQuery(projectsQuery());
  const runs = useQuery(operationalRunsQuery());

  const list = projects.data ?? [];
  const exposure = list.reduce((sum, p) => sum + p.exposureCents, 0);
  const openFindings = list.reduce((sum, p) => sum + p.openFindings, 0);
  const failedRuns = (runs.data ?? []).filter((r) => r.state === "failed").length;

  return (
    <AppShell
      title="Dashboard"
      description="Exposure identified across active projects, and what still needs a decision."
      actions={
        <Button asChild size="sm">
          <Link to="/app/projects/new">
            <Plus className="size-4" aria-hidden />
            New project
          </Link>
        </Button>
      }
    >
      {projects.isPending ? <LoadingState label="Loading projects" /> : null}
      {projects.isError ? (
        <ErrorState error={projects.error} onRetry={() => projects.refetch()} />
      ) : null}

      {projects.isSuccess ? (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Metric label="Projects" value={String(list.length)} />
            <Metric
              label="Identified exposure"
              value={formatMoney(exposure)}
              hint="Backend-estimated, excludes dismissed"
            />
            <Metric label="Findings awaiting decision" value={String(openFindings)} />
            <Metric
              label="Failed analysis runs"
              value={String(failedRuns)}
              hint={failedRuns > 0 ? "Review in Operations" : "None"}
            />
          </div>

          {list.length === 0 ? (
            <EmptyState
              title="No projects yet"
              description="Create a project, upload the contract and field record, then run the first analysis."
              action={
                <Button asChild size="sm">
                  <Link to="/app/projects/new">Create the first project</Link>
                </Button>
              }
            />
          ) : (
            <section className="panel overflow-hidden">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <h2 className="text-sm font-semibold">Active projects</h2>
                <Link
                  to="/app/projects"
                  className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                >
                  All projects
                  <ArrowUpRight className="size-3.5" aria-hidden />
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th scope="col">Project</th>
                      <th scope="col">Contract</th>
                      <th scope="col">Status</th>
                      <th scope="col" className="text-right">Open</th>
                      <th scope="col" className="text-right">Exposure</th>
                      <th scope="col">Analyzed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.slice(0, 6).map((project) => (
                      <tr key={project.id}>
                        <td>
                          <Link
                            to="/app/projects/$projectId"
                            params={{ projectId: project.id }}
                            className="font-medium text-foreground hover:text-primary"
                          >
                            {project.name}
                          </Link>
                          <p className="text-xs text-muted-foreground">{project.client}</p>
                        </td>
                        <td className="numeric text-xs">{project.contractRef || "—"}</td>
                        <td><ProjectStatusPill status={project.status} /></td>
                        <td className="numeric text-right">{project.openFindings}</td>
                        <td className="numeric text-right">
                          {formatMoney(project.exposureCents, project.currency)}
                        </td>
                        <td className="text-muted-foreground">{formatDate(project.analyzedAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          <div className="panel flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <h2 className="text-sm font-semibold">Closeout is the deadline</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Findings are only useful while the contract still allows notice. Work the register
                before final payment.
              </p>
            </div>
            <StatusPill tone="accent">Private beta</StatusPill>
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}
