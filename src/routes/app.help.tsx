import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";

export const Route = createFileRoute("/app/help")({
  component: AppHelpPage,
});

const STEPS = [
  {
    title: "Get the record complete before you analyze",
    body: "Upload the executed contract and every change order first, then daily logs, field notes, emails and pay applications. Findings are only as good as the record they were derived from.",
  },
  {
    title: "Work findings by value, not by order",
    body: "Sort the register by value at risk. High-confidence, high-value findings usually resolve into a change order request; documentation gaps usually resolve into a note or a signature request.",
  },
  {
    title: "Every decision needs a reason",
    body: "Resolving or dismissing a finding requires a note. That note is written to the audit trail and appears on the exported action register, which is what protects the decision later.",
  },
  {
    title: "Export before closeout",
    body: "The action register export is the handoff artifact for your project executive or controller. Export it while there is still contractual time to give notice.",
  },
];

function AppHelpPage() {
  return (
    <AppShell title="Help" description="How to run a review, and what to do when something fails.">
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-4">
          {STEPS.map((step) => (
            <section key={step.title} className="panel p-5">
              <h2 className="text-sm font-semibold">{step.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{step.body}</p>
            </section>
          ))}
        </div>
        <aside className="panel h-fit p-5 text-sm">
          <h2 className="text-sm font-semibold">When a document is rejected</h2>
          <p className="mt-2 text-muted-foreground">
            Scanned pages without a text layer and password-protected PDFs cannot be parsed.
            Re-export the file with text, or upload the source CSV. Failures are listed under
            Operations.
          </p>
          <h2 className="mt-5 text-sm font-semibold">Still stuck?</h2>
          <p className="mt-2 text-muted-foreground">
            Private beta accounts have a named contact. See the{" "}
            <Link to="/security" className="text-primary hover:underline">
              security and trust
            </Link>{" "}
            page for data handling questions.
          </p>
        </aside>
      </div>
    </AppShell>
  );
}
