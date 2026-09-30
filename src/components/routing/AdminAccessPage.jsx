import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Eye, RefreshCw, ShieldCheck, ShieldX } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useAdminClaim } from "@/hooks/useAdminClaim";

export default function AdminAccessPage() {
  const { user, loading: authLoading } = useAuth();
  const { adminReady, isAdmin, claims, refreshClaims } = useAdminClaim();
  const [refreshing, setRefreshing] = useState(false);

  const refresh = async () => {
    setRefreshing(true);
    await refreshClaims();
    setRefreshing(false);
  };

  const loading = authLoading || !adminReady;
  const role = claims?.godAdmin === true ? "Alpha Owner" : isAdmin ? "Delegated administrator" : "No active admin assignment";

  return (
    <main className="min-h-screen bg-slate-950 px-5 py-12 text-white">
      <section className="mx-auto max-w-2xl rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-2xl sm:p-9">
        <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm text-white/65 hover:text-white">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to WellnessCafe
        </Link>

        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-200/20 bg-amber-200/10 text-amber-200">
          <Eye className="h-6 w-6" aria-hidden="true" />
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-200/80">God-Eye Console</p>
        <h1 className="mt-2 text-3xl font-semibold">Admin access check</h1>
        <p className="mt-3 text-sm leading-6 text-white/65">
          God-Eye access is assigned by the Alpha Owner and checked by the server. Being signed in, using a certain email, or having an older admin label does not grant backend access.
        </p>

        <div className="mt-8 rounded-2xl border border-white/10 bg-black/20 p-5" aria-live="polite">
          {loading ? (
            <p className="text-sm text-white/70">Checking your sign-in and access…</p>
          ) : (
            <>
              <div className="flex items-start gap-3">
                {isAdmin ? <ShieldCheck className="mt-0.5 h-5 w-5 text-emerald-300" /> : <ShieldX className="mt-0.5 h-5 w-5 text-amber-200" />}
                <div>
                  <h2 className="font-medium">{isAdmin ? "Administrator access confirmed" : user ? "No active admin assignment" : "You are not signed in"}</h2>
                  <p className="mt-1 text-sm text-white/60">Account: {user?.email || "No signed-in account"}</p>
                  {user && <p className="mt-1 text-sm text-white/60">Access level: {role}</p>}
                  {isAdmin && claims?.adminScopes?.length > 0 && <p className="mt-2 text-sm leading-6 text-white/60">Your assigned responsibilities are loaded from the server; each action checks them again before it runs.</p>}
                </div>
              </div>
              {!isAdmin && user && (
                <p className="mt-4 border-t border-white/10 pt-4 text-sm leading-6 text-white/65">
                  If this account is meant to be the Alpha Owner, a Firebase project owner must complete the one-time trusted server-side setup. After that, the Alpha Owner can assign verified accounts only the admin work they need. Do not grant admin access by editing a profile or adding a generic role label.
                </p>
              )}
            </>
          )}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {isAdmin ? (
            <Link to="/admin/console" className="inline-flex items-center gap-2 rounded-xl bg-amber-200 px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-amber-100">
              <Eye className="h-4 w-4" aria-hidden="true" /> Open God-Eye console
            </Link>
          ) : user ? (
            <button type="button" onClick={refresh} disabled={refreshing || loading} className="inline-flex items-center gap-2 rounded-xl border border-amber-200/25 bg-amber-200/10 px-5 py-3 text-sm font-medium text-amber-100 hover:bg-amber-200/15 disabled:opacity-50">
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} aria-hidden="true" /> Refresh access check
            </button>
          ) : (
            <Link to="/login" className="rounded-xl bg-amber-200 px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-amber-100">Sign in</Link>
          )}
          {user && <Link to="/profile" className="rounded-xl border border-white/15 px-5 py-3 text-sm text-white/80 hover:bg-white/5">Account profile</Link>}
        </div>
      </section>
    </main>
  );
}
