import { useNavigate } from "@tanstack/react-router";
import { Heart, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  useSavedColleges,
  useSaveCollege,
  isCollegeSaved,
  type SaveCollegeInput,
} from "@/hooks/useSavedColleges";
import { cn } from "@/lib/utils";

type Props = {
  college: SaveCollegeInput;
  size?: "sm" | "md";
  variant?: "icon" | "full";
  className?: string;
};

export function SaveCollegeButton({ college, size = "sm", variant = "full", className }: Props) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: saved } = useSavedColleges();
  const { save, remove } = useSaveCollege();

  const existing = isCollegeSaved(saved, college);
  const isSaved = !!existing;
  const busy = save.isPending || remove.isPending;

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate({ to: "/auth" });
      return;
    }
    if (existing) remove.mutate(existing.id);
    else save.mutate(college);
  };

  const base =
    "inline-flex items-center justify-center gap-1.5 rounded-full border font-medium transition-all duration-200 active:scale-95 disabled:opacity-50";
  const sized = size === "sm" ? "px-3 py-1 text-xs" : "px-4 py-1.5 text-sm";
  const tone = isSaved
    ? "border-primary/30 bg-primary/10 text-primary hover:bg-primary/15"
    : "border-border bg-card text-foreground/80 hover:border-primary/30 hover:text-primary";

  return (
    <button onClick={onClick} disabled={busy} className={cn(base, sized, tone, className)} aria-pressed={isSaved}>
      {busy ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Heart className={cn("h-3.5 w-3.5 transition-transform", isSaved && "fill-current scale-110")} />
      )}
      {variant === "full" && <span>{isSaved ? "Saved" : "Save"}</span>}
    </button>
  );
}
