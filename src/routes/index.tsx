import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import {
  ArrowRight,
  BookOpenCheck,
  ChevronDown,
  Layers,
  LineChart,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { INDIAN_STATES, SEAT_TYPES, GENDERS } from "@/lib/josaa/data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "JoSAA Atlas — Predict your colleges with official 2025 cutoffs" },
      {
        name: "description",
        content:
          "Predict the best NITs, IIITs and GFTIs with official JoSAA 2025 cutoff data — all rounds, all categories, instant filtering.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const navigate = useNavigate();
  const [exam, setExam] = useState<"main" | "advanced">("main");
  const [rank, setRank] = useState("");
  const [category, setCategory] = useState("OPEN");
  const [gender, setGender] = useState("Gender-Neutral");
  const [state, setState] = useState("Maharashtra");
  const predictorRef = useRef<HTMLFormElement>(null);
  const rankInputRef = useRef<HTMLInputElement>(null);

  const scrollToPredictor = () => {
    predictorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(() => rankInputRef.current?.focus({ preventScroll: true }), 500);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const r = parseInt(rank, 10);
    if (!r) return;
    navigate({
      to: "/predictor",
      search: { rank: r, category, gender, state, exam },
    });
  };

  return (
    <SiteLayout>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <BackgroundOrnament />
        <div className="mx-auto grid max-w-6xl gap-10 px-4 pb-16 pt-12 sm:px-6 md:grid-cols-[1fr_1.05fr] md:gap-14 md:pt-20">
          {/* Left: headline */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="relative z-10 flex flex-col justify-center"
          >
            <span className="chip border border-primary/15 bg-primary/5 text-primary">
              JoSAA 2025
            </span>
            <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.08] tracking-tight text-foreground sm:text-5xl md:text-6xl">
              Your Rank.
              <br />
              Your Choices.
              <br />
              <span className="text-primary">Your Future.</span>
            </h1>
            <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-muted-foreground sm:text-base">
              Explore JoSAA cutoffs, predict colleges, compare institutes, and
              build your perfect preference list.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Button
                size="lg"
                onClick={scrollToPredictor}
                className="h-12 px-6 text-base shadow-md"
              >
                <Target className="mr-2 h-4 w-4" />
                Predict My Colleges
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 px-5 text-base"
              >
                <Link to="/cutoffs">
                  <Search className="mr-2 h-4 w-4" />
                  Explore Cutoffs
                </Link>
              </Button>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                Official JoSAA 2025 data
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-primary" />
                Instant results
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                Free forever
              </span>
            </div>
          </motion.div>

          {/* Right: predictor card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
            className="relative z-10"
          >
            <form
              ref={predictorRef}
              id="predictor-form"
              onSubmit={submit}
              className="scroll-mt-24 rounded-2xl border border-border bg-card/95 p-5 shadow-[0_24px_48px_-24px_rgba(80,20,15,0.22)] ring-1 ring-primary/5 backdrop-blur sm:p-7"
            >
              <div className="flex items-center gap-2.5">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Target className="h-4 w-4" />
                </span>
                <h2 className="font-display text-xl font-semibold sm:text-2xl">
                  Predict Your Colleges
                </h2>
              </div>

              <div className="mt-5 space-y-4 sm:mt-6 sm:space-y-5">
                <div>
                  <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Counseling Exam
                  </Label>
                  <div className="mt-1.5 grid grid-cols-2 rounded-lg border border-border bg-background p-1">
                    {[
                      {
                        v: "main" as const,
                        label: "JEE Main",
                        sub: "NIT • IIIT • GFTI",
                      },
                      {
                        v: "advanced" as const,
                        label: "JEE Advanced",
                        sub: "IITs only",
                      },
                    ].map((opt) => {
                      const active = exam === opt.v;
                      return (
                        <button
                          type="button"
                          key={opt.v}
                          onClick={() => setExam(opt.v)}
                          className={
                            "rounded-md px-3 py-2 text-left transition-colors " +
                            (active
                              ? "bg-primary text-primary-foreground shadow-sm"
                              : "text-muted-foreground hover:text-foreground")
                          }
                        >
                          <div className="text-sm font-semibold leading-none">
                            {opt.label}
                          </div>
                          <div
                            className={
                              "mt-1 text-[10px] " +
                              (active ? "opacity-80" : "")
                            }
                          >
                            {opt.sub}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <Label
                    htmlFor="rank"
                    className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
                  >
                    {exam === "advanced" ? "JEE Advanced" : "JEE Main"} Rank (
                    {category === "OPEN" ? "CRL" : "Category"})
                  </Label>
                  <Input
                    ref={rankInputRef}
                    id="rank"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder={
                      exam === "advanced" ? "e.g. 1850" : "e.g. 5589"
                    }
                    value={rank}
                    onChange={(e) =>
                      setRank(e.target.value.replace(/\D/g, ""))
                    }
                    className="mt-1.5 h-11 bg-background text-base sm:h-12"
                    required
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
                  <div>
                    <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Category
                    </Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className="mt-1.5 h-11 bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SEAT_TYPES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Gender
                    </Label>
                    <div className="mt-1.5 grid grid-cols-2 rounded-lg border border-border bg-background p-1">
                      {GENDERS.map((g) => {
                        const active = gender === g;
                        const label = g.startsWith("Female")
                          ? "Female"
                          : "Male";
                        return (
                          <button
                            type="button"
                            key={g}
                            onClick={() => setGender(g)}
                            className={
                              "rounded-md px-3 py-2 text-sm font-medium transition-colors " +
                              (active
                                ? "bg-primary text-primary-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground")
                            }
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Home State
                  </Label>
                  <Select value={state} onValueChange={setState}>
                    <SelectTrigger className="mt-1.5 h-11 bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-72">
                      {INDIAN_STATES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="h-12 w-full text-base"
                >
                  <Target className="mr-2 h-4 w-4" />
                  Predict My Colleges
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      </section>

      {/* WHAT YOU CAN DO */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6 sm:pb-24">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="font-display text-2xl font-semibold sm:text-3xl">
            Everything You Need for JoSAA Counseling
          </h2>
        </motion.div>

        <div className="mt-8 grid gap-3 sm:mt-10 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              title: "Predict Colleges",
              body: "Find institutes based on your rank and category.",
              icon: <Target className="h-5 w-5" />,
              to: "/predictor",
            },
            {
              title: "Explore Cutoffs",
              body: "Search opening and closing ranks across all rounds.",
              icon: <Search className="h-5 w-5" />,
              to: "/cutoffs",
            },
            {
              title: "Compare Institutes",
              body: "Compare colleges, branches, and opportunities side-by-side.",
              icon: <TrendingUp className="h-5 w-5" />,
              to: "/colleges",
            },
            {
              title: "Build Preference Lists",
              body: "Create and manage your final counseling choices.",
              icon: <Layers className="h-5 w-5" />,
              to: "/dashboard",
            },
          ].map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
            >
              <Link
                to={card.to}
                className="group flex h-full flex-col rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg sm:p-6"
              >
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/8 text-primary ring-1 ring-primary/10 transition-colors group-hover:bg-primary/12">
                  {card.icon}
                </span>
                <h3 className="mt-4 font-display text-lg font-semibold">
                  {card.title}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {card.body}
                </p>
                <div className="mt-auto pt-4">
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                    Get started
                    <ChevronDown className="h-3.5 w-3.5 -rotate-90 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="border-y border-border bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="text-center">
            <span className="chip border border-primary/15 bg-primary/5 text-primary">
              How it works
            </span>
            <h2 className="mt-4 font-display text-2xl font-semibold sm:text-3xl">
              From rank to rank list — in 3 steps
            </h2>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-3">
            {[
              {
                n: "01",
                title: "Enter your rank",
                body: "Add your JEE Main or Advanced rank with category, gender, and home state.",
              },
              {
                n: "02",
                title: "See matched colleges",
                body: "We map your rank against official 2025 cutoffs across all rounds.",
              },
              {
                n: "03",
                title: "Save & shortlist",
                body: "Bookmark colleges, build preference lists, and export your final choices.",
              },
            ].map((s) => (
              <div
                key={s.n}
                className="rounded-2xl border border-border bg-card p-6"
              >
                <div className="font-display text-3xl font-semibold text-primary/30">
                  {s.n}
                </div>
                <h3 className="mt-3 font-display text-lg font-semibold">
                  {s.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {s.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY US */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: <ShieldCheck className="h-5 w-5" />,
              title: "Official 2025 data",
              body: "Every prediction is backed by verified JoSAA round-wise cutoffs.",
            },
            {
              icon: <LineChart className="h-5 w-5" />,
              title: "All rounds, all categories",
              body: "Round 1 through 6, every quota, seat type, and gender pool.",
            },
            {
              icon: <BookOpenCheck className="h-5 w-5" />,
              title: "Smart shortlists",
              body: "Group colleges into Dream / Target / Safe lists and export to CSV.",
            },
            {
              icon: <Zap className="h-5 w-5" />,
              title: "Instant filtering",
              body: "No waiting, no PDFs — filter 72K+ records in milliseconds.",
            },
            {
              icon: <Sparkles className="h-5 w-5" />,
              title: "Built for aspirants",
              body: "Designed end-to-end for JEE counseling — not a generic tool.",
            },
            {
              icon: <Layers className="h-5 w-5" />,
              title: "Preference lists",
              body: "Reorder choices, save drafts, and print a clean filling sheet.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="flex gap-3 rounded-xl border border-border bg-card p-5"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                {f.icon}
              </span>
              <div>
                <h3 className="font-semibold">{f.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {f.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6 sm:pb-24">
        <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/8 via-primary/4 to-transparent p-8 text-center sm:p-12">
          <h2 className="font-display text-2xl font-semibold sm:text-3xl">
            Ready to find your college?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
            Enter your rank and get a personalized list of matched institutes in
            seconds.
          </p>
          <Button
            size="lg"
            onClick={scrollToPredictor}
            className="mt-6 h-12 px-7 text-base shadow-md"
          >
            <Target className="mr-2 h-4 w-4" />
            Predict My Colleges
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </section>
    </SiteLayout>
  );
}

function BackgroundOrnament() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -right-24 top-0 h-[320px] w-[320px] rounded-full bg-gradient-to-br from-primary/6 to-transparent blur-3xl sm:h-[400px] sm:w-[400px]" />
      <div className="absolute -left-20 bottom-0 h-[280px] w-[280px] rounded-full bg-gradient-to-tr from-primary/5 to-transparent blur-3xl sm:h-[360px] sm:w-[360px]" />
    </div>
  );
}
