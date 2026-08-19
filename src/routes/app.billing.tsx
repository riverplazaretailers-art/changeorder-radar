import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { AppShell } from "@/components/app-shell";
import { ErrorState, LoadingState } from "@/components/states";
import { StatusPill } from "@/components/status-pill";
import { billing, formatMoney, PLANS } from "@/lib/billing";
import { analytics } from "@/lib/analytics";
import { useSession } from "@/lib/session";
import { formatDate } from "@/lib/display";

export const Route = createFileRoute("/app/billing")({
  component: BillingPage,
});

function BillingPage() {
  const { user } = useSession();
  const queryClient = useQueryClient();

  const account = useQuery({ queryKey: ["billing"], queryFn: () => billing.getAccount() });
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["billing"] });

  return (
    <AppShell
      title="Account & billing"
      description="Plan, usage window and payment state. No payment processor is embedded in this app."
    >
      {account.isPending ? (
        <LoadingState label="Loading billing" rows={3} />
      ) : account.isError ? (
        <ErrorState error={account.error} onRetry={() => account.refetch()} />
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="panel p-4">
              <p className="eyebrow">Plan</p>
              <p className="mt-2 text-lg font-semibold">{account.data.planName}</p>
              <p className="text-xs text-muted-foreground">
                {PLANS.find((p) => p.id === account.data.planId)?.priceCopy}
              </p>
            </div>
            <div className="panel p-4">
              <p className="eyebrow">Trial</p>
              <div className="mt-2">
                <StatusPill tone={account.data.trialState === "active" ? "info" : "neutral"}>
                  {account.data.trialState}
                </StatusPill>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {account.data.trialEndsAt
                  ? `Ends ${formatDate(account.data.trialEndsAt)}`
                  : "No trial window"}
              </p>
            </div>
            <div className="panel p-4">
              <p className="eyebrow">Payment</p>
              <div className="mt-2">
                <StatusPill
                  tone={
                    account.data.paymentState === "past_due"
                      ? "danger"
                      : account.data.paymentState === "current"
                        ? "success"
                        : "neutral"
                  }
                >
                  {account.data.paymentState.replace("_", " ")}
                </StatusPill>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                MRR {formatMoney(account.data.mrrCents, account.data.currency)}
              </p>
            </div>
          </div>

          <section className="panel overflow-x-auto">
            <div className="border-b border-border px-4 py-3">
              <h2 className="text-sm font-semibold">
                Usage · {formatDate(account.data.usage.periodStart)} –{" "}
                {formatDate(account.data.usage.periodEnd)}
              </h2>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th scope="col">Metric</th>
                  <th scope="col" className="text-right">Used</th>
                  <th scope="col" className="text-right">Included</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="font-medium">Projects analyzed</td>
                  <td className="numeric text-right">{account.data.usage.projectsAnalyzed}</td>
                  <td className="numeric text-right">
                    {account.data.usage.includedProjects ?? "—"}
                  </td>
                </tr>
                <tr>
                  <td className="font-medium">Documents parsed</td>
                  <td className="numeric text-right">{account.data.usage.documentsParsed}</td>
                  <td className="numeric text-right">—</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section className="grid gap-4 md:grid-cols-3">
            {PLANS.map((plan) => {
              const current = plan.id === account.data.planId;
              return (
                <div key={plan.id} className="panel flex flex-col p-5">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold">{plan.name}</h3>
                    {current ? <StatusPill tone="accent">Current</StatusPill> : null}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{plan.priceCopy}</p>
                  <p className="text-xs text-muted-foreground">{plan.cadenceCopy}</p>
                  <ul className="mt-4 flex-1 space-y-1.5 text-sm text-muted-foreground">
                    {plan.features.map((feature) => (
                      <li key={feature}>· {feature}</li>
                    ))}
                  </ul>
                  <Button
                    className="mt-4"
                    variant={current ? "outline" : "default"}
                    disabled={current}
                    onClick={async () => {
                      await billing.requestPlanChange(plan.id);
                      analytics.track("converted_to_paid", { plan: plan.id, requested: true });
                      await refresh();
                    }}
                  >
                    {current ? "Current plan" : plan.ctaLabel}
                  </Button>
                </div>
              );
            })}
          </section>

          <div className="panel flex flex-wrap items-center justify-between gap-3 p-4">
            <p className="max-w-prose text-sm text-muted-foreground">
              Cancellation takes effect at the end of the current window. Exported action registers
              remain available for 30 days.
            </p>
            <Button
              variant="outline"
              size="sm"
              disabled={account.data.paymentState === "cancelled"}
              onClick={async () => {
                await billing.cancelSubscription("user_requested");
                analytics.track("subscription_cancelled", { channel: "self_serve" });
                await refresh();
              }}
            >
              {account.data.paymentState === "cancelled"
                ? "Cancellation requested"
                : "Request cancellation"}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            Signed in as {user?.email} · billing provider: {billing.id}
          </p>
        </div>
      )}
    </AppShell>
  );
}
