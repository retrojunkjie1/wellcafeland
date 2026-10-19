import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../firebase";
import Logo from "../../components/Logo";

function getSafeReturnPath(from, origin) {
  const raw = typeof from === "string"
    ? from
    : from?.pathname
      ? `${from.pathname}${from.search || ""}${from.hash || ""}`
      : "";
  if (!raw.startsWith("/") || raw.startsWith("//") || raw.includes("\\")) return "";
  try {
    const target = new URL(raw, origin);
    return target.origin === origin ? `${target.pathname}${target.search}${target.hash}` : "";
  } catch {
    return "";
  }
}

function resetErrorMessage(error) {
  if (error?.code === "auth/invalid-email") return "Enter a valid email address and try again.";
  if (error?.code === "auth/too-many-requests") return "Too many requests were made. Wait a few minutes, then try again.";
  if (error?.code === "auth/network-request-failed") return "We couldn’t connect just now. Check your internet connection and try again.";
  return "We couldn’t request a reset link right now. Try again in a few minutes.";
}

export default function ForgotPasswordPage() {
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setSent(false);
    if (!auth) {
      setError("Password reset is temporarily unavailable. Please try again later or contact WellnessCafe support.");
      return;
    }

    setBusy(true);
    try {
      const continueUrl = new URL("/login?passwordReset=1", window.location.origin);
      const returnTo = getSafeReturnPath(location.state?.from, window.location.origin);
      if (returnTo) continueUrl.searchParams.set("returnTo", returnTo);
      await sendPasswordResetEmail(auth, email.trim(), {
        url: continueUrl.toString(),
        handleCodeInApp: false,
      });
      setSent(true);
    } catch (resetError) {
      // Keep the same confirmation for unknown addresses to avoid revealing
      // which email addresses have WellnessCafe accounts.
      if (resetError?.code === "auth/user-not-found") setSent(true);
      else setError(resetErrorMessage(resetError));
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-[70vh] bg-slate-950 px-4 py-10 text-white sm:py-16">
      <section className="mx-auto w-full max-w-lg rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.025] p-6 shadow-2xl sm:p-9">
        <div className="mb-8 flex justify-center"><Logo variant="default" size="md" showText /></div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-100/70">Account recovery</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">Reset your password</h1>
        <p className="mt-3 leading-relaxed text-white/65">Enter the email used for your account. If it’s registered, we’ll send a secure reset link.</p>

        {sent ? (
          <div role="status" aria-live="polite" className="mt-6 rounded-2xl border border-emerald-200/20 bg-emerald-100/[0.05] p-4">
            <h2 className="font-medium text-emerald-50">Check your email</h2>
            <p className="mt-2 break-words text-sm leading-relaxed text-white/70">If an account exists for <span className="font-medium text-white">{email.trim()}</span>, a password reset link is on its way. Check your inbox and spam folder, then follow the link to choose a new password.</p>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-4">
            <label htmlFor="reset-email" className="block text-sm font-medium text-white/80">Email address</label>
            <input
              id="reset-email"
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              required
              maxLength={254}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={busy}
              className="min-h-12 w-full rounded-xl border border-white/15 bg-slate-950/70 px-4 text-base text-white outline-none transition placeholder:text-white/35 focus:border-amber-100/55 focus:ring-2 focus:ring-amber-100/15 disabled:opacity-60"
              placeholder="you@example.com"
            />
            {error && <p role="alert" className="rounded-xl border border-rose-200/20 bg-rose-100/[0.05] p-3 text-sm leading-relaxed text-rose-100">{error}</p>}
            <button type="submit" disabled={busy || !email.trim()} className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-amber-200 px-5 font-semibold text-slate-950 transition hover:bg-amber-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-100 disabled:cursor-wait disabled:opacity-55">
              {busy ? "Requesting link…" : "Send reset link"}
            </button>
          </form>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5 text-sm">
          <Link to="/login" state={location.state} className="min-h-11 inline-flex items-center text-amber-100/90 underline underline-offset-4 hover:text-amber-50">Back to sign in</Link>
          {sent && <button type="button" onClick={() => { setSent(false); setError(""); }} className="min-h-11 rounded-lg px-2 text-white/65 underline underline-offset-4 hover:text-white">Try another email</button>}
        </div>
      </section>
    </main>
  );
}
