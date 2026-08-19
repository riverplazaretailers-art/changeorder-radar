import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { PageHeader, SiteLayout } from "@/components/site-chrome";
import { IntegrationStatusPill } from "@/components/status-pill";
import { EmptyState, ErrorState, LoadingState } from "@/components/states";
import { getProductApi } from "@/lib/product-api";

export const Route = createFileRoute("/integrations")({
  head: () => ({
    meta: [
      { title: "Integrations — ChangeOrder Radar" },
      {
        name: "description",
        content:
          "File upload with PDF and CSV analysis is live. Project management and accounting integrations are labelled Live, Pilot or Planned — no overstated claims.",
      },
      { property: "og:title", content: "Integrations — ChangeOrder Radar" },
      {
        property: "og:description",
        content:
          "Honest integration status: what is live today, what is in pilot, and what is planned.",
      },
    ],
  }),
  component: IntegrationsPage,
});

function IntegrationsPage() {
  const api = getProductApi();
  const query = useQuery({
    queryKey: ["integrations"],
    queryFn: () => api.listIntegrations(),
  });

  const grouped = (query.data ?? []).reduce<Record<string, typeof query.data>>((acc, item) => {
    (acc[item.category] ??= [])!.push(item);
    return acc;
  }, {});

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Integrations"
        title="What is connected today, stated plainly."
        lede="We label every integration Live, Pilot or Planned. Nothing is described as available until it works in production and has been tested."
      />

      <section className="mx-auto max-w-6xl px-4 py-12">
        <dl className="mb-8 grid gap-4 sm:grid-cols-3">
          {[
            ["Live", "Working in production for beta accounts today."],
            ["Pilot", "Running with a limited set of accounts under active validation."],
            ["Planned", "On the roadmap. Not built, not connectable, not promised by date."],
          ].map(([term, def]) => (
            <div key={term} className="panel p-4">
              <dt className="text-sm font-semibold">{term}</dt>
              <dd className="mt-1 text-sm text-muted-foreground">{def}</dd>
            </div>
          ))}
        </dl>

        {query.isPending ? <LoadingState label="Loading integrations" /> : null}
        {query.isError ? <ErrorState error={query.error} onRetry={() => query.refetch()} /> : null}
        {query.isSuccess && query.data.length === 0 ? (
          <EmptyState title="No integrations published yet" />
        ) : null}

        {query.isSuccess && query.data.length > 0 ? (
          <div className="space-y-8">
            {Object.entries(grouped).map(([category, items]) => (
              <div key={category}>
                <h2 className="text-sm font-semibold">{category}</h2>
                <div className="mt-3 overflow-x-auto rounded-sm border border-border">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th scope="col">Integration</th>
                        <th scope="col">What it does</th>
                        <th scope="col">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(items ?? []).map((item) => (
                        <tr key={item.id}>
                          <td className="font-medium">{item.name}</td>
                          <td className="text-muted-foreground">{item.description}</td>
                          <td>
                            <IntegrationStatusPill status={item.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        <div className="panel mt-10 flex flex-wrap items-center justify-between gap-4 p-5">
          <p className="max-w-xl text-sm text-muted-foreground">
            Need a specific system connected before you can run a pilot? Tell us which one and what
            records it holds — integration order is set by beta demand.
          </p>
          <Button asChild>
            <Link to="/request-access">Request private beta</Link>
          </Button>
        </div>
      </section>
    </SiteLayout>
  );
}
