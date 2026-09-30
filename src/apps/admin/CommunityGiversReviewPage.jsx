import React, { useEffect, useState } from "react";
import { listCommunityGiverApplications, reviewCommunityGiverApplication } from "@/services/communitySupportService";

const TYPE_LABELS = {
  individual: "Individual giver",
  organization: "Organization",
  "recovery-coach": "Recovery coach",
  therapist: "Therapist or counselor",
  bodywork: "Massage or bodywork",
  yoga: "Yoga instructor",
};
const CATEGORY_LABELS = {
  transport: "Bus fare or pass",
  food: "Food or groceries",
  milk: "Milk or everyday essentials",
  "medication-cost": "Medication costs",
  "temporary-stay": "A safe place to stay",
  "housing-start": "Starting sober or stable housing",
  clothing: "Clothing or basic supplies",
  "wellness-session": "A wellness session",
  "other-essential": "Another basic need",
};

export default function CommunityGiversReviewPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await listCommunityGiverApplications();
      setApplications(result.applications || []);
    } catch (err) {
      setError(err.message || "Applications could not load.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const decide = async (application, decision) => {
    setBusy(application.id);
    setError("");
    try {
      await reviewCommunityGiverApplication(application.id, decision);
      await load();
    } catch (err) {
      setError(err.message || "The application could not be updated.");
    } finally {
      setBusy("");
    }
  };

  return (
    <div className="min-h-full bg-[#0A1110] px-1 py-2 text-[#F4F7F5] sm:px-2">
      <div className="mx-auto max-w-4xl space-y-5">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div><p className="text-sm font-bold uppercase tracking-wide text-[#9CCFB1]">Community giving · Admin</p><h1 className="mt-1 text-3xl font-bold">Giver applications</h1></div>
          <button type="button" onClick={load} disabled={loading} className="min-h-12 rounded-xl border-2 border-white/20 bg-[#121B19] px-4 text-base font-semibold text-[#E5EEE8] hover:bg-[#173428] disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B5E2C9]">{loading ? "Refreshing…" : "Refresh"}</button>
        </header>
        <p className="rounded-xl border border-amber-200/20 bg-[#2A2418] p-4 text-sm leading-relaxed text-amber-50/90">
          Approval lets a giver browse anonymous needs and send offers. Email verification and this application review do not confirm professional licenses, credentials, identity, or suitability for clinical care.
        </p>
        {error && <p role="alert" className="rounded-xl border-2 border-rose-300/30 bg-[#3B1F25] p-4 text-base text-rose-100">{error}</p>}
        {loading ? <p role="status" className="rounded-xl border border-white/10 bg-[#121B19] p-5 text-lg text-[#E5EEE8]">Loading applications…</p> : applications.length ? applications.map((application) => (
          <article key={application.id} className="rounded-2xl border-2 border-white/10 bg-[#121B19] p-5 sm:p-6">
            <h2 className="text-xl font-bold">{application.displayName}{application.organization ? ` · ${application.organization}` : ""}</h2>
            <p className="mt-1 text-base text-[#C8D3CC]">{TYPE_LABELS[application.type] || application.type} · {application.state} · {application.zone}</p>
            <a href={`mailto:${encodeURIComponent(application.email || "")}`} className="mt-2 inline-block min-h-11 py-2 text-base font-semibold text-[#B5E2C9] underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B5E2C9]">{application.email}</a>
            <div className="mt-2 flex flex-wrap gap-2">{(application.categories || []).map((category) => <span key={category} className="rounded-full border border-[#B5E2C9]/20 bg-[#173428] px-3 py-1 text-sm text-[#DCEFE4]">{CATEGORY_LABELS[category] || category}</span>)}</div>
            <div className="mt-5 flex flex-wrap gap-3">
              <button type="button" disabled={busy === application.id} onClick={() => decide(application, "approve")} className="min-h-12 rounded-xl bg-[#B5E2C9] px-5 text-base font-bold text-[#08140F] disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B5E2C9]">{busy === application.id ? "Saving…" : "Approve giver"}</button>
              <button type="button" disabled={busy === application.id} onClick={() => decide(application, "decline")} className="min-h-12 rounded-xl border-2 border-white/20 px-5 text-base font-bold text-[#E5EEE8] disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B5E2C9]">Decline</button>
            </div>
          </article>
        )) : <p className="rounded-xl border border-white/10 bg-[#121B19] p-5 text-lg text-[#C8D3CC]">No giver applications are waiting for review.</p>}
      </div>
    </div>
  );
}
