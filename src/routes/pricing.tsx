import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, SiteLayout } from "@/components/site-chrome";
import { StatusPill } from "@/components/status-pill";
import { PLANS } from "@/lib/billing";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — ChangeOrder Radar private beta" },
      {
        name: "description",
        content:
          "ChangeOrder Radar is in private beta. Pilot, Team and Enterprise plans are scoped per engagement; pricing is set at private beta close.",
      },
      { property: "og:title", content: "Pricing — ChangeOrder Radar" },
      {
        property: "og:description",
        content: "Plan structure for the ChangeOrder Radar private beta.",
      },
    ],
  }),
  component: PricingPage,
});

function PricingPage() {
  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Pricing"
        title="Private beta. Priced per engagement, not per seat guess."
        lede="We are not publishing a price we would have to walk back. Plan structure is below; the commercial terms are agreed when a pilot is scoped."
      />

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-4 lg:grid-cols-3">
          {PLANS.map((plan) => (
            <article
              key={plan.id}
              className={
                plan.highlighted
                  ? "panel border-primary/40 p-5 ring-1 ring-primary/20"
                  : "panel p-5"
              }
            >
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-base font-semibold">{plan.name}</h2>
                {plan.highlighted ? <StatusPill tone="accent">Most requested</StatusPill> : null}
              </div>
              <p className="mt-3 text-lg font-semibold tracking-tight">{plan.priceCopy}</p>
              <p className="text-xs text-muted-foreground">{plan.cadenceCopy}</p>
              <p className="mt-3 text-sm text-muted-foreground">{plan.summary}</p>
              <ul className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                asChild
                className="mt-5 w-full"
                variant={plan.highlighted ? "default" : "outline"}
              >
                <Link to="/request-access">{plan.ctaLabel}</Link>
              </Button>
            </article>
          ))}
        </div>

        <div className="panel mt-8 p-5">
          <h2 className="text-sm font-semibold">What we will tell you before you commit</h2>
          <ul className="mt-3 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
            {[
              "Exactly which document types we can parse today.",
              "What the analysis does and does not detect.",
              "Where your documents are stored and for how long.",
              "What happens to your data if you stop using the product.",
            ].map((item) => (
              <li key={item} className="flex gap-2">
                <span className="mt-2 size-1 shrink-0 rounded-full bg-border-strong" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </SiteLayout>
  );
}
