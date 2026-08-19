import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, FileSearch, ClipboardList, ScrollText, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteLayout } from "@/components/site-chrome";
import { WorkspaceCta } from "@/components/workspace-cta";
import { StatusPill } from "@/components/status-pill";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ChangeOrder Radar — Find billable scope changes before closeout" },
      {
        name: "description",
        content:
          "ChangeOrder Radar reviews contracts, change orders, daily logs, emails and invoices to surface billable scope changes and missing documentation before a project closes.",
      },
      {
        property: "og:title",
        content: "ChangeOrder Radar — Find billable scope changes before closeout",
      },
      {
        property: "og:description",
        content:
          "Evidence-backed review of the project record for specialty contractors. Find scope changes and documentation gaps while they are still collectible.",
      },
    ],
  }),
  component: LandingPage,
});

const CONSEQUENCES = [
  {
    stat: "Closeout",
    title: "The deadline is contractual, not negotiable",
    body: "Most contracts bar claims for work not documented and noticed within a defined window. After final payment the argument is over regardless of who was right.",
  },
  {
    stat: "Verbal",
    title: "Direction arrives faster than paperwork",
    body: "Field crews do what the owner's rep asks. The daily log records the hours. Nobody writes the change order, and the cost lands in your labor variance.",
  },
  {
    stat: "Volume",
    title: "The record is too large to read twice",
    body: "A mid-size project produces thousands of log lines, email threads, RFIs and pay application rows. Nobody re-reads it before signing the final release.",
  },
];

const STEPS = [
  {
    icon: ClipboardList,
    title: "Create the project",
    body: "Name the job, the client and the contract reference. Nothing else to configure.",
  },
  {
    icon: ScrollText,
    title: "Upload the record",
    body: "Contract, change orders, daily logs, emails, field notes and invoices — PDF and CSV.",
  },
  {
    icon: FileSearch,
    title: "Analyze",
    body: "Deterministic rules compare directed work against executed and billed change orders.",
  },
  {
    icon: Scale,
    title: "Review and act",
    body: "Every finding cites its source. Assign, resolve or dismiss, then export the action register.",
  },
];

function LandingPage() {
  return (
    <SiteLayout>
      <section className="border-b border-border bg-surface-raised">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 lg:grid-cols-[1.05fr_0.95fr] lg:py-16">
          <div>
            <StatusPill tone="accent">Private beta</StatusPill>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-[2.75rem] lg:leading-[1.08]">
              Work you already performed is sitting unbilled in your own project record.
            </h1>
            <p className="mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
              ChangeOrder Radar reads the contract, change orders, daily logs, correspondence and
              invoices for a job and reports where directed scope was never papered, never signed,
              or never billed — while the closeout window is still open.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/request-access">
                  Request private beta
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              </Button>
              <WorkspaceCta path="/sign-in" label="Open the secure workspace" variant="outline" />
              <Button asChild size="lg" variant="outline">
                <Link to="/workflow">See the workflow</Link>
              </Button>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Built for specialty contractor owners, project executives, project managers and
              controllers.
            </p>
          </div>

          <div className="panel overflow-hidden self-start">
            <div className="flex items-center justify-between border-b border-border bg-surface-sunken px-4 py-2.5">
              <p className="text-xs font-semibold">Findings register — illustrative example</p>
              <StatusPill tone="warning" dot={false}>
                Synthetic
              </StatusPill>
            </div>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th scope="col">Ref</th>
                    <th scope="col">Finding</th>
                    <th scope="col">Evidence</th>
                    <th scope="col" className="text-right">
                      Value
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["CR-001", "Duct reroute on verbal direction", "3 sources", "$41,200"],
                    ["CR-002", "Executed CO 03 never billed", "2 sources", "$28,640"],
                    ["CR-003", "CO 04 signature page missing", "1 source", "$17,500"],
                    ["CR-004", "Acceleration during owner delay", "1 source", "$9,800"],
                  ].map(([ref, title, ev, amount]) => (
                    <tr key={ref}>
                      <td className="numeric text-xs">{ref}</td>
                      <td className="font-medium">{title}</td>
                      <td className="text-muted-foreground">{ev}</td>
                      <td className="numeric text-right">{amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="border-t border-border bg-surface-sunken px-4 py-2 text-xs text-muted-foreground">
              Example data for illustration only. Not a customer result.
            </p>
          </div>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <p className="eyebrow">Why it costs money</p>
          <h2 className="mt-2 max-w-2xl text-2xl font-semibold tracking-tight">
            The scope changed. The documentation didn&apos;t keep up.
          </h2>
          <div className="mt-8 grid gap-px overflow-hidden rounded-sm border border-border bg-border sm:grid-cols-3">
            {CONSEQUENCES.map((item) => (
              <article key={item.title} className="bg-surface-raised p-5">
                <p className="eyebrow text-primary">{item.stat}</p>
                <h3 className="mt-2 text-base font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-surface-sunken">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <p className="eyebrow">The solution</p>
          <h2 className="mt-2 max-w-2xl text-2xl font-semibold tracking-tight">
            One pass over the project record, before you sign the release.
          </h2>
          <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, index) => (
              <li key={step.title} className="panel p-5">
                <div className="flex items-center gap-2">
                  <span className="numeric text-xs text-muted-foreground">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <step.icon className="size-4 text-primary" aria-hidden />
                </div>
                <h3 className="mt-3 text-sm font-semibold">{step.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 lg:grid-cols-2">
          <div>
            <p className="eyebrow">Proof standard</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">
              Every finding cites the document it came from.
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              ChangeOrder Radar does not produce opinions. Each finding names the rule that fired,
              the documents involved, and the exact page, row or excerpt behind it, so a project
              executive can accept or reject it in seconds and a controller can defend it later.
            </p>
            <ul className="mt-5 space-y-2.5 text-sm">
              {[
                "Deterministic rules, not guesswork — the same record produces the same findings.",
                "Full evidence lineage from finding back to source page or CSV row.",
                "Audit trail on every assignment, resolution and dismissal.",
                "You decide what is real. Nothing is submitted anywhere on your behalf.",
              ].map((line) => (
                <li key={line} className="flex gap-2.5">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
                  <span className="text-muted-foreground">{line}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="panel p-5">
            <p className="eyebrow">Technology and integrations</p>
            <dl className="mt-4 space-y-4 text-sm">
              <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
                <div>
                  <dt className="font-medium">File upload intake — PDF and CSV</dt>
                  <dd className="mt-1 text-muted-foreground">
                    Parsing, evidence capture and analysis run in the ChangeOrder Radar service.
                  </dd>
                </div>
                <StatusPill tone="success">Live</StatusPill>
              </div>
              <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
                <div>
                  <dt className="font-medium">Project management systems</dt>
                  <dd className="mt-1 text-muted-foreground">
                    Procore, Autodesk Build — direct record sync.
                  </dd>
                </div>
                <StatusPill tone="neutral">Planned</StatusPill>
              </div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <dt className="font-medium">Accounting and job cost</dt>
                  <dd className="mt-1 text-muted-foreground">
                    Sage 300 CRE, QuickBooks — billed-value reconciliation.
                  </dd>
                </div>
                <StatusPill tone="neutral">Planned</StatusPill>
              </div>
            </dl>
            <Button asChild variant="outline" size="sm" className="mt-5">
              <Link to="/integrations">All integrations and status</Link>
            </Button>
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-5 px-4 py-12 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">
              Run it against one closing project.
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Private beta accounts are onboarded one project at a time.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/request-access">
                Request private beta
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
            <WorkspaceCta path="/sign-in" label="Open the secure workspace" variant="outline" />
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
