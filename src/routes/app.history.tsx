import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueries, useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/app-shell";
import { EmptyState, ErrorState, LoadingState } from "@/components/states";
import { auditQuery, projectsQuery } from "@/lib/queries";
import { formatDateTime } from "@/lib/display";

export const Route = createFileRoute("/app/history")({
  component: HistoryPage,
});

function HistoryPage() {
  const projects = useQuery(projectsQuery());
  const list = projects.data ?? [];

  const audits = useQueries({
    queries: list.map((project) => auditQuery(project.id)),
  });

  const rows = list
    .flatMap((project, index) =>
      (audits[index]?.data ?? []).map((event) => ({ project, event })),
    )
    .sort((a, b) => b.event.at.localeCompare(a.event.at));

  const loading = projects.isPending || audits.some((q) => q.isPending);

  return (
    <AppShell
      title="History"
      description="Audit events recorded by the backend: uploads, analysis runs, state changes and exports."
    >
      {projects.isError ? (
        <ErrorState error={projects.error} onRetry={() => projects.refetch()} />
      ) : loading ? (
        <LoadingState label="Loading audit history" rows={5} />
      ) : rows.length === 0 ? (
        <EmptyState
          title="No history yet"
          description="Audit events appear as soon as documents are uploaded and analysis runs."
        />
      ) : (
        <div className="panel overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th scope="col">When</th>
                <th scope="col">Project</th>
                <th scope="col">Actor</th>
                <th scope="col">Action</th>
                <th scope="col">Detail</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ project, event }) => (
                <tr key={event.id}>
                  <td className="numeric whitespace-nowrap text-xs text-muted-foreground">
                    {formatDateTime(event.at)}
                  </td>
                  <td>
                    <Link
                      to="/app/projects/$projectId"
                      params={{ projectId: project.id }}
                      className="font-medium hover:text-primary"
                    >
                      {project.name}
                    </Link>
                  </td>
                  <td className="text-muted-foreground">{event.actor}</td>
                  <td className="font-medium">{event.action}</td>
                  <td className="text-muted-foreground">{event.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AppShell>
  );
}
