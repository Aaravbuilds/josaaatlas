import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Building2, Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { z } from "zod";
import { SiteLayout } from "@/components/site/SiteLayout";
import { MultiSelect } from "@/components/site/MultiSelect";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { getMeta, queryCutoffs } from "@/lib/josaa/josaa.functions";
import { BRANCH_GROUPS, INSTITUTE_TYPES } from "@/lib/josaa/data";

const searchSchema = z.object({
  q: z.string().optional(),
  types: z.array(z.string()).optional(),
  states: z.array(z.string()).optional(),
  branches: z.array(z.string()).optional(),
});

export const Route = createFileRoute("/colleges")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Colleges — JoSAA Atlas" },
      { name: "description", content: "Browse all 128 IITs, NITs, IIITs and GFTIs in the JoSAA 2025 counseling system." },
    ],
  }),
  component: CollegesPage,
});

function CollegesPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const [q, setQ] = useState(search.q ?? "");

  const types = search.types ?? [];
  const states = search.states ?? [];
  const branches = search.branches ?? [];

  const metaQ = useQuery({ queryKey: ["josaa-meta"], queryFn: () => getMeta(), staleTime: 5 * 60_000 });

  const cutoffsQ = useQuery({
    queryKey: ["colleges", q, types, states, branches],
    queryFn: () =>
      queryCutoffs({
        data: { query: q, types, states, branchGroups: branches, limit: 2000 },
      }),
    staleTime: 60_000,
  });

  const colleges = useMemo(() => {
    if (!cutoffsQ.data) return [] as { institute: string; short: string; type: string; state: string | null; programs: number }[];
    const map = new Map<string, { institute: string; short: string; type: string; state: string | null; programs: Set<string> }>();
    for (const r of cutoffsQ.data.rows) {
      const ex = map.get(r.institute);
      if (ex) ex.programs.add(r.programClean);
      else map.set(r.institute, { institute: r.institute, short: r.short, type: r.type, state: r.state, programs: new Set([r.programClean]) });
    }
    return [...map.values()]
      .map((c) => ({ ...c, programs: c.programs.size }))
      .sort((a, b) => a.institute.localeCompare(b.institute));
  }, [cutoffsQ.data]);

  const Filters = (
    <div className="space-y-5">
      <div>
        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-foreground/70">Institute Type</div>
        <MultiSelect
          options={INSTITUTE_TYPES.map((t) => ({ value: t, label: t }))}
          value={types}
          onChange={(v) => navigate({ search: (p: any) => ({ ...p, types: v }) })}
          placeholder="All types"
        />
      </div>
      <div>
        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-foreground/70">State</div>
        <MultiSelect
          options={(metaQ.data?.states ?? []).map((s) => ({ value: s, label: s }))}
          value={states}
          onChange={(v) => navigate({ search: (p: any) => ({ ...p, states: v }) })}
          placeholder="All states"
        />
      </div>
      <div>
        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-foreground/70">Branch Group</div>
        <MultiSelect
          options={BRANCH_GROUPS.map((b) => ({ value: b, label: b }))}
          value={branches}
          onChange={(v) => navigate({ search: (p: any) => ({ ...p, branches: v }) })}
          placeholder="All branches"
        />
      </div>
    </div>
  );

  return (
    <SiteLayout>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-4xl font-semibold tracking-tight">Colleges</h1>
            <p className="mt-2 text-muted-foreground">
              Explore every institute in JoSAA 2025 — IITs, NITs, IIITs and GFTIs.
            </p>
          </div>
          <div className="hidden text-right text-xs text-muted-foreground sm:block">
            {colleges.length} institutes • {cutoffsQ.data?.total.toLocaleString() ?? "—"} matching cutoff rows
          </div>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-[280px_1fr]">
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
                  onBlur={() => navigate({ search: (p: any) => ({ ...p, q: q || undefined }) })}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") navigate({ search: (p: any) => ({ ...p, q: q || undefined }) });
                  }}
                  placeholder="Search NIT Trichy, IIT Bombay, IIIT Hyderabad…"
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
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {cutoffsQ.isLoading
                ? Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className="h-28 animate-pulse rounded-2xl border border-border bg-muted/40" />
                  ))
                : colleges.map((c) => (
                    <Link
                      key={c.institute}
                      to="/institutes/$institute"
                      params={{ institute: encodeURIComponent(c.institute) }}
                      className="group rounded-2xl border border-border bg-card p-5 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
                    >
                      <div className="flex items-start gap-3">
                        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/15">
                          <Building2 className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold leading-tight">{c.short}</div>
                          <div className="line-clamp-2 text-xs text-muted-foreground">{c.institute}</div>
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-1.5 text-[11px]">
                        <span className="rounded-full bg-cream px-2 py-0.5 font-medium ring-1 ring-border">{c.type}</span>
                        {c.state ? <span className="rounded-full bg-cream px-2 py-0.5 ring-1 ring-border">{c.state}</span> : null}
                        <span className="rounded-full bg-muted px-2 py-0.5 text-muted-foreground">{c.programs} programs</span>
                      </div>
                    </Link>
                  ))}
            </div>
            {!cutoffsQ.isLoading && colleges.length === 0 ? (
              <div className="mt-10 rounded-2xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
                No institutes match your filters.
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
