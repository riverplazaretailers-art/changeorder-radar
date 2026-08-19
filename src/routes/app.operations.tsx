import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/app-shell";
import { EmptyState, ErrorState, LoadingState, PermissionDeniedState } from "@/components/states";
import { StatusPill } from "@/components/status-pill";
import { operationalRunsQuery } from "@/lib/queries";
import { formatDateTime } from "@/lib/display";
import { useSession } from "@/lib/session";

export const Route = createFileRoute("/app/operations")({
  component: OperationsPage,
});

function OperationsPage() {
  const { user } = useSession();
  const runs = useQuery({ ...operationalRunsQuery(), enabled: user?.role === "owner" });

  if (user?.role !== "owner") {
    return (
      <AppShell title="Operations">
        <PermissionDeniedState description="Analysis run monitoring is limited to account owners." />
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Operations"
      description="Analysis jobs and failures reported by the backend. Use this to spot documents the parser could not read."
    >
      {runs.isPending ? (
        <LoadingState label="Loading runs" rows={4} />
      ) : runs.isError ? (
        <ErrorState error={runs.error} onRetry={() => runs.refetch()} />
      ) : runs.data.length === 0 ? (
        <EmptyState title="No analysis runs yet" description="Runs appear once a project is analyzed." />
      ) : (
        <div className="panel overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th scope="col">Run</th>
                <th scope="col">State</th>
                <th scope="col">Started</th>
                <th scope="col">Finished</th>
                <th scope="col" className="text-right">Docs</th>
                <th scope="col" className="text-right">Findings</th>
                <th scope="col">Failure</th>
              </tr>
            </thead>
            <tbody>
              {runs.data.map((run) => (
                <tr key={run.id}>
                  <td className="numeric text-xs">{run.id}</td>
                  <td>
                    <StatusPill
                      tone={
                        run.state === "failed"
                          ? "danger"
                          : run.state === "succeeded"
                            ? "success"
                            : "info"
                      }
                    >
                      {run.state}
                    </StatusPill>
                  </td>
                  <td className="text-muted-foreground">{formatDateTime(run.startedAt)}</td>
                  <td className="text-muted-foreground">{formatDateTime(run.finishedAt)}</td>
                  <td className="numeric text-right">{run.documentsProcessed}</td>
                  <td className="numeric text-right">{run.findingsProduced}</td>
                  <td className="text-muted-foreground">{run.failureReason ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AppShell>
  );
}
