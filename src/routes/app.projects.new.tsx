import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AppShell } from "@/components/app-shell";
import { ErrorState, PermissionDeniedState } from "@/components/states";
import { capabilities, getProductApi } from "@/lib/product-api";
import { analytics } from "@/lib/analytics";
import { useSession } from "@/lib/session";
import { canActOnFindings } from "@/lib/workflow/finding-transitions";

export const Route = createFileRoute("/app/projects/new")({
  component: NewProjectPage,
});

function NewProjectPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useSession();
  const [form, setForm] = useState({ name: "", client: "", contractRef: "" });

  const create = useMutation({
    mutationFn: () => getProductApi().createProject(form),
    onSuccess: async (project) => {
      analytics.track("core_workflow_started", { step: "project_created" });
      await queryClient.invalidateQueries({ queryKey: ["projects"] });
      await navigate({ to: "/app/projects/$projectId", params: { projectId: project.id } });
    },
  });

  const allowed = canActOnFindings(user?.role) && capabilities().createProject;

  return (
    <AppShell
      title="New project"
      description="Create the project, then upload the contract and the field record."
      breadcrumb={
        <Link to="/app/projects" className="hover:text-foreground">
          Projects
        </Link>
      }
    >
      {!allowed ? (
        <PermissionDeniedState description="Viewer access can read projects but cannot create them. Ask an account owner for manager access." />
      ) : (
        <form
          className="panel max-w-xl space-y-4 p-5"
          onSubmit={(e) => {
            e.preventDefault();
            create.mutate();
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="name">Project name</Label>
            <Input
              id="name"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Northline Medical Fit-Out"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="client">Client / general contractor</Label>
            <Input
              id="client"
              required
              value={form.client}
              onChange={(e) => setForm({ ...form, client: e.target.value })}
              placeholder="Brightwater Construction"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="contractRef">Contract reference</Label>
            <Input
              id="contractRef"
              value={form.contractRef}
              onChange={(e) => setForm({ ...form, contractRef: e.target.value })}
              placeholder="BWC-2291"
            />
            <p className="text-xs text-muted-foreground">
              Used to match documents back to the prime contract. Optional.
            </p>
          </div>

          {create.isError ? <ErrorState error={create.error} /> : null}

          <div className="flex gap-2">
            <Button type="submit" disabled={create.isPending}>
              {create.isPending ? "Creating…" : "Create project"}
            </Button>
            <Button asChild variant="outline" type="button">
              <Link to="/app/projects">Cancel</Link>
            </Button>
          </div>
        </form>
      )}
    </AppShell>
  );
}
