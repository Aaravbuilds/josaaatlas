import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import {
  ArrowLeft,
  BookOpen,
  Building2,
  ChevronRight,
  GraduationCap,
  Layers,
  MapPin,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useMemo, useState } from "react";
import { z } from "zod";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getInstituteDetail } from "@/lib/josaa/josaa.functions";
import { GENDERS, SEAT_TYPES } from "@/lib/josaa/data";

const searchSchema = z.object({
  seatType: z.string().optional(),
  gender: z.string().optional(),
  program: z.string().optional(),
});

export const Route = createFileRoute("/institutes/$institute")({
  validateSearch: searchSchema,
  head: ({ params }) => ({
    meta: [
      { title: `${decodeURIComponent(params.institute)} — JoSAA Atlas` },
      {
        name: "description",
        content: `Round-wise cutoff trends, branch analytics and key stats for ${decodeURIComponent(params.institute)} in JoSAA 2025.`,
      },
    ],
  }),
  component: InstitutePage,
  errorComponent: ({ error }) => (
    <SiteLayout>
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="font-display text-3xl">Could not load institute</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
      </div>
    </SiteLayout>
  ),
  notFoundComponent: () => (
    <SiteLayout>
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="font-display text-3xl">Institute not found</h1>
      </div>
    </SiteLayout>
  ),
});

function InstitutePage() {
  const { institute } = Route.useParams();
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const decoded = decodeURIComponent(institute);
  const seatType = search.seatType ?? "OPEN";
  const gender = search.gender ?? "Gender-Neutral";

  const q = useQuery({
    queryKey: ["institute-detail", decoded, seatType, gender],
    queryFn: () => getInstituteDetail({ data: { institute: decoded, seatType, gender } }),
    staleTime: 5 * 60_000,
  });

  const data = q.data;
  const programs = data?.programs ?? [];
  const initialProgram = search.program ?? programs[0]?.program;
  const [selected, setSelected] = useState<string | undefined>(initialProgram);
  const activeProgram = useMemo(
    () => programs.find((p) => p.program === (selected ?? initialProgram)) ?? programs[0],
    [programs, selected, initialProgram],
  );

  return (
    <SiteLayout>
      <div className="mx-auto max-w-7xl px-4 pb-20 pt-8 sm:px-6">
        <Link
          to="/colleges"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to colleges
        </Link>

        {q.isLoading || !data ? (
          <div className="mt-8 h-64 animate-pulse rounded-2xl bg-muted/40" />
        ) : (
          <>
            {/* Hero */}
            <motion.section
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mt-4 overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm"
            >
              <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
                <div className="flex items-start gap-4">
                  <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/15">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="chip border border-primary/20 bg-primary/5 text-primary">{data.type}</span>
                      {data.state ? (
                        <span className="chip border border-border bg-cream">
                          <MapPin className="h-3 w-3" /> {data.state}
                        </span>
                      ) : null}
                    </div>
                    <h1 className="mt-2 font-display text-3xl font-semibold leading-tight sm:text-4xl">
                      {data.short}
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">{data.institute}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Stat label="Programs" value={data.totalPrograms.toLocaleString()} icon={<GraduationCap className="h-4 w-4" />} />
                  <Stat label="Cutoff rows" value={data.totalRows.toLocaleString()} icon={<Layers className="h-4 w-4" />} />
                  <Stat
                    label="Best closing"
                    value={
                      programs[0]?.minClosing != null ? programs[0].minClosing.toLocaleString() : "—"
                    }
                    icon={<TrendingDown className="h-4 w-4" />}
                  />
                </div>
              </div>

              {/* Category controls */}
              <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-border pt-4">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">View as</div>
                <Select
                  value={seatType}
                  onValueChange={(v) => navigate({ search: (p: any) => ({ ...p, seatType: v }) })}
                >
                  <SelectTrigger className="h-9 w-[180px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SEAT_TYPES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select
                  value={gender}
                  onValueChange={(v) => navigate({ search: (p: any) => ({ ...p, gender: v }) })}
                >
                  <SelectTrigger className="h-9 w-[180px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {GENDERS.map((g) => (
                      <SelectItem key={g} value={g}>
                        {g.startsWith("Female") ? "Female-only" : "Gender-Neutral"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </motion.section>

            {/* Overall closing-rank trend */}
            <section className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
              <div className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-baseline justify-between gap-3">
                  <div>
                    <h2 className="font-display text-xl font-semibold">Round-wise rank band</h2>
                    <p className="text-xs text-muted-foreground">
                      Best & worst closing ranks per round across all branches.
                    </p>
                  </div>
                  <TrendingUp className="h-4 w-4 text-primary" />
                </div>
                <div className="mt-4 h-72 w-full">
                  {data.overall.length ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={data.overall.map((r) => ({ ...r, round: `R${r.round}` }))}>
                        <defs>
                          <linearGradient id="bandFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="oklch(0.36 0.12 22)" stopOpacity={0.32} />
                            <stop offset="100%" stopColor="oklch(0.36 0.12 22)" stopOpacity={0.02} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid stroke="oklch(0.92 0.01 60)" strokeDasharray="3 3" />
                        <XAxis dataKey="round" stroke="#888" fontSize={12} />
                        <YAxis stroke="#888" fontSize={12} reversed tickFormatter={(v) => v.toLocaleString()} />
                        <Tooltip
                          contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))" }}
                          formatter={(v: number) => v.toLocaleString()}
                        />
                        <Area type="monotone" dataKey="worst" stroke="oklch(0.36 0.12 22)" fill="url(#bandFill)" name="Worst closing" />
                        <Area type="monotone" dataKey="best" stroke="oklch(0.55 0.16 22)" fill="transparent" name="Best closing" />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <EmptyChart />
                  )}
                </div>
                <p className="mt-2 text-[11px] text-muted-foreground">
                  Y-axis is reversed — lower rank = better. Hover for exact values.
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-card p-5">
                <h2 className="font-display text-xl font-semibold">Branch mix</h2>
                <p className="text-xs text-muted-foreground">Programs offered by branch group.</p>
                <div className="mt-4 h-72 w-full">
                  {data.branchGroups.length ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.branchGroups} layout="vertical" margin={{ left: 8, right: 16 }}>
                        <CartesianGrid stroke="oklch(0.92 0.01 60)" horizontal={false} />
                        <XAxis type="number" stroke="#888" fontSize={11} />
                        <YAxis dataKey="name" type="category" stroke="#666" fontSize={11} width={130} />
                        <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))" }} />
                        <Bar dataKey="count" fill="oklch(0.36 0.12 22)" radius={[0, 6, 6, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <EmptyChart />
                  )}
                </div>
              </div>
            </section>

            {/* Program-level analytics */}
            <section className="mt-8 grid gap-6 lg:grid-cols-[280px_1fr]">
              <aside className="rounded-2xl border border-border bg-card p-2 lg:max-h-[520px] lg:overflow-y-auto">
                <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Programs ({programs.length})
                </div>
                <ul className="space-y-0.5">
                  {programs.map((p) => {
                    const active = activeProgram?.program === p.program;
                    return (
                      <li key={p.program}>
                        <button
                          onClick={() => setSelected(p.program)}
                          className={
                            "flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-sm transition " +
                            (active ? "bg-primary text-primary-foreground" : "hover:bg-muted")
                          }
                        >
                          <span className="min-w-0 truncate">{p.programClean}</span>
                          <span className={"shrink-0 text-[11px] tabular-nums " + (active ? "opacity-90" : "text-muted-foreground")}>
                            {p.latestClosing?.toLocaleString() ?? "—"}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                  {!programs.length ? (
                    <li className="px-3 py-6 text-center text-xs text-muted-foreground">
                      No programs for this category.
                    </li>
                  ) : null}
                </ul>
              </aside>

              <div className="rounded-2xl border border-border bg-card p-5">
                {activeProgram ? (
                  <>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <span className="chip border border-border bg-cream">{activeProgram.branchGroup}</span>
                        <h3 className="mt-2 font-display text-2xl font-semibold leading-tight">
                          {activeProgram.programClean}
                        </h3>
                      </div>
                      <Link
                        to="/cutoffs"
                        search={{ institute: data.institute, program: activeProgram.programClean }}
                        className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                      >
                        Open in Cutoff Explorer <ChevronRight className="h-3 w-3" />
                      </Link>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-3">
                      <MiniStat label="Best closing" value={activeProgram.minClosing?.toLocaleString() ?? "—"} accent="success" />
                      <MiniStat label="Latest (R6)" value={activeProgram.latestClosing?.toLocaleString() ?? "—"} />
                      <MiniStat label="Worst closing" value={activeProgram.maxClosing?.toLocaleString() ?? "—"} accent="warn" />
                    </div>

                    <div className="mt-6 h-72 w-full">
                      {activeProgram.trend.length ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={activeProgram.trend.map((t) => ({ ...t, round: `R${t.round}` }))}>
                            <CartesianGrid stroke="oklch(0.92 0.01 60)" strokeDasharray="3 3" />
                            <XAxis dataKey="round" stroke="#888" fontSize={12} />
                            <YAxis stroke="#888" fontSize={12} reversed tickFormatter={(v) => v.toLocaleString()} />
                            <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))" }} formatter={(v: number) => v.toLocaleString()} />
                            <Line type="monotone" dataKey="opening" stroke="oklch(0.6 0.12 22 / 0.7)" strokeWidth={2} dot={{ r: 3 }} name="Opening" />
                            <Line type="monotone" dataKey="closing" stroke="oklch(0.36 0.12 22)" strokeWidth={2.5} dot={{ r: 4 }} name="Closing" />
                          </LineChart>
                        </ResponsiveContainer>
                      ) : (
                        <EmptyChart />
                      )}
                    </div>
                    <p className="mt-2 text-[11px] text-muted-foreground">
                      Round-wise opening & closing ranks for {seatType} • {gender.startsWith("Female") ? "Female" : "Gender-Neutral"}.
                    </p>
                  </>
                ) : (
                  <div className="grid h-72 place-items-center text-sm text-muted-foreground">
                    <div className="text-center">
                      <BookOpen className="mx-auto h-6 w-6 text-muted-foreground" />
                      <p className="mt-2">No programs available for the selected category.</p>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </>
        )}
      </div>
    </SiteLayout>
  );
}

function Stat({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-cream/40 px-4 py-3">
      <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">{icon}</div>
      <div>
        <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
        <div className="font-display text-lg font-semibold leading-none">{value}</div>
      </div>
    </div>
  );
}

function MiniStat({ label, value, accent }: { label: string; value: string; accent?: "success" | "warn" }) {
  const color =
    accent === "success" ? "text-success" : accent === "warn" ? "text-amber-600" : "text-primary";
  return (
    <div className="rounded-xl border border-border bg-cream/30 px-4 py-3">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={"mt-1 font-display text-2xl font-semibold tabular-nums " + color}>{value}</div>
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="grid h-full place-items-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">
      No data for this view.
    </div>
  );
}
