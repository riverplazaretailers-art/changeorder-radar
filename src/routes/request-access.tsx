import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader, SiteLayout } from "@/components/site-chrome";
import { SuccessState } from "@/components/states";
import { analytics } from "@/lib/analytics";

export const Route = createFileRoute("/request-access")({
  head: () => ({
    meta: [
      { title: "Request private beta — ChangeOrder Radar" },
      {
        name: "description",
        content:
          "Request a ChangeOrder Radar private beta account and run one closing project through an evidence-backed scope change review.",
      },
      { property: "og:title", content: "Request private beta — ChangeOrder Radar" },
      {
        property: "og:description",
        content: "Private beta accounts are onboarded one project at a time.",
      },
    ],
  }),
  component: RequestAccessPage,
});

const ROLES = [
  "Owner / principal",
  "Project executive",
  "Project manager",
  "Controller / finance",
  "Other",
];

function RequestAccessPage() {
  const [submitted, setSubmitted] = useState(false);
  const [role, setRole] = useState("");

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    // No document contents or financial values are captured on this form.
    analytics.track("account_created", { channel: "request_access", role_selected: Boolean(role) });
    setSubmitted(true);
  }

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Private beta"
        title="Run ChangeOrder Radar against one closing project."
        lede="Tell us about the job and who will review the findings. We onboard a small number of accounts at a time so each pilot gets attention."
      />

      <section className="mx-auto grid max-w-5xl gap-8 px-4 py-12 lg:grid-cols-[1.1fr_0.9fr]">
        {submitted ? (
          <SuccessState
            title="Request received"
            description="We will follow up by email to scope the pilot project and confirm document handling terms before any documents are shared."
            action={
              <Button asChild variant="outline" size="sm">
                <Link to="/">Back to overview</Link>
              </Button>
            }
          />
        ) : (
          <form onSubmit={handleSubmit} className="panel space-y-4 p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" required autoComplete="name" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Work email</Label>
                <Input id="email" name="email" type="email" required autoComplete="email" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="company">Company</Label>
                <Input id="company" name="company" required autoComplete="organization" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="role">Your role</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="project">The project you would run first</Label>
              <Textarea
                id="project"
                name="project"
                rows={4}
                placeholder="Trade, approximate contract value, how close it is to closeout, and what records exist."
              />
              <p className="text-xs text-muted-foreground">
                Do not paste contract text or financial line items here. We will agree document
                handling terms before anything is shared.
              </p>
            </div>

            <Button type="submit" className="w-full sm:w-auto">
              Request private beta
            </Button>
          </form>
        )}

        <aside className="panel h-fit p-5">
          <h2 className="text-sm font-semibold">What happens next</h2>
          <ol className="mt-3 space-y-3 text-sm text-muted-foreground">
            {[
              "A short call to confirm the project is a fit and the record is complete enough to analyze.",
              "Document handling, retention and deletion terms agreed in writing.",
              "Account provisioned. You upload the record and run the first analysis.",
              "A guided review of the findings with your project executive.",
            ].map((step, i) => (
              <li key={step} className="flex gap-3">
                <span className="numeric text-xs text-primary">{String(i + 1).padStart(2, "0")}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          <p className="mt-5 border-t border-border pt-4 text-xs text-muted-foreground">
            No pricing is committed at this stage and no documents are requested before terms are
            agreed.
          </p>
        </aside>
      </section>
    </SiteLayout>
  );
}
