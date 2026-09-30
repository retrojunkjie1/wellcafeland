import React, { useMemo, useState } from "react";
import { ArrowLeft, BadgeCheck, Check, ChevronDown, ExternalLink, Mail, RefreshCw, Search, ShieldCheck, UserRoundCog } from "lucide-react";
import { Link } from "react-router-dom";
import { findAdminWorkspaceAccount, grantPractitionerWorkspace, listAdminWorkspaceAccessEvents } from "@/services/adminUserAccess";

const PROVIDER_TYPES = [
  ["therapist", "Therapist"], ["counselor", "Counselor"], ["recovery-coach", "Recovery coach"],
  ["peer-support", "Peer support"], ["yoga", "Yoga and movement"], ["massage", "Massage therapist"],
  ["bodywork", "Bodywork practitioner"], ["acupuncture", "Acupuncturist"],
  ["spiritual-counselor", "Spiritual care"], ["community-supporter", "Community supporter or giver"],
];

const WORKSPACE_URL = "https://wellnesscafelanding.web.app/provider/apply?onboarding=1";
const APPLICATION_STATUS = {
  "not-started": "Not started",
  pending: "Submitted · awaiting review",
  approved: "Approved",
  declined: "Update requested",
  unknown: "Status unavailable",
};

function inviteHref(account, providerType) {
  const typeLabel = PROVIDER_TYPES.find(([id]) => id === providerType)?.[1] || "practitioner";
  const onboardingUrl = `${WORKSPACE_URL}&type=${encodeURIComponent(providerType)}`;
  const subject = `Your WellnessCafe ${typeLabel} workspace invitation`;
  const body = [
    `Hello${account.displayName ? ` ${account.displayName}` : ""},`,
    "",
    `An administrator has granted your WellnessCafe account practitioner workspace access as a ${typeLabel.toLowerCase()}.`,
    "",
    `Sign in with ${account.email} and complete your profile here: ${onboardingUrl}`,
    "",
    "Your profile stays private until it is submitted and reviewed. Workspace access does not mean your profile, identity, or credentials have been verified, and it does not publish a public listing.",
    "",
    "If you did not expect this invitation, you can ignore this email.",
  ].join("\n");
  return `mailto:${encodeURIComponent(account.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export default function AdminWorkspaceAccessPage() {
  const [email, setEmail] = useState("");
  const [account, setAccount] = useState(null);
  const [providerType, setProviderType] = useState("");
  const [searchedEmail, setSearchedEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [assignedAccount, setAssignedAccount] = useState(null);
  const [eventsOpen, setEventsOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventsLoaded, setEventsLoaded] = useState(false);
  const [eventsError, setEventsError] = useState("");

  const typeLabel = useMemo(() => PROVIDER_TYPES.find(([id]) => id === providerType)?.[1] || "practitioner", [providerType]);

  const loadEvents = async () => {
    setEventsLoading(true);
    setEventsError("");
    try {
      const result = await listAdminWorkspaceAccessEvents();
      setEvents(Array.isArray(result.events) ? result.events : []);
      setEventsLoaded(true);
    } catch (err) {
      setEventsError(err?.message || "Recent grants could not be loaded.");
    } finally {
      setEventsLoading(false);
    }
  };

  const search = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setNotice("");
    setAccount(null);
    setAssignedAccount(null);
    setSearchedEmail(email.trim());
    try {
      const result = await findAdminWorkspaceAccount(email);
      if (result.found) {
        setAccount(result.account);
        setProviderType(result.account.providerType || "");
      }
    } catch (err) {
      setError(err?.message || "The account could not be searched.");
    } finally {
      setLoading(false);
    }
  };

  const assign = async () => {
    if (!account || !providerType || account.disabled) return;
    setAssigning(true);
    setError("");
    setNotice("");
    try {
      const result = await grantPractitionerWorkspace(account.email, providerType);
      setAccount(result.account || account);
      setAssignedAccount(result.account || account);
      setNotice(`${typeLabel} workspace access is active. The person must sign in again or refresh their sign-in before the new access appears.`);
    } catch (err) {
      setError(err?.message || "Workspace access could not be assigned.");
    } finally {
      setAssigning(false);
    }
  };

  return <main className="min-h-screen bg-slate-950 px-4 py-7 text-white sm:px-6 sm:py-10">
    <div className="mx-auto max-w-3xl">
      <Link to="/admin/console" className="inline-flex min-h-10 items-center gap-2 rounded-lg text-sm text-white/65 hover:text-white"><ArrowLeft className="h-4 w-4" />Back to God-Eye</Link>
      <header className="mt-5 flex items-start gap-4">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-amber-200/20 bg-amber-100/[0.06] text-amber-100"><UserRoundCog className="h-6 w-6" /></span>
        <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-100/60">God-Eye · access management</p><h1 className="mt-1 text-2xl font-semibold sm:text-3xl">Workspace access</h1><p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/60">Find an existing account by email and grant the practitioner workspace for the service they offer.</p></div>
      </header>

      <form onSubmit={search} className="mt-7 rounded-2xl border border-white/10 bg-white/[0.035] p-4 sm:p-5">
        <label htmlFor="workspace-account-email" className="text-sm font-medium text-white/80">Account email</label>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row"><input id="workspace-account-email" type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="person@example.com" className="min-h-12 min-w-0 flex-1 rounded-xl border border-white/12 bg-slate-950 px-4 text-base text-white outline-none placeholder:text-white/35 focus:border-amber-100/40" /><button type="submit" disabled={loading} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-amber-200 px-5 text-sm font-semibold text-slate-950 disabled:opacity-55"><Search className="h-4 w-4" />{loading ? "Searching…" : "Find account"}</button></div>
        <p className="mt-2 text-xs leading-relaxed text-white/45">Search checks Firebase Authentication for this exact email; it does not browse or export the user list.</p>
      </form>

      {error && <p role="alert" className="mt-4 rounded-xl border border-rose-200/20 bg-rose-200/[0.06] p-4 text-sm text-rose-100">{error}</p>}
      {notice && <p role="status" className="mt-4 rounded-xl border border-emerald-200/20 bg-emerald-100/[0.05] p-4 text-sm text-emerald-100">{notice}</p>}
      <section className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025]">
        <button type="button" aria-expanded={eventsOpen} onClick={() => {
          const open = !eventsOpen;
          setEventsOpen(open);
          if (open && !eventsLoaded && !eventsLoading) loadEvents();
        }} className="flex min-h-14 w-full items-center justify-between gap-3 px-4 text-left sm:px-5">
          <span><span className="block text-sm font-medium">Recent workspace grants</span><span className="mt-0.5 block text-xs text-white/45">Check onboarding progress or prepare the email again.</span></span>
          <ChevronDown className={`h-4 w-4 shrink-0 text-white/55 transition-transform ${eventsOpen ? "rotate-180" : ""}`} />
        </button>
        {eventsOpen && <div className="border-t border-white/[0.07] p-3 sm:p-4">
          <div className="flex items-center justify-between gap-3"><p className="text-xs text-white/45">Latest grant per account · up to 50 accounts</p><button type="button" onClick={loadEvents} disabled={eventsLoading} aria-label="Refresh workspace grants" className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-white/10 px-3 text-xs text-white/75 disabled:opacity-50"><RefreshCw className={`h-3.5 w-3.5 ${eventsLoading ? "animate-spin" : ""}`} />Refresh</button></div>
          {eventsLoading && <p role="status" className="py-5 text-center text-sm text-white/50">Loading recent grants…</p>}
          {eventsError && <p role="alert" className="mt-3 rounded-lg border border-rose-200/15 bg-rose-200/[0.05] p-3 text-sm text-rose-100">{eventsError}</p>}
          {!eventsLoading && eventsLoaded && events.length === 0 && <p className="py-5 text-sm text-white/50">No practitioner workspace grants yet.</p>}
          {!eventsLoading && events.length > 0 && <ul className="mt-3 divide-y divide-white/[0.07]">{events.map((event) => {
            const service = PROVIDER_TYPES.find(([id]) => id === event.providerType)?.[1] || "Practitioner";
            const status = APPLICATION_STATUS[event.applicationStatus] || APPLICATION_STATUS.unknown;
            const assignedAccountSummary = { email: event.email, displayName: "" };
            return <li key={event.eventId} className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0"><p className="break-all text-sm font-medium text-white/85">{event.email}</p><p className="mt-1 text-xs text-white/50">{service} · {status}{event.assignedAt ? ` · ${new Date(event.assignedAt).toLocaleDateString()}` : ""}</p></div>
              <a href={inviteHref(assignedAccountSummary, event.providerType)} className="inline-flex min-h-9 shrink-0 items-center gap-2 self-start rounded-lg border border-amber-100/20 px-3 text-xs font-medium text-amber-100 hover:bg-amber-100/[0.06] sm:self-auto"><Mail className="h-3.5 w-3.5" />Prepare email</a>
            </li>;
          })}</ul>}
          <p className="mt-2 text-[11px] leading-relaxed text-white/35">Application state is shown without profile details. Preparing an email opens your mail app; WellnessCafe does not send it automatically.</p>
        </div>}
      </section>
      {!loading && searchedEmail && !account && !error && <section className="mt-4 rounded-2xl border border-white/10 bg-white/[0.025] p-5"><h2 className="font-medium">No account found</h2><p className="mt-1 text-sm text-white/55">There is no Firebase Authentication account for {searchedEmail}. Ask them to create an account first, then search again.</p></section>}

      {account && <section className="mt-4 rounded-2xl border border-white/10 bg-white/[0.035] p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><p className="text-xs uppercase tracking-wide text-white/45">Account found</p><h2 className="mt-1 break-all text-lg font-semibold">{account.email}</h2>{account.displayName && <p className="mt-1 text-sm text-white/55">{account.displayName}</p>}</div><span className={`rounded-full border px-3 py-1 text-xs ${account.emailVerified ? "border-emerald-200/20 bg-emerald-200/[0.05] text-emerald-100" : "border-amber-200/20 bg-amber-200/[0.05] text-amber-100"}`}>{account.emailVerified ? "Email verified" : "Email not verified"}</span></div>
        <dl className="mt-4 grid gap-2 sm:grid-cols-2"><div className="rounded-xl border border-white/[0.07] bg-slate-950/35 p-3"><dt className="text-xs text-white/40">Current workspaces</dt><dd className="mt-1 text-sm text-white/80">{account.roles?.length ? account.roles.join(", ") : "Client"}</dd></div><div className="rounded-xl border border-white/[0.07] bg-slate-950/35 p-3"><dt className="text-xs text-white/40">Practitioner profile</dt><dd className="mt-1 text-sm capitalize text-white/80">{account.applicationStatus === "none" ? "Not started" : account.applicationStatus}</dd></div></dl>

        {assignedAccount ? <div className="mt-4 rounded-xl border border-emerald-200/15 bg-emerald-100/[0.035] p-4"><div className="flex items-center gap-2 text-sm font-medium text-emerald-100"><Check className="h-4 w-4" />Practitioner workspace access granted</div><p className="mt-2 text-sm leading-relaxed text-white/65">The profile is still private and is not listed or verified. The account holder needs to complete and submit their profile for the existing human review.</p><a href={inviteHref(assignedAccount, providerType)} className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-amber-200 px-4 text-sm font-semibold text-slate-950"><Mail className="h-4 w-4" />Open onboarding email draft</a><p className="mt-2 text-xs leading-relaxed text-white/45">This opens your email app with the recipient, message, and onboarding link filled in. Review it and press Send there. WellnessCafe does not send invitation emails automatically.</p><Link to="/provider/apply?onboarding=1" className="mt-3 inline-flex min-h-10 items-center gap-2 text-sm text-amber-100 underline underline-offset-4">Preview onboarding page <ExternalLink className="h-4 w-4" /></Link></div> : <>
          {account.alreadyHasPractitionerAccess && <p className="mt-4 rounded-xl border border-sky-200/15 bg-sky-100/[0.035] p-3 text-sm leading-relaxed text-sky-50/80">This account already has practitioner workspace access. You can adjust the service type below. Directory approval remains a separate review.</p>}
          {account.isAdmin && !account.alreadyHasPractitionerAccess && <p className="mt-4 rounded-xl border border-amber-200/15 bg-amber-100/[0.04] p-3 text-sm leading-relaxed text-amber-50/85">This adds a practitioner workspace while preserving administrator access. It does not approve a public listing or verify credentials.</p>}
          {account.disabled ? <p className="mt-4 text-sm text-rose-100">This account is disabled. Re-enable it in Firebase Authentication before granting workspace access.</p> : <>
            <label htmlFor="practitioner-service-type" className="mt-4 block text-sm font-medium text-white/80">Practitioner service</label>
            <select id="practitioner-service-type" value={providerType} onChange={(event) => setProviderType(event.target.value)} className="mt-2 min-h-12 w-full rounded-xl border border-white/12 bg-slate-950 px-3 text-base text-white outline-none focus:border-amber-100/40"><option value="">Choose their service</option>{PROVIDER_TYPES.map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select>
            <div className="mt-4 flex items-start gap-3 rounded-xl border border-amber-100/10 bg-amber-100/[0.035] p-3"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-100/75" /><p className="text-sm leading-relaxed text-white/65">This grants access to the practitioner workspace. It does <strong className="font-semibold text-white/85">not</strong> approve a public listing, verify credentials, or make the person appear in search. Their profile still goes through human review.</p></div>
            <button type="button" onClick={assign} disabled={!providerType || assigning} className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-amber-200 px-5 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"><BadgeCheck className="h-4 w-4" />{assigning ? "Granting access…" : `Grant ${typeLabel} workspace`}</button>
          </>}
        </>}
      </section>}
      <p className="mt-5 text-xs leading-relaxed text-white/35">Every successful assignment is recorded in the admin access audit trail. Existing administrator roles remain in place when practitioner access is added.</p>
    </div>
  </main>;
}
