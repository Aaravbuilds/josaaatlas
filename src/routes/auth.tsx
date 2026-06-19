import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ClientOnly } from "@tanstack/react-router";
import { Mail, KeyRound, ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth, sendEmailOtp, verifyEmailOtp } from "@/hooks/useAuth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — JoSAA Atlas" },
      { name: "description", content: "Sign in to JoSAA Atlas with a secure email code to unlock your personal counseling workspace." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  return (
    <SiteLayout>
      <ClientOnly fallback={<div className="mx-auto max-w-md px-4 py-24 text-center text-muted-foreground">Loading…</div>}>
        <AuthInner />
      </ClientOnly>
    </SiteLayout>
  );
}

type Step = "email" | "otp" | "success";

function AuthInner() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/dashboard" });
  }, [loading, user, navigate]);

  const sendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setBusy(true);
    const { error: err } = await sendEmailOtp(email);
    setBusy(false);
    if (err) return setError(err.message);
    setStep("otp");
  };

  const verifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (code.length < 6) {
      setError("Enter the 6-digit code from your email.");
      return;
    }
    setBusy(true);
    const { error: err } = await verifyEmailOtp(email, code);
    setBusy(false);
    if (err) return setError(err.message);
    setStep("success");
    setTimeout(() => navigate({ to: "/dashboard" }), 700);
  };

  const resend = async () => {
    setError(null);
    setBusy(true);
    const { error: err } = await sendEmailOtp(email);
    setBusy(false);
    if (err) setError(err.message);
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16">
      <div className="rounded-2xl border border-border/60 bg-card/70 p-8 shadow-[0_10px_40px_-20px_rgba(120,30,40,0.25)] backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
            {step === "success" ? <CheckCircle2 className="h-5 w-5" /> : step === "otp" ? <KeyRound className="h-5 w-5" /> : <Mail className="h-5 w-5" />}
          </div>
          <div>
            <h1 className="font-serif text-2xl text-foreground">
              {step === "email" && "Welcome to JoSAA Atlas"}
              {step === "otp" && "Email Verification"}
              {step === "success" && "You're in"}
            </h1>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {step === "email" && "Sign in with your email — no password needed."}
              {step === "otp" && `We sent a 6-digit code to ${email}`}
              {step === "success" && "Taking you to your workspace…"}
            </p>
          </div>
        </div>

        {step === "email" && (
          <form onSubmit={sendCode} className="mt-7 space-y-3">
            <label className="text-xs font-medium text-muted-foreground">Email address</label>
            <Input
              type="email"
              autoFocus
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={busy}
              className="h-11"
            />
            <Button type="submit" disabled={busy} className="mt-2 w-full gap-2" size="lg">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
              {busy ? "Sending code…" : "Continue with Email"}
            </Button>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={verifyCode} className="mt-7 space-y-3">
            <label className="text-xs font-medium text-muted-foreground">Verification code</label>
            <Input
              inputMode="numeric"
              autoFocus
              maxLength={6}
              placeholder="••••••"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              disabled={busy}
              className="h-12 text-center font-display text-2xl tracking-[0.5em]"
            />
            <Button type="submit" disabled={busy || code.length < 6} className="mt-2 w-full gap-2" size="lg">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {busy ? "Verifying…" : "Verify & Sign in"}
            </Button>
            <div className="flex items-center justify-between pt-1 text-xs">
              <button type="button" onClick={() => { setStep("email"); setCode(""); setError(null); }} className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-3 w-3" /> Change email
              </button>
              <button type="button" onClick={resend} disabled={busy} className="text-primary hover:underline disabled:opacity-50">
                Resend code
              </button>
            </div>
          </form>
        )}

        {step === "success" && (
          <div className="mt-7 rounded-lg bg-success/10 px-4 py-6 text-center text-sm text-success">
            Signed in successfully.
          </div>
        )}

        {error && (
          <p className="mt-4 rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">{error}</p>
        )}

        <p className="mt-8 text-center text-xs text-muted-foreground">
          New here?{" "}
          <Link to="/" className="text-primary underline-offset-4 hover:underline">
            Explore first
          </Link>
        </p>
      </div>
    </div>
  );
}
