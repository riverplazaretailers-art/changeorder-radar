import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { PageHeader, SiteLayout } from "@/components/site-chrome";
import { StatusPill } from "@/components/status-pill";

export const Route = createFileRoute("/workflow")({
  head: () => ({
    meta: [
      { title: "How ChangeOrder Radar works — project record review" },
      {
        name: "description",
        content:
          "Create a project, upload the contract and field record, analyze, review evidence-backed findings, then export an action register before closeout.",
      },
      { property: "og:title", content: "How ChangeOrder Radar works" },
      {
        property: "og:description",
        content:
          "From document intake to an evidence-backed action register, in one pass over the project record.",
      },
    ],
  }),
  component: WorkflowPage,
});

const STAGES = [
  {
    n: "01",
    title: "Create the project",
    who: "Project manager or controller",
    body: "Job name, client and contract reference. The project is the unit of review — one job, one register.",
    detail: ["No configuration or field mapping", "Minutes, not an implementation project"],
  },
  {
    n: "02",
    title: "Upload the record",
    who: "Project manager or project engineer",
    body: "Prime contract, executed and pending change orders, daily logs, owner correspondence, field notes, invoices and pay applications.",
    detail: [
      "PDF and CSV supported today",
      "Parsing and text extraction run server-side",
      "Documents are stored with the project, not pooled",
    ],
  },
  {
    n: "03",
    title: "Analyze",
    who: "Automated",
    body: "Deterministic rules compare directed and performed work against what was papered, executed and billed. No generative guesswork.",
    detail: [
      "Same inputs produce the same findings",
      "Each rule records why it fired",
      "Failures are surfaced, not silently skipped",
    ],
  },
  {
    n: "04",
    title: "Review evidence-backed findings",
    who: "Project executive",
    body: "Each finding names its category, confidence, estimated value and the exact pages or rows behind it. Open the evidence before accepting anything.",
    detail: [
      "Potential scope changes and documentation gaps",
      "Source excerpt with document, page or row locator",
      "Nothing is filed or submitted on your behalf",
    ],
  },
  {
    n: "05",
    title: "Classify, assign, resolve or dismiss",
    who: "Project executive and PM",
    body: "Put an owner and a due outcome on what is real. Dismiss what isn't, with a reason that stays on the record.",
    detail: [
      "Assignment requires a named owner",
      "Resolution and dismissal require a note",
      "Every state change is written to the audit trail",
    ],
  },
  {
    n: "06",
    title: "Export the action register",
    who: "Controller",
    body: "A CSV register of every finding, its state, owner, value and evidence count — the working document for the closeout meeting.",
    detail: ["Import into your PM or accounting system", "Defensible reference back to source"],
  },
];

function WorkflowPage() {
  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Workflow"
        title="One pass over the project record, six steps, one register."
        lede="ChangeOrder Radar is not a project management system and does not replace one. It runs once against the record you already have, before final payment closes the argument."
      />

      <section className="mx-auto max-w-6xl px-4 py-12">
        <ol className="space-y-px overflow-hidden rounded-sm border border-border bg-border">
          {STAGES.map((stage) => (
            <li key={stage.n} className="bg-surface-raised">
              <div className="grid gap-4 p-5 sm:grid-cols-[auto_1fr_1fr] sm:gap-6">
                <p className="numeric text-sm text-primary">{stage.n}</p>
                <div>
                  <h2 className="text-base font-semibold">{stage.title}</h2>
                  <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">
                    {stage.who}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">{stage.body}</p>
                </div>
                <ul className="space-y-1.5 text-sm text-muted-foreground sm:border-l sm:border-border sm:pl-6">
                  {stage.detail.map((d) => (
                    <li key={d} className="flex gap-2">
                      <span
                        className="mt-2 size-1 shrink-0 rounded-full bg-border-strong"
                        aria-hidden
                      />
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ol>

        <div className="panel mt-8 p-5">
          <div className="flex flex-wrap items-center gap-3">
            <StatusPill tone="success">Live</StatusPill>
            <p className="text-sm text-muted-foreground">
              Document upload and PDF/CSV analysis are live today. System-to-system integrations are
              planned and clearly labelled as such.
            </p>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/request-access">Request private beta</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/signin">Sign in</Link>
            </Button>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
