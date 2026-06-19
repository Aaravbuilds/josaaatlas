import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Download, Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { z } from "zod";
import { SiteLayout } from "@/components/site/SiteLayout";
import { MultiSelect } from "@/components/site/MultiSelect";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { getMeta, queryCutoffs } from "@/lib/josaa/josaa.functions";
import { BRANCH_GROUPS, GENDERS, INSTITUTE_TYPES, QUOTAS, ROUNDS, SEAT_TYPES } from "@/lib/josaa/data";

const searchSchema = z.object({
  q: z.string().optional(),
  institute: z.string().optional(),
  program: z.string().optional(),
  types: z.array(z.string()).optional(),
  states: z.array(z.string()).optional(),
  branches: z.array(z.string()).optional(),
  seatTypes: z.array(z.string()).optional(),
  quotas: z.array(z.string()).optional(),
  genders: z.array(z.string()).optional(),
  rounds: z.array(z.string()).optional(),
});

export const Route = createFileRoute("/cutoffs")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Cutoff Explorer — JoSAA Atlas" },
      { name: "description", content: "Search opening and closing ranks across every JoSAA 2025 round, category and quota." },
    ],
  }),
  component: CutoffsPage,
});

function CutoffsPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const [q, setQ] = useState(search.q ?? search.institute ?? "");

  const types = search.types ?? [];
  const states = search.states ?? [];
  const branches = search.branches ?? [];
  const seatTypes = search.seatTypes ?? ["OPEN"];
  const quotas = search.quotas ?? [];
  const genders = search.genders ?? ["Gender-Neutral"];
  const rounds = search.rounds ?? [];

  const queryStr = search.institute ?? search.program ?? q;

  const metaQ = useQuery({ queryKey: ["josaa-meta"], queryFn: () => getMeta(), staleTime: 5 * 60_000 });

  const dataQ = useQuery({
    queryKey: ["cutoffs", queryStr, types, states, branches, seatTypes, quotas, genders, rounds],
    queryFn: () =>
      queryCutoffs({
        data: {
          query: queryStr,
          types, states, branchGroups: branches,
          seatTypes, quotas, genders, rounds,
          limit: 1500,
        },
      }),
    staleTime: 60_000,
  });

  const rows = useMemo(() => {
    const r = dataQ.data?.rows ?? [];
    return [...r].sort((a, b) => (a.closing ?? 0) - (b.closing ?? 0));
  }, [dataQ.data]);

  const setSearch = (patch: any) => navigate({ search: (p: any) => ({ ...p, ...patch }) });

  const Filters = (
    <div className="space-y-5">
      <FG label="Institute Type">
        <MultiSelect
          options={INSTITUTE_TYPES.map((t) => ({ value: t, label: t }))}
          value={types}
          onChange={(v) => setSearch({ types: v })}
          placeholder="All types"
        />
      </FG>
      <FG label="State">
        <MultiSelect
          options={(metaQ.data?.states ?? []).map((s) => ({ value: s, label: s }))}
          value={states}
          onChange={(v) => setSearch({ states: v })}
          placeholder="All states"
        />
      </FG>
      <FG label="Branch Group">
        <MultiSelect
          options={BRANCH_GROUPS.map((b) => ({ value: b, label: b }))}
          value={branches}
          onChange={(v) => setSearch({ branches: v })}
          placeholder="All branches"
        />
      </FG>
      <FG label="Seat Type">
        <MultiSelect
          options={SEAT_TYPES.map((s) => ({ value: s, label: s }))}
          value={seatTypes}
          onChange={(v) => setSearch({ seatTypes: v })}
          placeholder="Any category"
        />
      </FG>
      <FG label="Quota">
        <MultiSelect
          options={QUOTAS.map((q) => ({ value: q, label: q }))}
          value={quotas}
          onChange={(v) => setSearch({ quotas: v })}
          placeholder="All quotas"
        />
      </FG>
      <FG label="Gender">
        <MultiSelect
          options={GENDERS.map((g) => ({ value: g, label: g.startsWith("Female") ? "Female" : "Gender-Neutral" }))}
          value={genders}
          onChange={(v) => setSearch({ genders: v })}
          placeholder="Any"
        />
      </FG>
      <FG label="Rounds">
        <div className="grid grid-cols-6 gap-1.5">
          {ROUNDS.map((r) => {
            const active = rounds.includes(r);
            return (
              <button
                key={r}
                onClick={() => setSearch({ rounds: active ? rounds.filter((x: string) => x !== r) : [...rounds, r] })}
                className={
                  "rounded-md border px-1 py-1.5 text-sm font-medium transition " +
                  (active ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary/40")
                }
              >
                {r}
              </button>
            );
          })}
        </div>
      </FG>
    </div>
  );

  return (
    <SiteLayout>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-4xl font-semibold tracking-tight">Cutoff Explorer</h1>
            <p className="mt-2 text-muted-foreground">
              Opening & closing ranks across every institute, branch, round and category.
            </p>
          </div>
          <div className="text-xs text-muted-foreground">
            {dataQ.data ? `${dataQ.data.total.toLocaleString()} matching rows • JoSAA 2025` : "Loading…"}
          </div>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-[300px_1fr]">
          <aside className="hidden md:block">
            <div className="sticky top-20 rounded-2xl border border-border bg-card p-5">
              <h3 className="font-display text-lg font-semibold">Filters</h3>
              <div className="mt-4">{Filters}</div>
            </div>
          </aside>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") setSearch({ q: q || undefined, institute: undefined, program: undefined });
                  }}
                  onBlur={() => setSearch({ q: q || undefined, institute: undefined, program: undefined })}
                  placeholder="Search by institute, branch, program…"
                  className="h-11 bg-card pl-10"
                />
              </div>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="md:hidden">
                    <SlidersHorizontal className="mr-1.5 h-4 w-4" /> Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[88%] max-w-sm overflow-y-auto p-5">
                  <SheetHeader><SheetTitle>Filters</SheetTitle></SheetHeader>
                  <div className="mt-4">{Filters}</div>
                </SheetContent>
              </Sheet>
              <Button variant="outline" onClick={() => exportCsv(rows)} disabled={!rows.length}>
                <Download className="mr-1.5 h-4 w-4" /> Export
              </Button>
            </div>

            <div className="mt-5 overflow-hidden rounded-2xl border border-border bg-card">
              <div className="hidden grid-cols-[1.7fr_1fr_140px_120px_120px_100px_60px] gap-3 border-b border-border bg-muted/40 px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground md:grid">
                <div>College</div>
                <div>Program</div>
                <div>Seat / Quota</div>
                <div>Opening</div>
                <div>Closing</div>
                <div>Round</div>
                <div className="text-right">Year</div>
              </div>

              {dataQ.isLoading ? (
                <div className="px-5 py-10 text-center text-sm text-muted-foreground">Loading cutoffs…</div>
              ) : rows.length === 0 ? (
                <div className="px-5 py-12 text-center text-sm text-muted-foreground">
                  No rows match. Try clearing some filters.
                </div>
              ) : (
                <ul className="divide-y divide-border">
                  {rows.slice(0, 500).map((r, i) => (
                    <li key={i} className="grid grid-cols-2 gap-2 px-5 py-3 text-sm md:grid-cols-[1.7fr_1fr_140px_120px_120px_100px_60px] md:items-center md:gap-3">
                      <div className="min-w-0">
                        <div className="truncate font-medium">{r.short}</div>
                        <div className="truncate text-xs text-muted-foreground">{r.type}{r.state ? ` • ${r.state}` : ""}</div>
                      </div>
                      <div className="truncate" title={r.programClean}>{r.programClean}</div>
                      <div className="text-xs">
                        <div className="font-medium">{r.seatType}</div>
                        <div className="text-muted-foreground">{r.quota} • {r.gender.startsWith("Female") ? "F" : "GN"}</div>
                      </div>
                      <div className="font-mono tabular-nums">{r.opening?.toLocaleString() ?? "—"}</div>
                      <div className="font-mono font-semibold tabular-nums text-primary">{r.closing?.toLocaleString() ?? "—"}</div>
                      <div><span className="rounded-md bg-cream px-2 py-0.5 text-xs ring-1 ring-border">R{r.round}</span></div>
                      <div className="text-right text-xs text-muted-foreground">2025</div>
                    </li>
                  ))}
                  {rows.length > 500 ? (
                    <li className="border-t bg-muted/30 px-5 py-3 text-center text-xs text-muted-foreground">
                      Showing first 500 of {rows.length}. Narrow filters to see more.
                    </li>
                  ) : null}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}

function FG({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-foreground/70">{label}</div>
      {children}
    </div>
  );
}

function exportCsv(rows: any[]) {
  const header = ["Institute", "Type", "State", "Program", "Round", "Quota", "SeatType", "Gender", "Opening", "Closing"];
  const csv = [
    header.join(","),
    ...rows.map((r) =>
      [r.institute, r.type, r.state ?? "", r.programClean, r.round, r.quota, r.seatType, r.gender, r.opening ?? "", r.closing ?? ""]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(","),
    ),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "josaa-cutoffs.csv"; a.click();
  URL.revokeObjectURL(url);
}
