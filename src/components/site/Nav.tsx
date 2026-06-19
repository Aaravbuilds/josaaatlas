import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, X, LogOut, LayoutDashboard, Heart, ListChecks } from "lucide-react";
import { useState } from "react";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth, signOut } from "@/hooks/useAuth";

const links = [
  { to: "/", label: "Home" },
  { to: "/colleges", label: "Colleges" },
  { to: "/cutoffs", label: "Cutoffs" },
  { to: "/predictor", label: "Predictor" },
  { to: "/resources", label: "Resources" },
  { to: "/faqs", label: "FAQs" },
] as const;

export function Nav() {
  const [open, setOpen] = useState(false);
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/" });
  };

  const initials = (user?.user_metadata?.full_name || user?.email || "U")
    .split(/[\s@]/)
    .filter(Boolean)
    .map((s: string) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/75 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-3 sm:px-6">
        <Logo />
        <nav className="ml-6 hidden flex-1 items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: l.to === "/" }}
              className="group relative rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground data-[status=active]:text-primary"
            >
              {l.label}
              <span className="absolute inset-x-3 -bottom-[13px] h-[2px] scale-x-0 rounded-full bg-primary transition-transform group-data-[status=active]:scale-x-100" />
            </Link>
          ))}
        </nav>
        <div className="ml-auto hidden items-center gap-2 md:flex">
          {loading ? null : user ? (
            <>
              <Button asChild variant="ghost" size="sm" className="gap-2 text-foreground/80">
                <Link to="/dashboard"><LayoutDashboard className="h-4 w-4" /> Dashboard</Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-full border border-border/60 p-1 transition-colors hover:bg-muted">
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={user.user_metadata?.avatar_url} alt="" />
                      <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="truncate text-xs font-normal text-muted-foreground">
                    {user.email}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard"><LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard"><Heart className="mr-2 h-4 w-4" /> Saved Colleges</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard"><ListChecks className="mr-2 h-4 w-4" /> Preference Lists</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button
              asChild
              variant="outline"
              className="border-primary/30 text-primary hover:bg-primary/5"
            >
              <Link to="/auth">Sign In</Link>
            </Button>
          )}
        </div>
        <button
          onClick={() => setOpen((s) => !s)}
          className="ml-auto inline-flex h-10 w-10 items-center justify-center rounded-md border border-border md:hidden"
          aria-label="Toggle menu"
        >
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>
      {open ? (
        <div className="border-t border-border/60 bg-background/95 md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-muted data-[status=active]:bg-primary/5 data-[status=active]:text-primary"
              >
                {l.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-muted"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => { setOpen(false); handleSignOut(); }}
                  className="mt-2 rounded-md px-3 py-2 text-left text-sm font-medium text-destructive hover:bg-muted"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/auth"
                onClick={() => setOpen(false)}
                className="mt-2 rounded-md bg-primary px-3 py-2 text-center text-sm font-medium text-primary-foreground"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}
