import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AppShell } from "@/components/app-shell";
import {
  ErrorState,
  LoadingState,
  PermissionDeniedState,
  SuccessState,
} from "@/components/states";
import { FindingStatePill, StatusPill } from "@/components/status-pill";
import { findingQuery } from "@/lib/queries";
import { getProductApi, type FindingState } from "@/lib/product-api";
import { formatMoney } from "@/lib/billing";
import {
  CONFIDENCE_LABEL,
  FINDING_CATEGORY_LABEL,
  FINDING_STATE_LABEL,
  formatDateTime,
} from "@/lib/display";
import { analytics } from "@/lib/analytics";
import { useSession } from "@/lib/session";
import {
  ALLOWED_TRANSITIONS,
  canActOnFindings,
  checkTransition,
  requirementsFor,
} from "@/lib/workflow/finding-transitions";

export const Route = createFileRoute("/app/findings/$findingId")({
  component: FindingDetailPage,
});

const REASON_COPY: Record<string, string> = {
  forbidden: "Your role cannot change finding state.",
  invalid_transition: "That state change isn't allowed from here.",
  assignee_required: "Assign the finding to someone before saving.",
  note_required: "Add a note explaining the decision.",
};

function FindingDetailPage() {
  const { findingId } = Route.useParams();
  const queryClient = useQueryClient();
  const { user } = useSession();
  const canAct = canActOnFindings(user?.role);

  const finding = useQuery(findingQuery(findingId));
  const [target, setTarget] = useState<FindingState | null>(null);
  const [assignee, setAssignee] = useState("");
  const [note, setNote] = useState("");
  const [validation, setValidation] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const update = useMutation({
    mutationFn: () =>
      getProductApi().updateFinding({
        findingId,
        state: target as FindingState,
        assignee: assignee || null,
        note: note || null,
      }),
    onSuccess: async (next) => {
      analytics.track("repeat_usage", { action: "finding_state_changed", state: next.state });
      if (next.state === "resolved") {
        analytics.track("core_workflow_completed", { outcome: "finding_resolved" });
      }
      setSaved(true);
      setTarget(null);
      setNote("");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["finding", findingId] }),
        queryClient.invalidateQueries({ queryKey: ["findings", next.projectId] }),
        queryClient.invalidateQueries({ queryKey: ["project", next.projectId] }),
        queryClient.invalidateQueries({ queryKey: ["audit", next.projectId] }),
        queryClient.invalidateQueries({ queryKey: ["projects"] }),
      ]);
    },
  });

  if (finding.isPending) {
    return (
      <AppShell title="Finding">
        <LoadingState label="Loading finding" rows={4} />
      </AppShell>
    );
  }
  if (finding.isError) {
    return (
      <AppShell title="Finding">
        <ErrorState error={finding.error} onRetry={() => finding.refetch()} />
      </AppShell>
    );
  }

  const f = finding.data;
  const options = ALLOWED_TRANSITIONS[f.state];
  const req = target ? requirementsFor(target) : { assignee: false, note: false };

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!target) return;
    const check = checkTransition({
      from: f.state,
      to: target,
      role: user?.role,
      assignee,
      note,
    });
    if (!check.ok) {
      setValidation(REASON_COPY[check.reason] ?? "That change isn't allowed.");
      return;
    }
    setValidation(null);
    update.mutate();
  }

  return (
    <AppShell
      title={f.title}
      description={`${f.reference} · ${FINDING_CATEGORY_LABEL[f.category]}`}
      breadcrumb={
        <Link
          to="/app/projects/$projectId"
          params={{ projectId: f.projectId }}
          className="hover:text-foreground"
        >
          Project
        </Link>
      }
      actions={<FindingStatePill state={f.state} />}
    >
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          <section className="panel p-5">
            <h2 className="text-sm font-semibold">Why this was flagged</h2>
            <p className="mt-2 text-sm text-muted-foreground">{f.rationale}</p>
            <dl className="mt-4 grid gap-3 border-t border-border pt-4 text-sm sm:grid-cols-3">
              <div>
                <dt className="eyebrow">Rule</dt>
                <dd className="numeric mt-1 text-xs">{f.rule}</dd>
              </div>
              <div>
                <dt className="eyebrow">Confidence</dt>
                <dd className="mt-1">{CONFIDENCE_LABEL[f.confidence]}</dd>
              </div>
              <div>
                <dt className="eyebrow">Detected</dt>
                <dd className="mt-1 text-muted-foreground">{formatDateTime(f.detectedAt)}</dd>
              </div>
            </dl>
          </section>

          <section className="panel overflow-hidden">
            <div className="border-b border-border px-4 py-3">
              <h2 className="text-sm font-semibold">Evidence</h2>
              <p className="text-xs text-muted-foreground">
                Each excerpt is a backend-captured reference to a source document.
              </p>
            </div>
            <ul className="divide-y divide-border">
              {f.evidence.map((item) => (
                <li key={item.id} className="px-4 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium">{item.documentFilename}</span>
                    <StatusPill tone="neutral" dot={false}>
                      {item.locator}
                    </StatusPill>
                    <span className="ml-auto text-xs text-muted-foreground">
                      {formatDateTime(item.capturedAt)}
                    </span>
                  </div>
                  <blockquote className="mt-2 border-l-2 border-primary/40 pl-3 text-sm text-muted-foreground">
                    {item.excerpt}
                  </blockquote>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="space-y-4">
          <div className="panel p-5">
            <p className="eyebrow">Value at risk</p>
            <p className="numeric mt-2 text-2xl font-semibold">
              {formatMoney(f.amountCents, f.currency)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Backend estimate from the source record. Not a claim amount.
            </p>
          </div>

          <div className="panel p-5">
            <h2 className="text-sm font-semibold">Decision</h2>
            {!canAct ? (
              <div className="mt-3">
                <PermissionDeniedState />
              </div>
            ) : (
              <form className="mt-3 space-y-3" onSubmit={submit}>
                <fieldset>
                  <legend className="eyebrow">Move to</legend>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {options.map((option) => (
                      <Button
                        key={option}
                        type="button"
                        size="sm"
                        variant={target === option ? "default" : "outline"}
                        aria-pressed={target === option}
                        onClick={() => {
                          setTarget(option);
                          setValidation(null);
                          setSaved(false);
                        }}
                      >
                        {FINDING_STATE_LABEL[option]}
                      </Button>
                    ))}
                  </div>
                </fieldset>

                {req.assignee ? (
                  <div className="space-y-1.5">
                    <Label htmlFor="assignee">Assign to</Label>
                    <Input
                      id="assignee"
                      value={assignee}
                      onChange={(e) => setAssignee(e.target.value)}
                      placeholder="Name or email"
                    />
                  </div>
                ) : null}

                {req.note ? (
                  <div className="space-y-1.5">
                    <Label htmlFor="note">Note</Label>
                    <Textarea
                      id="note"
                      rows={3}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="What was decided and why."
                    />
                  </div>
                ) : null}

                {validation ? (
                  <p role="alert" className="text-sm text-destructive">
                    {validation}
                  </p>
                ) : null}
                {update.isError ? <ErrorState error={update.error} /> : null}
                {saved ? <SuccessState title="Finding updated" /> : null}

                <Button type="submit" disabled={!target || update.isPending} className="w-full">
                  {update.isPending ? "Saving…" : "Save decision"}
                </Button>
              </form>
            )}
          </div>

          {f.assignee || f.resolutionNote ? (
            <div className="panel p-5 text-sm">
              {f.assignee ? (
                <p>
                  <span className="eyebrow block">Assignee</span>
                  {f.assignee}
                </p>
              ) : null}
              {f.resolutionNote ? (
                <p className="mt-3">
                  <span className="eyebrow block">Latest note</span>
                  <span className="text-muted-foreground">{f.resolutionNote}</span>
                </p>
              ) : null}
            </div>
          ) : null}
        </aside>
      </div>
    </AppShell>
  );
}
