import { createFileRoute, useNavigate, Link, ClientOnly } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Heart, ListPlus, Trash2, Plus, Pencil, GripVertical, ExternalLink, FolderOpen, Sparkles, X, Download } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useSavedColleges, useSaveCollege, type SavedCollege } from "@/hooks/useSavedColleges";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — My Counseling Workspace | JoSAA Atlas" },
      { name: "description", content: "Your personal JoSAA counseling workspace — saved colleges, shortlists, and preference lists in one place." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <SiteLayout>
      <ClientOnly fallback={<div className="mx-auto max-w-7xl px-4 py-16 text-muted-foreground">Loading…</div>}>
        <DashboardInner />
      </ClientOnly>
    </SiteLayout>
  );
}

type Tab = "saved" | "shortlists" | "recent";

function DashboardInner() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("saved");

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  if (loading || !user) {
    return <div className="mx-auto max-w-7xl px-4 py-16 text-muted-foreground">Loading your workspace…</div>;
  }

  const displayName = (user.user_metadata?.full_name as string) || user.email?.split("@")[0] || "there";

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border/60 pb-6">
        <div>
          <p className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-primary">
            <Sparkles className="h-3.5 w-3.5" /> My Counseling Workspace
          </p>
          <h1 className="mt-2 font-serif text-3xl text-foreground sm:text-4xl">Welcome back, {displayName}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Saved colleges, custom shortlists and your final preference order — all in one place.
          </p>
        </div>
        <Button asChild variant="outline" className="gap-2">
          <Link to="/predictor"><Plus className="h-4 w-4" /> Run a new prediction</Link>
        </Button>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex flex-wrap gap-1 rounded-xl border border-border/60 bg-card/40 p-1">
        {([
          { id: "saved", label: "Saved Colleges", icon: Heart },
          { id: "shortlists", label: "Shortlists", icon: FolderOpen },
          { id: "recent", label: "Recent Searches", icon: Sparkles },
        ] as const).map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={
                "inline-flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all " +
                (active ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted hover:text-foreground")
              }
            >
              <Icon className="h-4 w-4" /> {t.label}
            </button>
          );
        })}
      </div>

      <div className="mt-8">
        {tab === "saved" && <SavedSection />}
        {tab === "shortlists" && <ShortlistsSection />}
        {tab === "recent" && <RecentSection />}
      </div>
    </div>
  );
}

/* -------------------- SAVED -------------------- */
function SavedSection() {
  const { data, isLoading } = useSavedColleges();
  const { remove } = useSaveCollege();

  if (isLoading) return <SkeletonGrid />;
  if (!data || data.length === 0) {
    return (
      <EmptyState
        icon={<Heart className="h-6 w-6" />}
        title="No saved colleges yet"
        body="Use the Save button across the Predictor and Colleges pages to bookmark institutes you're considering."
        cta={<Button asChild><Link to="/predictor">Open Predictor</Link></Button>}
      />
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {data.map((c) => (
        <div key={c.id} className="group relative flex flex-col rounded-2xl border border-border/60 bg-card/60 p-5 shadow-sm transition-all hover:border-primary/30 hover:shadow-md">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-serif text-base leading-tight text-foreground">{c.institute}</h3>
            <button
              onClick={() => remove.mutate(c.id)}
              className="rounded-full p-1.5 text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
              aria-label="Remove"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          {c.program && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{c.program}</p>}
          <div className="mt-4 flex flex-wrap gap-1.5 text-[10px]">
            {c.seat_type && <span className="chip border border-border bg-muted/40">{c.seat_type}</span>}
            {c.quota && <span className="chip border border-border bg-muted/40">{c.quota}</span>}
            {c.closing_rank && <span className="chip border border-primary/20 bg-primary/5 text-primary">CR {c.closing_rank}</span>}
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3 text-xs">
            <Link
              to="/institutes/$institute"
              params={{ institute: encodeURIComponent(c.institute) }}
              className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
            >
              View <ExternalLink className="h-3 w-3" />
            </Link>
            <AddToShortlistButton college={c} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* -------------------- SHORTLISTS -------------------- */
type Shortlist = { id: string; name: string; description: string | null; created_at: string };
type ShortlistItem = { id: string; shortlist_id: string; institute: string; program: string | null; seat_type: string | null; quota: string | null; closing_rank: string | null; position: number };

function useShortlists() {
  return useQuery({
    queryKey: ["shortlists"],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from("shortlists").select("*").order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Shortlist[];
    },
  });
}

function useShortlistItems(shortlistId: string | null) {
  return useQuery({
    queryKey: ["shortlist_items", shortlistId],
    enabled: !!shortlistId,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("shortlist_items")
        .select("*")
        .eq("shortlist_id", shortlistId)
        .order("position", { ascending: true });
      if (error) throw error;
      return (data ?? []) as ShortlistItem[];
    },
  });
}

function ShortlistsSection() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: lists, isLoading } = useShortlists();
  const [active, setActive] = useState<string | null>(null);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    if (!active && lists && lists.length > 0) setActive(lists[0].id);
  }, [lists, active]);

  const createList = useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await (supabase as any).from("shortlists").insert({ name, user_id: user!.id }).select().single();
      if (error) throw error;
      return data as Shortlist;
    },
    onSuccess: (l) => {
      qc.invalidateQueries({ queryKey: ["shortlists"] });
      setActive(l.id);
      setNewName("");
    },
  });

  const deleteList = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from("shortlists").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["shortlists"] });
      setActive(null);
    },
  });

  const renameList = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const { error } = await (supabase as any).from("shortlists").update({ name }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["shortlists"] }),
  });

  if (isLoading) return <SkeletonGrid />;

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      {/* Sidebar */}
      <aside className="space-y-3">
        <div className="rounded-xl border border-border/60 bg-card/60 p-3">
          <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">My Lists</p>
          {!lists || lists.length === 0 ? (
            <p className="px-2 py-3 text-xs text-muted-foreground">No lists yet. Create one below.</p>
          ) : (
            <ul className="space-y-0.5">
              {lists.map((l) => (
                <li key={l.id}>
                  <button
                    onClick={() => setActive(l.id)}
                    className={
                      "flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-sm transition-colors " +
                      (active === l.id ? "bg-primary/10 text-primary" : "text-foreground/80 hover:bg-muted")
                    }
                  >
                    <span className="truncate">{l.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <form
          onSubmit={(e) => { e.preventDefault(); if (newName.trim()) createList.mutate(newName.trim()); }}
          className="flex gap-2"
        >
          <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="New list name…" className="h-9" />
          <Button type="submit" size="sm" disabled={!newName.trim() || createList.isPending}>
            <Plus className="h-4 w-4" />
          </Button>
        </form>
      </aside>

      {/* Detail */}
      <div>
        {active ? (
          <ShortlistDetail
            shortlist={lists!.find((l) => l.id === active)!}
            onDelete={() => deleteList.mutate(active)}
            onRename={(name) => renameList.mutate({ id: active, name })}
          />
        ) : (
          <EmptyState
            icon={<FolderOpen className="h-6 w-6" />}
            title="Create your first shortlist"
            body="Group your saved colleges into focused lists like Dream, Safe, or Final JoSAA preferences."
          />
        )}
      </div>
    </div>
  );
}

function ShortlistDetail({ shortlist, onDelete, onRename }: { shortlist: Shortlist; onDelete: () => void; onRename: (n: string) => void }) {
  const { data: items, isLoading } = useShortlistItems(shortlist.id);
  const { data: saved } = useSavedColleges();
  const qc = useQueryClient();
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(shortlist.name);
  const [adding, setAdding] = useState(false);

  useEffect(() => setName(shortlist.name), [shortlist.id, shortlist.name]);

  const invalidate = () => qc.invalidateQueries({ queryKey: ["shortlist_items", shortlist.id] });

  const addItem = useMutation({
    mutationFn: async (c: SavedCollege) => {
      const nextPos = (items?.length ?? 0);
      const { error } = await (supabase as any).from("shortlist_items").insert({
        shortlist_id: shortlist.id,
        user_id: user!.id,
        institute: c.institute,
        program: c.program,
        seat_type: c.seat_type,
        quota: c.quota,
        closing_rank: c.closing_rank,
        position: nextPos,
      });
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const removeItem = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from("shortlist_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const reorder = useMutation({
    mutationFn: async (next: ShortlistItem[]) => {
      // batch update positions
      for (let i = 0; i < next.length; i++) {
        await (supabase as any).from("shortlist_items").update({ position: i }).eq("id", next[i].id);
      }
    },
    onSuccess: invalidate,
  });

  const move = (from: number, to: number) => {
    if (!items) return;
    const next = [...items];
    const [m] = next.splice(from, 1);
    next.splice(to, 0, m);
    reorder.mutate(next);
  };

  const exportCSV = () => {
    if (!items) return;
    const rows = [["Order", "Institute", "Program", "Seat Type", "Quota", "Closing Rank"]];
    items.forEach((i, idx) => rows.push([String(idx + 1), i.institute, i.program ?? "", i.seat_type ?? "", i.quota ?? "", i.closing_rank ?? ""]));
    const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${shortlist.name.replace(/\s+/g, "_")}_preferences.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-2xl border border-border/60 bg-card/60 p-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border/60 pb-4">
        <div className="min-w-0 flex-1">
          {editing ? (
            <form onSubmit={(e) => { e.preventDefault(); onRename(name); setEditing(false); }} className="flex gap-2">
              <Input value={name} onChange={(e) => setName(e.target.value)} autoFocus />
              <Button size="sm" type="submit">Save</Button>
            </form>
          ) : (
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-2xl text-foreground">{shortlist.name}</h2>
              <button onClick={() => setEditing(true)} className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"><Pencil className="h-3.5 w-3.5" /></button>
            </div>
          )}
          <p className="mt-1 text-xs text-muted-foreground">{items?.length ?? 0} colleges in your preference order</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={exportCSV} className="gap-1.5"><Download className="h-3.5 w-3.5" /> CSV</Button>
          <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-1.5">Print</Button>
          <button onClick={onDelete} className="rounded-lg border border-border p-2 text-muted-foreground transition-colors hover:border-destructive/30 hover:text-destructive" aria-label="Delete list">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Items */}
      {isLoading ? (
        <div className="py-10 text-center text-sm text-muted-foreground">Loading…</div>
      ) : items && items.length > 0 ? (
        <ol className="mt-4 space-y-2">
          {items.map((it, i) => (
            <li key={it.id} className="group flex items-center gap-3 rounded-xl border border-border/60 bg-background/60 px-3 py-2.5 transition-all hover:border-primary/30">
              <div className="flex items-center gap-1">
                <button onClick={() => move(i, Math.max(0, i - 1))} disabled={i === 0} className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-30">▲</button>
                <button onClick={() => move(i, Math.min(items.length - 1, i + 1))} disabled={i === items.length - 1} className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-30">▼</button>
              </div>
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary/10 font-display text-xs font-semibold text-primary">{i + 1}</span>
              <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground/40" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{it.institute}</p>
                {it.program && <p className="truncate text-xs text-muted-foreground">{it.program} {it.seat_type && `· ${it.seat_type}`}</p>}
              </div>
              <button onClick={() => removeItem.mutate(it.id)} className="rounded p-1.5 text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100">
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ol>
      ) : (
        <p className="py-8 text-center text-sm text-muted-foreground">No colleges added yet. Pick from your saved list below.</p>
      )}

      {/* Add from saved */}
      <div className="mt-6 border-t border-border/60 pt-4">
        <button onClick={() => setAdding((s) => !s)} className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
          <Plus className="h-4 w-4" /> Add from saved colleges
        </button>
        {adding && (
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {!saved || saved.length === 0 ? (
              <p className="text-xs text-muted-foreground">No saved colleges yet.</p>
            ) : (
              saved
                .filter((s) => !items?.some((it) => it.institute === s.institute && (it.program ?? "") === (s.program ?? "")))
                .map((s) => (
                  <button
                    key={s.id}
                    onClick={() => addItem.mutate(s)}
                    className="flex items-start gap-2 rounded-lg border border-border bg-background/60 px-3 py-2 text-left text-xs transition-all hover:border-primary/30 hover:bg-primary/5"
                  >
                    <Plus className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                    <span>
                      <span className="block font-medium text-foreground">{s.institute}</span>
                      {s.program && <span className="text-muted-foreground">{s.program}</span>}
                    </span>
                  </button>
                ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function AddToShortlistButton({ college }: { college: SavedCollege }) {
  const { data: lists } = useShortlists();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const add = useMutation({
    mutationFn: async (listId: string) => {
      const { error } = await (supabase as any).from("shortlist_items").insert({
        shortlist_id: listId,
        user_id: user!.id,
        institute: college.institute,
        program: college.program,
        seat_type: college.seat_type,
        quota: college.quota,
        closing_rank: college.closing_rank,
        position: 999,
      });
      if (error) throw error;
    },
    onSuccess: (_d, listId) => {
      qc.invalidateQueries({ queryKey: ["shortlist_items", listId] });
      setOpen(false);
    },
  });

  return (
    <div className="relative">
      <button onClick={() => setOpen((s) => !s)} className="inline-flex items-center gap-1 text-muted-foreground hover:text-primary">
        <ListPlus className="h-3.5 w-3.5" /> Add to list
      </button>
      {open && (
        <div className="absolute right-0 z-10 mt-1 w-48 rounded-lg border border-border bg-popover p-1 shadow-lg">
          {!lists || lists.length === 0 ? (
            <p className="px-2 py-2 text-xs text-muted-foreground">No lists yet</p>
          ) : (
            lists.map((l) => (
              <button
                key={l.id}
                onClick={() => add.mutate(l.id)}
                className="block w-full truncate rounded px-2 py-1.5 text-left text-xs hover:bg-muted"
              >
                {l.name}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

/* -------------------- RECENT SEARCHES -------------------- */
function RecentSection() {
  const { data, isLoading } = useQuery({
    queryKey: ["recent_searches"],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from("recent_searches").select("*").order("created_at", { ascending: false }).limit(20);
      if (error) throw error;
      return data as { id: string; payload: any; created_at: string }[];
    },
  });

  if (isLoading) return <SkeletonGrid />;
  if (!data || data.length === 0) {
    return (
      <EmptyState
        icon={<Sparkles className="h-6 w-6" />}
        title="No recent predictions yet"
        body="Your most recent Predictor runs will appear here. Click any of them to re-run with the same filters."
        cta={<Button asChild><Link to="/predictor">Open Predictor</Link></Button>}
      />
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {data.map((s) => (
        <Link
          key={s.id}
          to="/predictor"
          className="rounded-xl border border-border/60 bg-card/60 p-4 text-sm transition-all hover:border-primary/30 hover:shadow-sm"
        >
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{new Date(s.created_at).toLocaleDateString()}</span>
            <span>{s.payload?.exam ?? "JEE"}</span>
          </div>
          <p className="mt-2 font-display text-lg text-foreground">Rank {s.payload?.rank ?? "—"}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{s.payload?.category ?? "OPEN"} · {s.payload?.state ?? "All India"}</p>
        </Link>
      ))}
    </div>
  );
}

/* -------------------- helpers -------------------- */
function EmptyState({ icon, title, body, cta }: { icon: React.ReactNode; title: string; body: string; cta?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-border/70 bg-card/30 px-6 py-16 text-center">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">{icon}</div>
      <h3 className="mt-4 font-serif text-xl text-foreground">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{body}</p>
      {cta && <div className="mt-5">{cta}</div>}
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-40 animate-pulse rounded-2xl border border-border/40 bg-muted/20" />
      ))}
    </div>
  );
}
