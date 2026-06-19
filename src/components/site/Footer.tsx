import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border/70 bg-parchment/40">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div className="space-y-3">
          <Logo />
          <p className="max-w-xs text-sm text-muted-foreground">
            Your trusted guide to JoSAA counseling. Predict. Plan. Get Your Best.
          </p>
        </div>
        <FooterCol
          title="Explore"
          items={[
            { to: "/colleges", label: "Colleges" },
            { to: "/cutoffs", label: "Cutoffs" },
            { to: "/predictor", label: "Predictor" },
            { to: "/predictor", label: "Rank Predictor" },
          ]}
        />
        <FooterCol
          title="Resources"
          items={[
            { to: "/resources", label: "JoSAA Process" },
            { to: "/cutoffs", label: "Opening & Closing Rank" },
            { to: "/cutoffs", label: "Category Wise Cutoffs" },
            { to: "/faqs", label: "FAQs" },
          ]}
        />
        <div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <h4 className="font-display text-lg font-semibold">Built for JEE Aspirants</h4>
            <p className="mt-1 text-sm text-muted-foreground">
              Focused on accuracy. Built with trust.
            </p>
          </div>
        </div>
      </div>
      <div className="border-t border-border/70 py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} JoSAA Atlas. Built on official JoSAA 2025 data.
      </div>
    </footer>
  );
}

function FooterCol({ title, items }: { title: string; items: { to: string; label: string }[] }) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-foreground">{title}</h4>
      <ul className="mt-3 space-y-2">
        {items.map((it, i) => (
          <li key={i}>
            <Link to={it.to} className="text-sm text-muted-foreground transition-colors hover:text-primary">
              {it.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
