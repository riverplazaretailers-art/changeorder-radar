import { createFileRoute, Link } from "@tanstack/react-router";
import { FileLock2, KeyRound, ScrollText, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, SiteLayout } from "@/components/site-chrome";
import { StatusPill } from "@/components/status-pill";

export const Route = createFileRoute("/security")({
  head: () => ({
    meta: [
      { title: "Security and trust — ChangeOrder Radar" },
      {
        name: "description",
        content:
          "How ChangeOrder Radar handles contract documents: access control, evidence lineage, audit events, retention and deletion. Stated without overclaiming certifications.",
      },
      { property: "og:title", content: "Security and trust — ChangeOrder Radar" },
      {
        property: "og:description",
        content: "Data handling, access control, audit trail and retention for project documents.",
      },
    ],
  }),
  component: SecurityPage,
});

const PILLARS = [
  {
    icon: FileLock2,
    title: "Your documents stay yours",
    body: "Uploaded documents and extracted evidence are scoped to your account and the project they belong to. They are not pooled with other customers and are not used to train models.",
  },
  {
    icon: KeyRound,
    title: "Role-based access",
    body: "Owner, manager and viewer roles control who can upload, who can change finding state, and who can only read. Permission failures are explicit, not silent.",
  },
  {
    icon: ScrollText,
    title: "Audit trail and evidence lineage",
    body: "Every finding traces back to a document, page or row. Every assignment, resolution and dismissal is written to an immutable audit event with actor and timestamp.",
  },
  {
    icon: Trash2,
    title: "Retention and deletion",
    body: "Retention windows are agreed per account. On request we delete project documents and derived evidence, and confirm what was removed.",
  },
];

function SecurityPage() {
  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Security and trust"
        title="Contract documents are sensitive. We treat them that way."
        lede="This page describes what is true today. Where a control is in progress, it is labelled in progress rather than claimed."
      />

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-px overflow-hidden rounded-sm border border-border bg-border sm:grid-cols-2">
          {PILLARS.map((p) => (
            <article key={p.title} className="bg-surface-raised p-5">
              <p.icon className="size-4 text-primary" aria-hidden />
              <h2 className="mt-3 text-base font-semibold">{p.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{p.body}</p>
            </article>
          ))}
        </div>

        <h2 className="mt-10 text-sm font-semibold">Control status</h2>
        <div className="mt-3 overflow-x-auto rounded-sm border border-border">
          <table className="data-table">
            <thead>
              <tr>
                <th scope="col">Control</th>
                <th scope="col">Detail</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Encryption in transit", "TLS on all API and upload traffic.", "live"],
                ["Encryption at rest", "Document and evidence storage encrypted at rest.", "live"],
                ["Per-account isolation", "Projects, documents and evidence scoped by account.", "live"],
                ["Audit events", "Actor, action and timestamp on every state change.", "live"],
                ["Role-based access control", "Owner, manager and viewer roles.", "live"],
                ["Single sign-on", "SSO for enterprise accounts.", "planned"],
                ["Third-party penetration test", "Independent assessment.", "planned"],
                ["SOC 2 Type II", "Not held today. We will not claim otherwise.", "planned"],
              ].map(([control, detail, status]) => (
                <tr key={control}>
                  <td className="font-medium">{control}</td>
                  <td className="text-muted-foreground">{detail}</td>
                  <td>
                    {status === "live" ? (
                      <StatusPill tone="success">Live</StatusPill>
                    ) : (
                      <StatusPill tone="neutral">Planned</StatusPill>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="panel mt-8 flex flex-wrap items-center justify-between gap-4 p-5">
          <p className="max-w-xl text-sm text-muted-foreground">
            Security review required before a pilot? Ask for the data handling summary and the
            retention terms up front.
          </p>
          <Button asChild>
            <Link to="/request-access">Request private beta</Link>
          </Button>
        </div>
      </section>
    </SiteLayout>
  );
}
