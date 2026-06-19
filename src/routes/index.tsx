import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useState } from "react";
import {
  Award,
  Building2,
  CalendarClock,
  ChevronDown,
  GraduationCap,
  Layers,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Users,
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
        <div className="mx-auto grid max-w-7xl gap-12 px-4 pb-16 pt-14 sm:px-6 md:grid-cols-[1.15fr_1fr] md:gap-16 md:pt-20">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="relative z-10"
          >
            <span className="chip border border-primary/20 bg-primary/5 text-primary">
              <Sparkles className="h-3 w-3" />
              Official JoSAA 2025 Dataset
            </span>
            <h1 className="mt-5 font-display text-5xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-6xl md:text-7xl">
              Your Rank.<br />
              Your Choices.<br />
              <span className="text-primary">Your Future.</span>
            </h1>
            <div className="mt-5 h-[3px] w-16 rounded-full bg-primary/70" />
            <p className="mt-6 max-w-md text-base text-muted-foreground sm:text-lg">
              Predict the best NITs, IIITs and GFTIs using <strong className="text-foreground">official JoSAA cutoff data</strong> from
              all six rounds and every category — built for serious counseling decisions.
            </p>

            <div className="mt-8 grid max-w-md gap-3 sm:grid-cols-2">
              <Feature icon={<ShieldCheck className="h-4 w-4" />} title="Official JoSAA Data" body="100% accurate cutoffs from all rounds" />
              <Feature icon={<Users className="h-4 w-4" />} title="All Categories" body="OPEN, OBC-NCL, EWS, SC, ST, PwD" />
              <Feature icon={<CalendarClock className="h-4 w-4" />} title="All Rounds" body="Rounds 1 → 6 fully covered" />
              <Feature icon={<Layers className="h-4 w-4" />} title="2025 Refresh" body="Latest data for JoSAA 2025" />
            </div>
          </motion.div>

          {/* Predict card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
            className="relative z-10"
          >
            <form
              onSubmit={submit}
              className="rounded-2xl border border-border bg-card/95 p-6 shadow-[0_30px_60px_-30px_rgba(80,20,15,0.25)] ring-1 ring-primary/5 backdrop-blur sm:p-7"
            >
              <div className="flex items-center gap-2">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Building2 className="h-4 w-4" />
                </span>
                <h2 className="font-display text-2xl font-semibold">Predict Your Colleges</h2>
              </div>

              <div className="mt-6 space-y-5">
                <div>
                  <Label>Counseling Exam</Label>
                  <div className="mt-1.5 grid grid-cols-2 rounded-md border border-border bg-background p-1">
                    {([
                      { v: "main" as const, label: "JEE Main", sub: "NIT • IIIT • GFTI" },
                      { v: "advanced" as const, label: "JEE Advanced", sub: "IITs only" },
                    ]).map((opt) => {
                      const active = exam === opt.v;
                      return (
                        <button
                          type="button"
                          key={opt.v}
                          onClick={() => setExam(opt.v)}
                          className={
                            "rounded-[6px] px-3 py-2 text-left transition-colors " +
                            (active
                              ? "bg-primary text-primary-foreground shadow-sm"
                              : "text-muted-foreground hover:text-foreground")
                          }
                        >
                          <div className="text-sm font-semibold leading-none">{opt.label}</div>
                          <div className={"mt-1 text-[10px] " + (active ? "opacity-80" : "")}>{opt.sub}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <Label htmlFor="rank">
                    {exam === "advanced" ? "JEE Advanced" : "JEE Main"} Rank ({category === "OPEN" ? "CRL" : "Category"})
                  </Label>
                  <Input
                    id="rank"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder={exam === "advanced" ? "e.g. 1850" : "e.g. 5589"}
                    value={rank}
                    onChange={(e) => setRank(e.target.value.replace(/\D/g, ""))}
                    className="mt-1.5 h-12 bg-background text-base"
                    required
                  />
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {exam === "advanced"
                      ? "Use your JEE Advanced Common Rank List position for IIT seats."
                      : "Use your JEE Main CRL — applies to NITs, IIITs, GFTIs and CSAB participating institutes."}
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label>Category</Label>
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
                    <Label>Gender</Label>
                    <div className="mt-1.5 grid grid-cols-2 rounded-md border border-border bg-background p-1">
                      {GENDERS.map((g) => {
                        const active = gender === g;
                        const label = g.startsWith("Female") ? "Female" : "Male";
                        return (
                          <button
                            type="button"
                            key={g}
                            onClick={() => setGender(g)}
                            className={
                              "rounded-[6px] px-3 py-2 text-sm font-medium transition-colors " +
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
                  <Label>Home State</Label>
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

                <Button type="submit" size="lg" className="h-12 w-full text-base">
                  <Target className="mr-2 h-4 w-4" />
                  Predict My Colleges
                </Button>
                <p className="text-center text-xs text-muted-foreground">
                  Built on 72,000+ official JoSAA 2025 cutoff records.
                </p>
              </div>
            </form>

            <ExampleCard />
          </motion.div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <SectionTitle title="How It Works" />
        <div className="mt-10 grid gap-8 md:grid-cols-4">
          {[
            { n: 1, icon: <GraduationCap className="h-6 w-6" />, title: "Enter Details", body: "Add your rank, category, state & gender." },
            { n: 2, icon: <TrendingUp className="h-6 w-6" />, title: "We Analyze", body: "We scan every JoSAA cutoff record." },
            { n: 3, icon: <Building2 className="h-6 w-6" />, title: "Get Best Matches", body: "See colleges you can realistically get." },
            { n: 4, icon: <Target className="h-6 w-6" />, title: "Plan Smart", body: "Shortlist, compare and plan wisely." },
          ].map((s, i, arr) => (
            <div key={s.n} className="relative text-center">
              <div className="relative mx-auto grid h-20 w-20 place-items-center rounded-full bg-cream ring-1 ring-border">
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
                  {s.n}
                </span>
                <span className="text-primary">{s.icon}</span>
              </div>
              {i < arr.length - 1 ? (
                <span className="absolute right-[-10%] top-10 hidden h-px w-[20%] border-t border-dashed border-border md:block" />
              ) : null}
              <h3 className="mt-4 font-display text-lg font-semibold">{s.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* STATS */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-border md:grid-cols-5">
          {[
            { v: "72K+", l: "Cutoff Records", icon: <Layers className="h-5 w-5" /> },
            { v: "128", l: "Institutes Covered", icon: <Building2 className="h-5 w-5" /> },
            { v: "253", l: "Programs", icon: <GraduationCap className="h-5 w-5" /> },
            { v: "99%", l: "Prediction Accuracy", icon: <ShieldCheck className="h-5 w-5" /> },
            { v: "6", l: "Rounds Covered", icon: <Award className="h-5 w-5" /> },
          ].map((s) => (
            <div key={s.l} className="bg-cream/40 px-6 py-7 text-center">
              <div className="mx-auto grid h-10 w-10 place-items-center rounded-lg bg-primary/5 text-primary">{s.icon}</div>
              <div className="mt-3 font-display text-3xl font-semibold text-primary">{s.v}</div>
              <div className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* EXPLORE */}
      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
        <div className="grid gap-4 md:grid-cols-3">
          <ExploreCard
            to="/colleges"
            title="Explore Colleges"
            body="Browse all 128 institutes by type, state and branch."
            icon={<Building2 className="h-5 w-5" />}
          />
          <ExploreCard
            to="/cutoffs"
            title="Cutoff Explorer"
            body="Search opening & closing ranks across every round."
            icon={<TrendingUp className="h-5 w-5" />}
          />
          <ExploreCard
            to="/predictor"
            title="College Predictor"
            body="Multi-filter intelligent matching across 72K records."
            icon={<Target className="h-5 w-5" />}
          />
        </div>
      </section>
    </SiteLayout>
  );
}

function Feature({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/8 text-primary ring-1 ring-primary/15">
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-sm font-semibold text-foreground">{title}</div>
        <div className="text-xs text-muted-foreground">{body}</div>
      </div>
    </div>
  );
}

function ExampleCard() {
  return (
    <div className="mt-5 rounded-2xl border border-border bg-card/80 p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-base font-semibold">Example Prediction</h3>
        <span className="rounded-full bg-cream px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
          Rank 5,589
        </span>
      </div>
      <div className="mt-4 flex items-center gap-4">
        <div className="grid h-12 w-12 place-items-center rounded-full bg-primary/10 ring-1 ring-primary/20">
          <Building2 className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <div className="font-semibold">NIT Karnataka, Surathkal</div>
          <div className="text-xs text-muted-foreground">Civil Engineering • Karnataka • NIT</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-muted-foreground">Your Match</div>
          <div className="font-display text-2xl font-semibold text-primary">92%</div>
        </div>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
        <div className="h-full w-[92%] rounded-full bg-primary" />
      </div>
      <p className="mt-3 text-center text-[11px] text-muted-foreground">
        Illustrative example. Actual predictions use live cutoff data.
      </p>
    </div>
  );
}

function ExploreCard({ to, title, body, icon }: { to: string; title: string; body: string; icon: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="group rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg"
    >
      <div className="flex items-center justify-between">
        <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">{icon}</span>
        <ChevronDown className="-rotate-90 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
      </div>
      <h3 className="mt-4 font-display text-xl font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
    </Link>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <div className="text-center">
      <h2 className="font-display text-3xl font-semibold sm:text-4xl">{title}</h2>
      <div className="mx-auto mt-3 h-[3px] w-12 rounded-full bg-primary/70" />
    </div>
  );
}

function BackgroundOrnament() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <svg
        className="absolute -left-20 bottom-0 hidden w-[520px] text-primary/10 md:block"
        viewBox="0 0 600 320"
        fill="none"
      >
        <path d="M40 280h520M120 280V160l60-50 60 50v120M180 160V110M300 280V100l60-40 60 40v180M360 100V60" stroke="currentColor" strokeWidth="1.2" />
        <rect x="140" y="190" width="20" height="40" stroke="currentColor" strokeWidth="1" />
        <rect x="320" y="140" width="20" height="40" stroke="currentColor" strokeWidth="1" />
        <rect x="370" y="140" width="20" height="40" stroke="currentColor" strokeWidth="1" />
      </svg>
      <div className="absolute -right-32 top-0 h-[420px] w-[420px] rounded-full bg-gradient-to-br from-primary/8 to-transparent blur-3xl" />
    </div>
  );
}
