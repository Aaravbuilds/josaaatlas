import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/faqs")({
  head: () => ({
    meta: [
      { title: "FAQs — JoSAA Atlas" },
      { name: "description", content: "Frequently asked questions about JoSAA counseling, cutoffs and our predictor." },
    ],
  }),
  component: () => (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <h1 className="font-display text-4xl font-semibold">Frequently Asked Questions</h1>
        <p className="mt-3 text-muted-foreground">Everything you need to know about JoSAA Atlas.</p>

        <Accordion type="single" collapsible className="mt-8 divide-y divide-border rounded-2xl border border-border bg-card px-2">
          {FAQS.map((f, i) => (
            <AccordionItem key={i} value={`f-${i}`} className="border-0 px-4">
              <AccordionTrigger className="text-left text-base font-medium">{f.q}</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </SiteLayout>
  ),
});

const FAQS = [
  { q: "Where does the data come from?", a: "All cutoffs are imported directly from the official JoSAA 2025 results — 72,000+ rows across all six rounds and every category." },
  { q: "How accurate is the predictor?", a: "We compare your category rank against the actual closing rank from your selected round and category. Predictions reflect historical trends, not guaranteed outcomes." },
  { q: "Does it support PwD categories?", a: "Yes. Select your exact seat type (e.g. OBC-NCL (PwD)) on the predictor — we filter cutoffs to match it precisely." },
  { q: "How are Home State and Other State handled?", a: "For NITs we automatically apply the HS quota for institutes in your home state and OS elsewhere. IITs use the All-India pool." },
  { q: "Can I export my predictions?", a: "Yes — use the Export button on the predictor or cutoff explorer to download a CSV of the visible rows." },
  { q: "Is data for JoSAA 2026 coming?", a: "Yes. The platform is built to ingest each year's results as soon as they are published." },
];
