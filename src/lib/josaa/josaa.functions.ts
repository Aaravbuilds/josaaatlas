import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import {
  branchGroup,
  classifyInstitute,
  cleanProgram,
  inferState,
  parseRank,
  recommend,
  shortName,
} from "./data";

function sb() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL!;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY!;
  return createClient(url, key, { auth: { persistSession: false } });
}

export type Row = {
  institute: string;
  short: string;
  type: "IIT" | "NIT" | "IIIT" | "GFTI";
  state: string | null;
  program: string;
  programClean: string;
  branchGroup: string;
  round: string;
  quota: string;
  seatType: string;
  gender: string;
  opening: number | null;
  closing: number | null;
};

async function fetchAll(): Promise<Row[]> {
  // Page through all rows
  const supabase = sb();
  const pageSize = 1000;
  let from = 0;
  const out: Row[] = [];
  while (true) {
    const { data, error } = await supabase
      .from("cutoffs")
      .select("*")
      .range(from, from + pageSize - 1);
    if (error) throw error;
    if (!data || data.length === 0) break;
    for (const r of data as any[]) {
      const inst = (r.Institute ?? "").trim();
      if (!inst) continue;
      const prog = (r.Program ?? "").trim();
      out.push({
        institute: inst,
        short: shortName(inst),
        type: classifyInstitute(inst),
        state: inferState(inst),
        program: prog,
        programClean: cleanProgram(prog),
        branchGroup: branchGroup(prog),
        round: String(r.Round ?? ""),
        quota: String(r.Quota ?? ""),
        seatType: String(r["Seat Type"] ?? ""),
        gender: String(r.Gender ?? ""),
        opening: parseRank(r["Opening Rank"]),
        closing: parseRank(r["Closing Rank"]),
      });
    }
    if (data.length < pageSize) break;
    from += pageSize;
  }
  return out;
}

// In-memory cache, refreshed every 30 min. Server only.
let cache: { at: number; rows: Row[] } | null = null;
async function getRows(): Promise<Row[]> {
  if (cache && Date.now() - cache.at < 30 * 60_000) return cache.rows;
  const rows = await fetchAll();
  cache = { at: Date.now(), rows };
  return rows;
}

// ----- Public server fns -----

export const getMeta = createServerFn({ method: "GET" }).handler(async () => {
  const rows = await getRows();
  const institutes = new Set<string>();
  const branchGroups = new Set<string>();
  const programs = new Set<string>();
  const states = new Set<string>();
  for (const r of rows) {
    institutes.add(r.institute);
    branchGroups.add(r.branchGroup);
    programs.add(r.programClean);
    if (r.state) states.add(r.state);
  }
  return {
    total: rows.length,
    institutes: [...institutes].sort(),
    branchGroups: [...branchGroups].sort(),
    programs: [...programs].sort(),
    states: [...states].sort(),
    counts: {
      IIT: rows.filter((r) => r.type === "IIT").length,
      NIT: rows.filter((r) => r.type === "NIT").length,
      IIIT: rows.filter((r) => r.type === "IIIT").length,
      GFTI: rows.filter((r) => r.type === "GFTI").length,
      institutes: institutes.size,
      programs: programs.size,
    },
  };
});

const FilterSchema = z.object({
  query: z.string().optional(),
  types: z.array(z.string()).optional(),
  states: z.array(z.string()).optional(),
  branchGroups: z.array(z.string()).optional(),
  institutes: z.array(z.string()).optional(),
  quotas: z.array(z.string()).optional(),
  seatTypes: z.array(z.string()).optional(),
  genders: z.array(z.string()).optional(),
  rounds: z.array(z.string()).optional(),
  limit: z.number().int().min(1).max(2000).optional(),
});

export const queryCutoffs = createServerFn({ method: "POST" })
  .inputValidator(FilterSchema)
  .handler(async ({ data }) => {
    const rows = await getRows();
    const q = data.query?.toLowerCase().trim();
    const filtered = rows.filter((r) => {
      if (data.types?.length && !data.types.includes(r.type)) return false;
      if (data.states?.length && (!r.state || !data.states.includes(r.state))) return false;
      if (data.branchGroups?.length && !data.branchGroups.includes(r.branchGroup)) return false;
      if (data.institutes?.length && !data.institutes.includes(r.institute)) return false;
      if (data.quotas?.length && !data.quotas.includes(r.quota)) return false;
      if (data.seatTypes?.length && !data.seatTypes.includes(r.seatType)) return false;
      if (data.genders?.length && !data.genders.includes(r.gender)) return false;
      if (data.rounds?.length && !data.rounds.includes(r.round)) return false;
      if (q) {
        const hay = `${r.institute} ${r.short} ${r.programClean}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    const limit = data.limit ?? 500;
    return { total: filtered.length, rows: filtered.slice(0, limit) };
  });

const PredictSchema = z.object({
  rank: z.number().int().min(1).max(2_000_000),
  seatType: z.string().default("OPEN"),
  gender: z.string().default("Gender-Neutral"),
  homeState: z.string().nullable().optional(),
  types: z.array(z.string()).optional(),
  branchGroups: z.array(z.string()).optional(),
  states: z.array(z.string()).optional(),
  institutes: z.array(z.string()).optional(),
  rounds: z.array(z.string()).optional(),
});

export type Prediction = {
  institute: string;
  short: string;
  type: "IIT" | "NIT" | "IIIT" | "GFTI";
  state: string | null;
  program: string;
  programClean: string;
  branchGroup: string;
  round: string;
  quota: string;
  seatType: string;
  closing: number;
  opening: number | null;
  chance: number;
  label: "Safe" | "Moderate" | "Risky" | "Very Risky";
  diff: number;
};

export const predict = createServerFn({ method: "POST" })
  .inputValidator(PredictSchema)
  .handler(async ({ data }) => {
    const rows = await getRows();
    const wantedRounds = new Set(data.rounds && data.rounds.length ? data.rounds : ["6"]);
    const types = new Set(data.types && data.types.length ? data.types : ["IIT", "NIT", "IIIT", "GFTI"]);
    const branches = data.branchGroups && data.branchGroups.length ? new Set(data.branchGroups) : null;
    const states = data.states && data.states.length ? new Set(data.states) : null;
    const insts = data.institutes && data.institutes.length ? new Set(data.institutes) : null;
    const home = data.homeState ?? null;

    // For each (institute, program, round) keep the most relevant row for the seat type + gender + applicable quota.
    const best = new Map<string, Prediction>();
    for (const r of rows) {
      if (!wantedRounds.has(r.round)) continue;
      if (!types.has(r.type)) continue;
      if (branches && !branches.has(r.branchGroup)) continue;
      if (states && (!r.state || !states.has(r.state))) continue;
      if (insts && !insts.has(r.institute)) continue;
      if (r.seatType !== data.seatType) continue;
      if (r.gender !== data.gender) continue;
      if (r.closing == null) continue;

      // Quota gating
      if (r.quota === "HS" && (!home || r.state !== home)) continue;
      if (r.quota === "OS" && home && r.state === home) continue;
      // AI / GO / JK / LA — include as-is (rare special pools)

      const rec = recommend(data.rank, r.closing);
      const key = `${r.institute}|${r.program}|${r.round}|${r.quota}`;
      const cur = best.get(key);
      if (!cur || rec.chance > cur.chance) {
        best.set(key, {
          institute: r.institute,
          short: r.short,
          type: r.type,
          state: r.state,
          program: r.program,
          programClean: r.programClean,
          branchGroup: r.branchGroup,
          round: r.round,
          quota: r.quota,
          seatType: r.seatType,
          closing: r.closing,
          opening: r.opening,
          chance: rec.chance,
          label: rec.label,
          diff: rec.diff,
        });
      }
    }

    const list = [...best.values()].sort((a, b) => b.chance - a.chance);
    return {
      total: list.length,
      safe: list.filter((r) => r.label === "Safe").length,
      moderate: list.filter((r) => r.label === "Moderate").length,
      risky: list.filter((r) => r.label === "Risky" || r.label === "Very Risky").length,
      rows: list.slice(0, 600),
    };
  });

const TrendSchema = z.object({
  institute: z.string(),
  program: z.string(),
  seatType: z.string().default("OPEN"),
  gender: z.string().default("Gender-Neutral"),
  quota: z.string().optional(),
});

export const getTrend = createServerFn({ method: "POST" })
  .inputValidator(TrendSchema)
  .handler(async ({ data }) => {
    const rows = await getRows();
    const matched = rows.filter(
      (r) =>
        r.institute === data.institute &&
        r.program === data.program &&
        r.seatType === data.seatType &&
        r.gender === data.gender &&
        (!data.quota || r.quota === data.quota)
    );
    const byRound = new Map<string, { round: string; opening: number | null; closing: number | null }>();
    for (const r of matched) {
      if (!byRound.has(r.round)) byRound.set(r.round, { round: r.round, opening: r.opening, closing: r.closing });
    }
    return [...byRound.values()].sort((a, b) => Number(a.round) - Number(b.round));
  });

const InstituteSchema = z.object({
  institute: z.string().min(1).max(300),
  seatType: z.string().default("OPEN"),
  gender: z.string().default("Gender-Neutral"),
});

export type ProgramSummary = {
  program: string;
  programClean: string;
  branchGroup: string;
  minClosing: number | null;
  maxClosing: number | null;
  latestClosing: number | null;
  trend: { round: string; opening: number | null; closing: number | null }[];
};

export const getInstituteDetail = createServerFn({ method: "POST" })
  .inputValidator(InstituteSchema)
  .handler(async ({ data }) => {
    const rows = await getRows();
    const all = rows.filter((r) => r.institute === data.institute);
    if (!all.length) return null;
    const head = all[0];
    const scoped = all.filter(
      (r) => r.seatType === data.seatType && r.gender === data.gender,
    );

    // Group by program
    const byProg = new Map<string, Row[]>();
    for (const r of scoped) {
      const k = r.program;
      const arr = byProg.get(k) ?? [];
      arr.push(r);
      byProg.set(k, arr);
    }
    const programs: ProgramSummary[] = [];
    for (const [program, list] of byProg) {
      // Prefer AI/OS quota for stats — pick the row set with the most rows
      const byQuota = new Map<string, Row[]>();
      for (const r of list) {
        const a = byQuota.get(r.quota) ?? [];
        a.push(r);
        byQuota.set(r.quota, a);
      }
      let pick: Row[] = list;
      let pickSize = -1;
      for (const v of byQuota.values()) if (v.length > pickSize) { pick = v; pickSize = v.length; }

      const closings = pick.map((r) => r.closing).filter((x): x is number => x != null);
      const byRound = new Map<string, { round: string; opening: number | null; closing: number | null }>();
      for (const r of pick) {
        if (!byRound.has(r.round)) byRound.set(r.round, { round: r.round, opening: r.opening, closing: r.closing });
      }
      const trend = [...byRound.values()].sort((a, b) => Number(a.round) - Number(b.round));
      const latest = trend.length ? trend[trend.length - 1].closing : null;

      programs.push({
        program,
        programClean: pick[0].programClean,
        branchGroup: pick[0].branchGroup,
        minClosing: closings.length ? Math.min(...closings) : null,
        maxClosing: closings.length ? Math.max(...closings) : null,
        latestClosing: latest,
        trend,
      });
    }
    programs.sort((a, b) => (a.latestClosing ?? Infinity) - (b.latestClosing ?? Infinity));

    // Branch group breakdown
    const groupMap = new Map<string, number>();
    for (const p of programs) groupMap.set(p.branchGroup, (groupMap.get(p.branchGroup) ?? 0) + 1);
    const branchBreakdown = [...groupMap.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    // Overall rank curve (lowest closing across all programs per round)
    const roundCurve = new Map<string, number[]>();
    for (const p of programs) {
      for (const t of p.trend) {
        if (t.closing == null) continue;
        const a = roundCurve.get(t.round) ?? [];
        a.push(t.closing);
        roundCurve.set(t.round, a);
      }
    }
    const overall = [...roundCurve.entries()]
      .map(([round, arr]) => ({
        round,
        best: Math.min(...arr),
        median: arr.sort((a, b) => a - b)[Math.floor(arr.length / 2)],
        worst: Math.max(...arr),
      }))
      .sort((a, b) => Number(a.round) - Number(b.round));

    return {
      institute: head.institute,
      short: head.short,
      type: head.type,
      state: head.state,
      totalPrograms: programs.length,
      totalRows: all.length,
      branchGroups: branchBreakdown,
      programs,
      overall,
    };
  });
