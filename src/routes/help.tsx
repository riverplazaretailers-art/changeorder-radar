import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { PageHeader, SiteLayout } from "@/components/site-chrome";

export const Route = createFileRoute("/help")({
  head: () => ({
    meta: [
      { title: "Help — ChangeOrder Radar" },
      {
        name: "description",
        content:
          "Getting started guidance, document preparation tips, troubleshooting failed analyses and how to reach the ChangeOrder Radar team.",
      },
      { property: "og:title", content: "Help — ChangeOrder Radar" },
      {
        property: "og:description",
        content: "Document preparation, troubleshooting and support for ChangeOrder Radar.",
      },
    ],
  }),
  component: HelpPage,
});

const SECTIONS = [
  {
    title: "Preparing documents",
    items: [
      "Export change orders as a single PDF packet including signature pages.",
      "Daily logs work best as CSV with one row per crew per day.",
      "Include the full correspondence thread, not just the final message.",
      "Pay applications as CSV give the cleanest billed-value comparison.",
    ],
  },
  {
    title: "If an analysis fails",
    items: [
      "Check the run reason on the project page — most failures name the document.",
      "Scanned PDFs above the OCR page budget need splitting before re-upload.",
      "Password-protected PDFs must be unlocked before upload.",
      "Re-running analysis does not duplicate existing findings.",
    ],
  },
  {
    title: "Reviewing findings well",
    items: [
      "Open the evidence before accepting or dismissing anything.",
      "Assign to the person who can produce the missing document, not the reviewer.",
      "Dismissals need a reason — future you will want it.",
      "Export the action register before the closeout meeting, not after.",
    ],
  },
];

function HelpPage() {
  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Help"
        title="Getting a clean result out of a messy project record."
        lede="Most of the value comes from what you upload. These notes cover the rest."
      />
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-4 lg:grid-cols-3">
          {SECTIONS.map((section) => (
            <article key={section.title} className="panel p-5">
              <h2 className="text-sm font-semibold">{section.title}</h2>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {section.items.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-2 size-1 shrink-0 rounded-full bg-border-strong" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <div className="panel mt-8 flex flex-wrap items-center justify-between gap-4 p-5">
          <div>
            <h2 className="text-sm font-semibold">Still stuck?</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Private beta accounts have a named contact. Include the project reference and the run
              time when you write in.
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link to="/faq">Read the FAQ</Link>
            </Button>
            <Button asChild>
              <Link to="/request-access">Request private beta</Link>
            </Button>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
