import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  Building2,
  ChevronDown,
  ChevronRight,
  Download,
  Edit2,
  GraduationCap,
  Info,
  Landmark,
  ListChecks,
  MapPin,
  RefreshCw,
  Sparkles,
  Users,
} from "lucide-react";
import { z } from "zod";
import { SiteLayout } from "@/components/site/SiteLayout";
import { SaveCollegeButton } from "@/components/SaveCollegeButton";
import { MultiSelect } from "@/components/site/MultiSelect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  predict,
  getMeta,
  type Prediction,
} from "@/lib/josaa/josaa.functions";
import {
  BRANCH_GROUPS,
  INDIAN_STATES,
  INSTITUTE_TYPES,
  ROUNDS,
  SEAT_TYPES,
  GENDERS,
} from "@/lib/josaa/data";
import {
  TIER_LABEL,
  TIER_SEQUENCE,
  tierIndex,
} from "@/lib/josaa/tierList";


const searchSchema = z.object({
  rank: z.number().int().positive().optional(),
  category: z.string().optional(),
  gender: z.string().optional(),
  state: z.string().optional(),
  exam: z.enum(["main", "advanced"]).optional(),
  types: z.array(z.string()).optional(),
  branches: z.array(z.string()).optional(),
  pstates: z.array(z.string()).optional(),
  rounds: z.array(z.string()).optional(),
  tab: z.enum(["all", "safe", "moderate", "risky"]).optional(),
});

export const Route = createFileRoute("/predictor")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "College Predictor — JoSAA Atlas" },
      {
        name: "description",
        content:
          "Predict NITs, IIITs and GFTIs from your JEE Main rank using official JoSAA 2025 cutoff data with multi-select filtering.",
      },
    ],
  }),
  component: PredictorPage,
});

function PredictorPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/predictor" });

  const hasRank = !!search.rank;

  return (
    <SiteLayout>
      {!hasRank ? (
        <EmptyForm
          onSubmit={(s) =>
            navigate({
              search: () => ({ ...s, tab: "all" }),
            })
          }
        />
      ) : (
        <Results
          search={search}
          setSearch={(updater) =>
            navigate({ search: (prev: any) => ({ ...prev, ...updater(prev) }) })
          }
        />
      )}
    </SiteLayout>
  );
}

// ---------- Empty form ----------
function EmptyForm({
  onSubmit,
}: {
  onSubmit: (s: { rank: number; category: string; gender: string; state: string; exam: "main" | "advanced" }) => void;
}) {
  const [exam, setExam] = useState<"main" | "advanced">("main");
  const [rank, setRank] = useState("");
  const [category, setCategory] = useState("OPEN");
  const [gender, setGender] = useState("Gender-Neutral");
  const [state, setState] = useState("Maharashtra");
  return (
    <div className="mx-auto max-w-2xl px-4 py-20 sm:px-6">
      <h1 className="font-display text-4xl font-semibold tracking-tight">College Predictor</h1>
      <p className="mt-2 text-muted-foreground">
        Pick the right exam — JEE Main feeds NITs, IIITs and GFTIs (CSAB), JEE Advanced feeds the IITs.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const r = parseInt(rank, 10);
          if (r) onSubmit({ rank: r, category, gender, state, exam });
        }}
        className="mt-8 space-y-5 rounded-2xl border border-border bg-card p-6 shadow-sm"
      >
        <div>
          <Label>Counseling Exam</Label>
          <div className="mt-1.5 grid grid-cols-2 rounded-md border border-border bg-background p-1">
            {([
              { v: "main" as const, label: "JEE Main", sub: "NIT • IIIT • GFTI / CSAB" },
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
          <Label htmlFor="rank2">
            {exam === "advanced" ? "JEE Advanced" : "JEE Main"} Rank ({category === "OPEN" ? "CRL" : "Category"})
          </Label>
          <Input
            id="rank2"
            inputMode="numeric"
            value={rank}
            onChange={(e) => setRank(e.target.value.replace(/\D/g, ""))}
            placeholder={exam === "advanced" ? "e.g. 1850" : "e.g. 5589"}
            className="mt-1.5 h-12 text-base"
            required
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
              <SelectContent>
                {SEAT_TYPES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Gender</Label>
            <Select value={gender} onValueChange={setGender}>
              <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
              <SelectContent>
                {GENDERS.map((g) => <SelectItem key={g} value={g}>{g.startsWith("Female") ? "Female" : "Male"}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Home State</Label>
            <Select value={state} onValueChange={setState}>
              <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
              <SelectContent className="max-h-72">
                {INDIAN_STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button type="submit" size="lg" className="h-12 w-full text-base">
          Predict My Colleges
        </Button>
      </form>
    </div>
  );
}

// ---------- Results ----------
function Results({
  search,
  setSearch,
}: {
  search: z.infer<typeof searchSchema>;
  setSearch: (
    fn: (prev: z.infer<typeof searchSchema>) => Partial<z.infer<typeof searchSchema>>,
  ) => void;
}) {
  const rank = search.rank!;
  const category = search.category ?? "OPEN";
  const gender = search.gender ?? "Gender-Neutral";
  const state = search.state ?? null;
  const exam = search.exam ?? "main";

  const userTypes = search.types ?? [];
  // If user hasn't picked any institute types, gate by the exam.
  const examTypes = exam === "advanced" ? ["IIT"] : ["NIT", "IIIT", "GFTI"];
  const types = userTypes.length ? userTypes : examTypes;
  const branches = search.branches ?? [];
  const pstates = search.pstates ?? [];
  const rounds = search.rounds ?? ["6"];
  const tab = search.tab ?? "all";

  const metaQ = useQuery({
    queryKey: ["josaa-meta"],
    queryFn: () => getMeta(),
    staleTime: 5 * 60_000,
  });

  const predQ = useQuery({
    queryKey: ["predict", rank, category, gender, state, types, branches, pstates, rounds, exam],
    queryFn: () =>
      predict({
        data: {
          rank,
          seatType: category,
          gender,
          homeState: state,
          types,
          branchGroups: branches,
          states: pstates,
          rounds,
        },
      }),
    staleTime: 60_000,
  });

  const data = predQ.data;
  const filtered = useMemo(() => {
    if (!data) return [];
    if (tab === "safe") return data.rows.filter((r) => r.label === "Safe");
    if (tab === "moderate") return data.rows.filter((r) => r.label === "Moderate");
    if (tab === "risky")
      return data.rows.filter((r) => r.label === "Risky" || r.label === "Very Risky");
    return data.rows;
  }, [data, tab]);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-20 pt-8 sm:px-6">
      {/* Search summary */}
      <SummaryCard
        rank={rank}
        category={category}
        gender={gender}
        state={state}
        exam={exam}
        onEdit={() =>
          setSearch(() => ({
            rank: undefined,
          }))
        }
      />

      <div className="mt-6 grid gap-6 md:grid-cols-[280px_1fr]">
        {/* Filters */}
        <aside className="hidden md:block">
          <FilterPanel
            types={types}
            branches={branches}
            pstates={pstates}
            rounds={rounds}
            meta={metaQ.data}
            onChange={(patch) => setSearch(() => patch)}
          />
        </aside>

        <div className="min-w-0">
          {/* Mobile filter toggle */}
          <div className="mb-4 flex items-center gap-2 md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[88%] max-w-sm overflow-y-auto p-5">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="mt-4">
                  <FilterPanel
                    embedded
                    types={types}
                    branches={branches}
                    pstates={pstates}
                    rounds={rounds}
                    meta={metaQ.data}
                    onChange={(patch) => setSearch(() => patch)}
                  />
                </div>
              </SheetContent>
            </Sheet>
            <div className="text-sm text-muted-foreground">
              {data ? `${data.total} matches` : "Loading…"}
            </div>
          </div>

          {/* Results header */}
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-3xl font-semibold">Predicted Colleges</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {predQ.isLoading ? "Analyzing cutoffs…" : `Showing ${filtered.length} of ${data?.total ?? 0} colleges`}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>
                <ListChecks className="mr-1.5 h-4 w-4" />
                Preference List
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportCsv(filtered)}
                disabled={!filtered.length}
              >
                <Download className="mr-1.5 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={tab} onValueChange={(v) => setSearch(() => ({ tab: v as any }))} className="mt-5">
            <TabsList className="grid h-auto w-full grid-cols-4 bg-cream/60 p-1">
              <TabsTrigger value="all" className="py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow">
                All ({data?.total ?? 0})
              </TabsTrigger>
              <TabsTrigger value="safe" className="py-2.5">
                <span className="mr-1 h-2 w-2 rounded-full bg-success" />
                Safe ({data?.safe ?? 0})
              </TabsTrigger>
              <TabsTrigger value="moderate" className="py-2.5">
                <span className="mr-1 h-2 w-2 rounded-full bg-warning" />
                Moderate ({data?.moderate ?? 0})
              </TabsTrigger>
              <TabsTrigger value="risky" className="py-2.5">
                <span className="mr-1 h-2 w-2 rounded-full bg-destructive" />
                Risky ({data?.risky ?? 0})
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Grouped tier results */}
          <div className="mt-4">
            {predQ.isLoading ? (
              <div className="overflow-hidden rounded-2xl border border-border bg-card">
                <SkeletonRows />
              </div>
            ) : filtered.length === 0 ? (
              <div className="overflow-hidden rounded-2xl border border-border bg-card">
                <EmptyState />
              </div>
            ) : (
              <GroupedResults rows={filtered} rank={rank} />
            )}
          </div>


          <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Info className="h-3.5 w-3.5" />
            Predictions are based on official JoSAA 2025 cutoff trends. Actual results may vary.
          </p>
        </div>
      </div>
    </div>
  );
}

// ---------- Summary card ----------
function SummaryCard({
  rank, category, gender, state, exam, onEdit,
}: {
  rank: number; category: string; gender: string; state: string | null; exam: "main" | "advanced"; onEdit: () => void;
}) {
  const examLabel = exam === "advanced" ? "JEE Advanced" : "JEE Main";
  const rankLabel = exam === "advanced" ? "Advanced CRL" : "Main CRL";
  return (
    <motion.section
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border border-border bg-card px-5 py-5 shadow-sm"
    >
      <div className="grid gap-5 md:grid-cols-[1fr_auto_auto] md:items-center">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <SummaryStat icon={<Landmark className="h-4 w-4" />} label={rankLabel} value={rank.toLocaleString()} />
          <SummaryStat icon={<Users className="h-4 w-4" />} label="Category" value={category} />
          <SummaryStat icon={<MapPin className="h-4 w-4" />} label="Home State" value={state ?? "—"} />
          <SummaryStat icon={<GraduationCap className="h-4 w-4" />} label="Gender" value={gender.startsWith("Female") ? "Female" : "Male"} />
        </div>
        <div className="hidden h-12 w-px bg-border md:block" />
        <div className="flex items-center gap-6">
          <div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground">{examLabel} Rank</div>
            <div className="font-display text-3xl font-semibold text-primary">{rank.toLocaleString()}</div>
            <div className="text-[11px] text-muted-foreground">
              {exam === "advanced" ? "Predicting IIT seats" : "Predicting NIT, IIIT & GFTI seats"}
            </div>
          </div>
          <div className="flex items-center gap-3 border-l border-border pl-6">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
              <Sparkles className="h-4 w-4" />
            </span>
            <div className="text-xs">
              <div className="font-semibold text-foreground">Data from JoSAA 2025</div>
              <div className="text-muted-foreground">All 6 rounds • All categories • Opening &amp; Closing ranks</div>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute" />
      <div className="mt-3 flex justify-end">
        <Button onClick={onEdit} variant="ghost" size="sm">
          <Edit2 className="mr-1.5 h-3.5 w-3.5" /> Edit search
        </Button>
      </div>
    </motion.section>
  );
}
function SummaryStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-cream text-primary">{icon}</div>
      <div className="min-w-0">
        <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
        <div className="truncate text-sm font-semibold text-foreground">{value}</div>
      </div>
    </div>
  );
}

// ---------- Filters ----------
function FilterPanel({
  types,
  branches,
  pstates,
  rounds,
  meta,
  embedded,
  onChange,
}: {
  types: string[];
  branches: string[];
  pstates: string[];
  rounds: string[];
  meta: Awaited<ReturnType<typeof getMeta>> | undefined;
  embedded?: boolean;
  onChange: (patch: any) => void;
}) {
  const stateOptions = useMemo(
    () => (meta?.states ?? INDIAN_STATES).map((s) => ({ value: s, label: s })),
    [meta],
  );
  return (
    <div className={embedded ? "" : "sticky top-20 rounded-2xl border border-border bg-card p-5"}>
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold">Filters</h3>
        <Button
          variant="ghost"
          size="sm"
          className="text-primary"
          onClick={() => onChange({ types: [], branches: [], pstates: [], rounds: ["6"], tab: "all" })}
        >
          <RefreshCw className="mr-1 h-3 w-3" /> Reset
        </Button>
      </div>

      <FilterGroup label="Institute Type">
        <CheckboxList
          value={types}
          options={INSTITUTE_TYPES.map((t) => ({
            value: t,
            label: t,
            count: meta?.counts[t as keyof typeof meta.counts] as number | undefined,
          }))}
          onChange={(v) => onChange({ types: v })}
        />
      </FilterGroup>

      <FilterGroup label="Branch Group">
        <CheckboxList
          value={branches}
          options={BRANCH_GROUPS.map((b) => ({ value: b, label: b }))}
          onChange={(v) => onChange({ branches: v })}
          collapseAfter={6}
        />
      </FilterGroup>

      <FilterGroup label="State">
        <MultiSelect
          options={stateOptions}
          value={pstates}
          onChange={(v) => onChange({ pstates: v })}
          placeholder="All states"
          searchPlaceholder="Search states…"
        />
      </FilterGroup>

      <FilterGroup label="Rounds">
        <div className="grid grid-cols-3 gap-2">
          {ROUNDS.map((r) => {
            const active = rounds.includes(r);
            return (
              <button
                key={r}
                onClick={() => onChange({ rounds: active ? rounds.filter((x) => x !== r) : [...rounds, r] })}
                className={
                  "rounded-md border px-2 py-1.5 text-sm font-medium transition " +
                  (active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background hover:border-primary/40")
                }
              >
                R{r}
              </button>
            );
          })}
        </div>
      </FilterGroup>
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mt-5">
      <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-foreground/70">{label}</div>
      {children}
    </div>
  );
}

function CheckboxList({
  value,
  options,
  onChange,
  collapseAfter,
}: {
  value: string[];
  options: { value: string; label: string; count?: number }[];
  onChange: (v: string[]) => void;
  collapseAfter?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const visible = collapseAfter && !expanded ? options.slice(0, collapseAfter) : options;
  return (
    <div className="space-y-1.5">
      {visible.map((o) => {
        const checked = value.includes(o.value);
        return (
          <label key={o.value} className="flex cursor-pointer items-center gap-2 rounded-md px-1 py-1 text-sm hover:bg-muted/60">
            <span
              className={
                "grid h-4 w-4 shrink-0 place-items-center rounded-[4px] border " +
                (checked ? "border-primary bg-primary text-primary-foreground" : "border-input")
              }
            >
              {checked ? (
                <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="M3 8.5l3 3 7-7" />
                </svg>
              ) : null}
            </span>
            <input
              type="checkbox"
              checked={checked}
              onChange={() => onChange(checked ? value.filter((x) => x !== o.value) : [...value, o.value])}
              className="sr-only"
            />
            <span className="flex-1 truncate">{o.label}</span>
            {o.count != null ? (
              <span className="text-xs tabular-nums text-muted-foreground">{o.count}</span>
            ) : null}
          </label>
        );
      })}
      {collapseAfter && options.length > collapseAfter ? (
        <button
          type="button"
          className="text-xs font-medium text-primary hover:underline"
          onClick={() => setExpanded((e) => !e)}
        >
          {expanded ? "Show less" : `Show more (${options.length - collapseAfter})`}
        </button>
      ) : null}
    </div>
  );
}

// ---------- Grouped tier results ----------
type TierKey = "IIT" | "NIT" | "IIIT" | "GFTI";

function GroupedResults({ rows, rank }: { rows: Prediction[]; rank: number }) {
  const grouped = useMemo(() => {
    const byTier = new Map<TierKey, Map<string, Prediction[]>>();
    for (const r of rows) {
      const t = r.type as TierKey;
      if (!TIER_SEQUENCE.includes(t)) continue;
      if (!byTier.has(t)) byTier.set(t, new Map());
      const inst = byTier.get(t)!;
      if (!inst.has(r.institute)) inst.set(r.institute, []);
      inst.get(r.institute)!.push(r);
    }
    // For each tier, produce ordered institute list with branches.
    const out: Array<{
      tier: TierKey;
      institutes: Array<{
        name: string;
        short: string;
        state: string | null;
        idx: number;
        branches: Prediction[];
      }>;
    }> = [];
    for (const tier of TIER_SEQUENCE) {
      const m = byTier.get(tier);
      if (!m) continue;
      const institutes = Array.from(m.entries()).map(([name, branches]) => {
        // Best (lowest closing) branch first within an institute.
        branches.sort((a, b) => a.closing - b.closing);
        return {
          name,
          short: branches[0].short,
          state: branches[0].state,
          idx: tierIndex(tier, name),
          branches,
        };
      });
      institutes.sort((a, b) => a.idx - b.idx || a.name.localeCompare(b.name));
      out.push({ tier, institutes });
    }
    return out;
  }, [rows]);

  return (
    <div className="space-y-8">
      {grouped.map((g) => (
        <section key={g.tier}>
          <div className="mb-3 flex items-center gap-3">
            <h3 className="font-display text-2xl font-semibold">
              {TIER_LABEL[g.tier]}
            </h3>
            <span className="rounded-full bg-cream px-2 py-0.5 text-xs font-medium text-foreground/70 ring-1 ring-border">
              {g.institutes.length} colleges · {g.institutes.reduce((n, i) => n + i.branches.length, 0)} branches
            </span>
          </div>
          <div className="space-y-4">
            {g.institutes.map((inst) => (
              <InstituteCard key={inst.name} inst={inst} rank={rank} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function InstituteCard({
  inst,
  rank,
}: {
  inst: { name: string; short: string; state: string | null; branches: Prediction[] };
  rank: number;
}) {
  const [open, setOpen] = useState(false);
  const best = inst.branches[0]; // already sorted by closing asc
  const bestChance = inst.branches.reduce((m, b) => Math.max(m, b.chance), 0);
  const tierType = best.type;
  const chanceColor =
    bestChance >= 75
      ? "text-success"
      : bestChance >= 40
        ? "text-amber-600"
        : "text-destructive";

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card transition hover:border-primary/30">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 text-left transition hover:bg-muted/40 sm:px-5 sm:py-4"
      >
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/10 ring-1 ring-primary/15 sm:h-11 sm:w-11">
          <Building2 className="h-5 w-5 text-primary" />
        </div>

        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-2">
            <span className="truncate font-semibold leading-tight">{inst.name}</span>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px] sm:text-[11px]">
            <Pill>{tierType}</Pill>
            {inst.state ? <Pill subtle>{inst.state}</Pill> : null}
            <Pill subtle>
              {inst.branches.length} branch{inst.branches.length === 1 ? "" : "es"}
            </Pill>
          </div>
          <div className="mt-1.5 hidden truncate text-xs text-muted-foreground sm:block">
            Best: <span className="font-medium text-foreground/80">{best.programClean}</span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-4">
          <div className="hidden text-right sm:block">
            <div className={"font-display text-xl font-semibold leading-none " + chanceColor}>
              {bestChance}%
            </div>
            <div className="mt-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
              Top chance
            </div>
          </div>
          <span
            className={
              "inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-background px-2.5 text-xs font-medium text-foreground/80 transition sm:px-3 " +
              (open ? "border-primary text-primary" : "hover:border-primary/40")
            }
          >
            <span className="hidden sm:inline">{open ? "Hide" : "Expand"} Branches</span>
            <span className="sm:hidden">{inst.branches.length}</span>
            <ChevronDown
              className={"h-4 w-4 transition-transform duration-300 " + (open ? "rotate-180" : "")}
            />
          </span>
        </div>
      </button>

      <div
        className={
          "grid transition-all duration-300 ease-out " +
          (open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")
        }
      >
        <div className="overflow-hidden">
          <div className="flex items-center justify-between border-t border-border bg-muted/30 px-5 py-2 text-[11px] text-muted-foreground sm:hidden">
            <span>Top chance</span>
            <span className={"font-display text-sm font-semibold " + chanceColor}>{bestChance}%</span>
          </div>
          <div className="flex items-center justify-between gap-2 border-t border-border bg-muted/20 px-5 py-2">
            <SaveCollegeButton
              college={{
                institute: inst.name,
                program: best.programClean,
                year: null,
                round: best.round,
                quota: best.quota,
                seat_type: best.seatType,
                gender: null,
                closing_rank: String(best.closing),
                notes: null,
              }}
            />
            <Link
              to="/institutes/$institute"
              params={{ institute: encodeURIComponent(inst.name) }}
              search={{ program: best.program }}
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              View institute page <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <ul className="divide-y divide-border">
            {inst.branches.map((p, i) => (
              <BranchRow key={i} p={p} rank={rank} />
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function BranchRow({ p, rank: _rank }: { p: Prediction; rank: number }) {
  const ahead = p.diff > 0;
  const labelColor =
    p.label === "Safe"
      ? "bg-success/15 text-success border-success/20"
      : p.label === "Moderate"
        ? "bg-warning/20 text-amber-700 border-warning/30"
        : "bg-destructive/15 text-destructive border-destructive/30";
  const chanceColor =
    p.label === "Safe"
      ? "text-success"
      : p.label === "Moderate"
        ? "text-amber-600"
        : "text-destructive";
  return (
    <li className="grid grid-cols-[1fr_auto] gap-3 px-5 py-3 md:grid-cols-[1fr_120px_160px_140px] md:items-center md:gap-4">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className={"chip border " + labelColor}>{p.label}</span>
          <span className="font-medium leading-tight">{p.programClean}</span>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px]">
          <Pill subtle>Quota {p.quota}</Pill>
          <Pill subtle>Round {p.round}</Pill>
          <Pill subtle>{p.seatType}</Pill>
        </div>
      </div>
      <div className="text-right md:text-left">
        <div className="font-display text-lg font-semibold tabular-nums">{p.closing.toLocaleString()}</div>
        <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Closing rank</div>
      </div>
      <div className="col-span-2 md:col-span-1">
        <div className={"text-xs font-semibold " + (ahead ? "text-success" : "text-destructive")}>
          {ahead ? "Ahead by" : "Behind by"} {Math.abs(p.diff).toLocaleString()}
        </div>
      </div>
      <div className="col-span-2 md:col-span-1">
        <div className="flex items-baseline gap-1">
          <span className={"font-display text-xl font-semibold " + chanceColor}>{p.chance}%</span>
          <span className="text-[10px] text-muted-foreground">chance</span>
        </div>
        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className={
              "h-full rounded-full " +
              (p.label === "Safe"
                ? "bg-success"
                : p.label === "Moderate"
                  ? "bg-warning"
                  : "bg-destructive")
            }
            style={{ width: `${p.chance}%` }}
          />
        </div>
      </div>
    </li>
  );
}

// ---------- Row (legacy flat row, unused) ----------
function Row({ p, rank }: { p: Prediction; rank: number }) {

  const ahead = p.diff > 0;
  const labelColor =
    p.label === "Safe"
      ? "bg-success/15 text-success border-success/20"
      : p.label === "Moderate"
        ? "bg-warning/20 text-amber-700 border-warning/30"
        : "bg-destructive/15 text-destructive border-destructive/30";
  return (
    <li className="grid grid-cols-[1fr] gap-3 px-5 py-4 transition hover:bg-cream/40 md:grid-cols-[1fr_140px_180px_160px_50px] md:items-center md:gap-4">
      <div className="flex min-w-0 items-start gap-3">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-primary/10 ring-1 ring-primary/15">
          <Building2 className="h-5 w-5 text-primary" />
        </div>
        <div className="min-w-0">
          <span className={"chip border " + labelColor}>{p.label}</span>
          <div className="mt-1 font-semibold leading-tight">{p.short}</div>
          <div className="text-sm text-muted-foreground">{p.programClean}</div>
          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px]">
            <Pill>{p.type}</Pill>
            {p.state ? <Pill>{p.state}</Pill> : null}
            <Pill subtle>Quota {p.quota}</Pill>
            <Pill subtle>Round {p.round}</Pill>
          </div>
        </div>
      </div>

      <div className="md:text-left">
        <div className="text-[11px] uppercase tracking-wide text-muted-foreground md:hidden">Closing Rank</div>
        <div className="font-display text-2xl font-semibold tabular-nums">{p.closing.toLocaleString()}</div>
        <div className="text-[11px] text-muted-foreground">Closing Rank</div>
      </div>

      <div>
        <div className="text-[11px] uppercase tracking-wide text-muted-foreground md:hidden">Your Position</div>
        <div className={"text-sm font-semibold " + (ahead ? "text-success" : "text-destructive")}>
          {ahead ? "Ahead by" : "Behind by"} {Math.abs(p.diff).toLocaleString()} ranks
        </div>
        <div className="text-[11px] text-muted-foreground">
          {p.label === "Safe" ? "Very Safe" : p.label === "Moderate" ? "Moderate" : "Risky"}
        </div>
      </div>

      <div>
        <div className="flex items-baseline gap-1">
          <span
            className={
              "font-display text-2xl font-semibold " +
              (p.label === "Safe"
                ? "text-success"
                : p.label === "Moderate"
                  ? "text-amber-600"
                  : "text-destructive")
            }
          >
            {p.chance}%
          </span>
        </div>
        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className={
              "h-full rounded-full " +
              (p.label === "Safe"
                ? "bg-success"
                : p.label === "Moderate"
                  ? "bg-warning"
                  : "bg-destructive")
            }
            style={{ width: `${p.chance}%` }}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Link
          to="/institutes/$institute"
          params={{ institute: encodeURIComponent(p.institute) }}
          search={{ program: p.program }}
          className="grid h-9 w-9 place-items-center rounded-md border border-border text-muted-foreground transition hover:border-primary hover:text-primary"
          aria-label="Open institute page"
        >
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </li>
  );
}

function Pill({ children, subtle = false }: { children: React.ReactNode; subtle?: boolean }) {
  return (
    <span
      className={
        "rounded-full px-2 py-0.5 text-[10px] font-medium " +
        (subtle ? "bg-muted text-muted-foreground" : "bg-cream text-foreground/80 ring-1 ring-border")
      }
    >
      {children}
    </span>
  );
}

function SkeletonRows() {
  return (
    <ul className="divide-y divide-border">
      {Array.from({ length: 6 }).map((_, i) => (
        <li key={i} className="flex animate-pulse items-center gap-4 px-5 py-5">
          <div className="h-12 w-12 rounded-full bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-1/3 rounded bg-muted" />
            <div className="h-3 w-2/3 rounded bg-muted" />
          </div>
          <div className="h-8 w-16 rounded bg-muted" />
          <div className="h-8 w-24 rounded bg-muted" />
        </li>
      ))}
    </ul>
  );
}

function EmptyState() {
  return (
    <div className="px-6 py-16 text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-cream text-primary">
        <Building2 className="h-6 w-6" />
      </div>
      <h3 className="mt-4 font-display text-xl font-semibold">No matching colleges</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Try widening your filters or selecting more rounds.
      </p>
    </div>
  );
}

function exportCsv(rows: Prediction[]) {
  const header = ["Institute", "Short", "Type", "State", "Program", "Round", "Quota", "Seat Type", "Closing", "Chance", "Label"];
  const csv = [
    header.join(","),
    ...rows.map((r) =>
      [r.institute, r.short, r.type, r.state ?? "", r.programClean, r.round, r.quota, r.seatType, r.closing, r.chance, r.label]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(","),
    ),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "josaa-predictions.csv";
  a.click();
  URL.revokeObjectURL(url);
}
