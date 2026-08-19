import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AppShell } from "@/components/app-shell";
import { EmptyState, ErrorState, LoadingState } from "@/components/states";
import { ProjectStatusPill } from "@/components/status-pill";
import { projectsQuery } from "@/lib/queries";
import { formatMoney } from "@/lib/billing";
import { formatDate } from "@/lib/display";

export const Route = createFileRoute("/app/projects/")({
  component: ProjectsPage,
});

function ProjectsPage() {
  const projects = useQuery(projectsQuery());
  const [term, setTerm] = useState("");

  const filtered = (projects.data ?? []).filter((p) =>
    [p.name, p.client, p.contractRef].join(" ").toLowerCase().includes(term.toLowerCase()),
  );

  return (
    <AppShell
      title="Projects"
      description="Every job under review, with identified exposure and outstanding decisions."
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
        <div className="space-y-4">
          <div className="max-w-sm">
            <label htmlFor="project-search" className="sr-only">
              Search projects
            </label>
            <Input
              id="project-search"
              placeholder="Search by project, client or contract"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
            />
          </div>

          {projects.data.length === 0 ? (
            <EmptyState
              title="No projects yet"
              description="Create your first project to start a review."
              action={
                <Button asChild size="sm">
                  <Link to="/app/projects/new">New project</Link>
                </Button>
              }
            />
          ) : filtered.length === 0 ? (
            <EmptyState
              title="No matches"
              description={`Nothing matches "${term}". Clear the search to see all projects.`}
              action={
                <Button variant="outline" size="sm" onClick={() => setTerm("")}>
                  Clear search
                </Button>
              }
            />
          ) : (
            <div className="panel overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th scope="col">Project</th>
                    <th scope="col">Contract</th>
                    <th scope="col">Status</th>
                    <th scope="col" className="text-right">Docs</th>
                    <th scope="col" className="text-right">Open</th>
                    <th scope="col" className="text-right">Exposure</th>
                    <th scope="col">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((project) => (
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
                      <td className="numeric text-right">{project.documentCount}</td>
                      <td className="numeric text-right">{project.openFindings}</td>
                      <td className="numeric text-right">
                        {formatMoney(project.exposureCents, project.currency)}
                      </td>
                      <td className="text-muted-foreground">{formatDate(project.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : null}
    </AppShell>
  );
}
