import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type SavedCollege = {
  id: string;
  user_id: string;
  institute: string;
  program: string | null;
  year: string | null;
  round: string | null;
  quota: string | null;
  seat_type: string | null;
  gender: string | null;
  closing_rank: string | null;
  notes: string | null;
  created_at: string;
};

export type SaveCollegeInput = Omit<SavedCollege, "id" | "user_id" | "created_at">;

const KEY = ["saved_colleges"] as const;

export function useSavedColleges() {
  const { user } = useAuth();
  return useQuery({
    queryKey: [...KEY, user?.id ?? "anon"],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("saved_colleges")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as SavedCollege[];
    },
  });
}

export function useSaveCollege() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const save = useMutation({
    mutationFn: async (input: SaveCollegeInput) => {
      if (!user) throw new Error("Not signed in");
      const { data, error } = await (supabase as any)
        .from("saved_colleges")
        .insert({ ...input, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data as SavedCollege;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from("saved_colleges").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  return { save, remove };
}

export function isCollegeSaved(saved: SavedCollege[] | undefined, input: Pick<SaveCollegeInput, "institute" | "program">) {
  if (!saved) return undefined;
  return saved.find(
    (s) => s.institute === input.institute && (s.program ?? "") === (input.program ?? ""),
  );
}
