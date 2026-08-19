import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { PageHeader, SiteLayout } from "@/components/site-chrome";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — ChangeOrder Radar" },
      {
        name: "description",
        content:
          "Answers on document types, detection method, evidence, data handling, roles and what ChangeOrder Radar deliberately does not do.",
      },
      { property: "og:title", content: "FAQ — ChangeOrder Radar" },
      {
        property: "og:description",
        content: "Common questions from contractor owners, project executives and controllers.",
      },
    ],
  }),
  component: FaqPage,
});

const FAQS = [
  {
    q: "What documents do I need to upload?",
    a: "At minimum the prime contract and the executed change orders. Findings improve substantially when you also include daily logs, owner correspondence, field notes and pay applications, because that is where directed work first appears.",
  },
  {
    q: "Is this a language model guessing at my contract?",
    a: "No. Detection is deterministic rule-based analysis run in the ChangeOrder Radar service. The same document set produces the same findings every time, and each finding records which rule fired and why.",
  },
  {
    q: "How do I know a finding is real?",
    a: "Every finding carries its evidence: the source document, the page or CSV row, and the excerpt. You review the source before accepting anything. Findings you disagree with are dismissed with a reason that stays on the audit trail.",
  },
  {
    q: "Does it submit change orders or claims for me?",
    a: "No. ChangeOrder Radar produces an action register. Deciding what to pursue, and how, stays with your project executive and your counsel.",
  },
  {
    q: "What file formats are supported?",
    a: "PDF and CSV today, including scanned PDFs within the service's page budget. Direct integrations with project management and accounting systems are planned, not live.",
  },
  {
    q: "Who on my team should use it?",
    a: "A project manager or engineer uploads the record. A project executive reviews and classifies findings. A controller exports the action register and tracks it to closeout. Roles control who can change finding state.",
  },
  {
    q: "Where do our documents live?",
    a: "Documents and extracted evidence stay in the ChangeOrder Radar service, scoped to your account and project. They are not pooled across customers and are not used to train anything.",
  },
  {
    q: "What does it deliberately not do?",
    a: "It is not a project management system, a document management system, a scheduling tool or a claims service. It runs one focused review over a record you already have.",
  },
  {
    q: "How long does an analysis take?",
    a: "Minutes for a typical project record. Large scanned document sets take longer, and the run status is visible while it works. Failures are reported with a reason rather than silently dropped.",
  },
];

function FaqPage() {
  return (
    <SiteLayout>
      <PageHeader
        eyebrow="FAQ"
        title="Direct answers, including the unflattering ones."
        lede="If something is not built yet, this page says so."
      />
      <section className="mx-auto max-w-3xl px-4 py-12">
        <Accordion type="single" collapsible className="rounded-sm border border-border">
          {FAQS.map((item, i) => (
            <AccordionItem key={item.q} value={`item-${i}`} className="px-4 last:border-b-0">
              <AccordionTrigger className="text-left text-sm font-semibold">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="panel mt-8 flex flex-wrap items-center justify-between gap-4 p-5">
          <p className="text-sm text-muted-foreground">Question not answered here?</p>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link to="/help">Help</Link>
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
