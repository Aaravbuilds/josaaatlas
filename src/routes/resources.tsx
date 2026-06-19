import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";

export const Route = createFileRoute("/resources")({
  head: () => ({
    meta: [
      { title: "JoSAA Resources — JoSAA Atlas" },
      { name: "description", content: "Understand the JoSAA counseling process, rounds, quotas and seat allocation." },
    ],
  }),
  component: () => (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <h1 className="font-display text-4xl font-semibold">Resources</h1>
        <p className="mt-3 text-muted-foreground">
          A short, practical guide to JoSAA counseling. Detailed articles coming soon.
        </p>

        <div className="mt-10 space-y-8">
          {SECTIONS.map((s) => (
            <article key={s.title} className="rounded-2xl border border-border bg-card p-6">
              <h2 className="font-display text-2xl font-semibold">{s.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
            </article>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-primary/20 bg-primary/5 p-6">
          <h3 className="font-display text-xl font-semibold">Ready to predict?</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Use our predictor on official JoSAA 2025 data to discover your real options.
          </p>
          <Link
            to="/predictor"
            className="mt-4 inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Open Predictor
          </Link>
        </div>
      </div>
    </SiteLayout>
  ),
});

const SECTIONS = [
  {
    title: "What is JoSAA?",
    body: "The Joint Seat Allocation Authority (JoSAA) conducts joint counseling for 128 institutes — IITs, NITs, IIITs and other GFTIs — based on JEE Main / JEE Advanced ranks. Allocation happens over six rounds.",
  },
  {
    title: "Opening & Closing Ranks",
    body: "For each institute–program–category combination, the opening rank is the best rank that accepted a seat in that round; the closing rank is the last (worst) rank that received an allotment.",
  },
  {
    title: "Quotas (AI, HS, OS, GO, JK, LA)",
    body: "NITs reserve seats for Home State (HS) and Other State (OS) candidates. IITs use All India (AI) only. GO/JK/LA are special quotas. Our predictor automatically applies the right pool based on your home state.",
  },
  {
    title: "Categories",
    body: "Categories include OPEN, OBC-NCL, EWS, SC, ST, plus PwD variants. Use your category rank — not your general rank — when predicting.",
  },
];
