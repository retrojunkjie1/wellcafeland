import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { reload, sendEmailVerification } from "firebase/auth";
import { auth } from "../../firebase";
import { useAuth } from "../../context/AuthContext";
import Logo from "../../components/Logo";

function getContinueUrl(destination) {
  const url = new URL("/verify-email", window.location.origin);
  url.searchParams.set("verified", "1");
  url.searchParams.set("next", destination);
  return url.toString();
}

export default function VerifyEmailPage() {
  const { user, loading: authLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search);
  const destination = location.state?.destination || query.get("next") || "/home";
  const email = location.state?.email || user?.email || "your email address";
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(() => {
    if (location.state?.deliveryError) return "Your account was created, but we couldn’t send the verification email. Sign in to try again.";
    if (location.state?.setupIssue) return "Your account was created and the verification email was sent, but setup did not finish. Verify your email, then sign in to continue.";
    if (query.get("verified") === "1") return "Email verified. Sign in to continue to your WellnessCafe space.";
    return "We sent a verification link. Open it to verify your email, then sign in to continue.";
  });
  const [error, setError] = useState("");

  const checkStatus = async () => {
    setError("");
    setBusy(true);
    try {
      if (!auth?.currentUser) {
        navigate("/login", { state: { from: { pathname: destination } } });
        return;
      }
      await reload(auth.currentUser);
      if (auth.currentUser.emailVerified) {
        navigate(destination, { replace: true });
      } else {
        setMessage("It’s not verified yet. Open the latest email link, then check again.");
      }
    } catch {
      setError("We couldn’t check verification just now. Sign in again and retry.");
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    setError("");
    setBusy(true);
    try {
      if (!auth?.currentUser || auth.currentUser.emailVerified) {
        navigate("/login", { state: { from: { pathname: destination } } });
        return;
      }
      await sendEmailVerification(auth.currentUser, {
        url: getContinueUrl(destination),
        handleCodeInApp: false,
      });
      setMessage(`A fresh verification link was sent to ${auth.currentUser.email}.`);
    } catch (sendError) {
      setError(sendError?.code === "auth/too-many-requests"
        ? "Too many requests in a short time. Wait a few minutes before trying again."
        : "We couldn’t send the email. Sign in again to retry, or check that the address is correct.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-[70vh] bg-slate-950 px-4 py-12 text-white">
      <section className="mx-auto max-w-xl rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.025] p-6 shadow-2xl sm:p-9">
        <div className="mb-7 flex justify-center"><Logo variant="default" size="md" showText /></div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-100/70">One quick account check</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">Verify your email</h1>
        <p className="mt-3 leading-relaxed text-white/70">We sent a secure link to <span className="font-medium text-white">{email}</span>. Verify your address before continuing to your WellnessCafe space.</p>
        <p className="mt-3 text-sm leading-relaxed text-white/55">If it’s not in your inbox, check spam or promotions. You can sign in to request a fresh link.</p>
        {message && <p role="status" className="mt-5 rounded-xl border border-emerald-200/15 bg-emerald-100/[0.05] p-4 text-sm leading-relaxed text-emerald-50">{message}</p>}
        {error && <p role="alert" className="mt-4 rounded-xl border border-rose-200/20 bg-rose-100/[0.05] p-4 text-sm leading-relaxed text-rose-100">{error}</p>}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          {user && !user.isAnonymous && !user.emailVerified && !authLoading ? (
            <>
              <button type="button" onClick={checkStatus} disabled={busy} className="min-h-12 rounded-xl bg-amber-200 px-5 font-semibold text-slate-950 disabled:opacity-60">{busy ? "Checking…" : "I’ve verified — check"}</button>
              <button type="button" onClick={resend} disabled={busy} className="min-h-12 rounded-xl border border-white/15 px-5 text-white/85 disabled:opacity-60">Send a fresh link</button>
            </>
          ) : (
            <Link to="/login" state={{ from: { pathname: destination } }} className="inline-flex min-h-12 items-center justify-center rounded-xl bg-amber-200 px-5 font-semibold text-slate-950">Sign in after verifying</Link>
          )}
        </div>
        <p className="mt-6 text-xs leading-relaxed text-white/40">Your application or workspace will be waiting after verification. Practitioner access still requires profile review and approval.</p>
      </section>
    </main>
  );
}
