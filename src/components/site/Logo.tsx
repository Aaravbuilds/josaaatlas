import { Link } from "@tanstack/react-router";

export function Logo({ tagline = true }: { tagline?: boolean }) {
  return (
    <Link to="/" className="group flex items-center gap-3">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm ring-1 ring-primary/20">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 3l8 4v5c0 4.5-3.4 8.4-8 9-4.6-.6-8-4.5-8-9V7l8-4z" strokeLinejoin="round" />
          <circle cx="12" cy="12" r="2.5" fill="currentColor" />
        </svg>
      </span>
      <div className="leading-tight">
        <div className="font-display text-xl font-semibold tracking-tight text-foreground">
          JoSAA Atlas
        </div>
        {tagline ? (
          <div className="text-[11px] font-medium text-muted-foreground">
            Navigate. Predict. Get Best.
          </div>
        ) : null}
      </div>
    </Link>
  );
}
