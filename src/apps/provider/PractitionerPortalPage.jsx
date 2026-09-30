import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { getMyPractitionerApplication, submitPractitionerApplication } from "@/services/practitionerRegistry";
import ProviderDashboardPage from "./ProviderDashboardPage";
import { ArrowLeft, ArrowRight, BadgeCheck, BriefcaseBusiness, Check, HeartHandshake, Loader2, ShieldCheck } from "lucide-react";

const TYPES = [
  ["recovery-coach", "Recovery coach"], ["peer-support", "Peer support"],
  ["therapist", "Therapist"], ["counselor", "Counselor"], ["yoga", "Yoga and movement"],
  ["massage", "Massage therapist"], ["bodywork", "Bodywork practitioner"], ["acupuncture", "Acupuncturist"], ["spiritual-counselor", "Spiritual care"],
  ["community-supporter", "Community giver or philanthropist"],
];

const SERVICE_FORMATS = [["one-to-one", "One-to-one support"], ["group", "Group sessions"], ["community-event", "Classes or community events"], ["practical-giving", "Practical goods or direct giving"]];
const ACCESS_OPTIONS = [["wheelchair-accessible", "Wheelchair-accessible space"], ["interpreter-available", "Interpreter can be arranged"], ["low-sensory-option", "Quieter or lower-sensory option"]];
const SESSION_LENGTHS = [["30", "30 minutes"], ["45", "45 minutes"], ["60", "60 minutes"], ["variable", "Varies"], ["not-applicable", "Not applicable"]];
const applicationToForm = (profile = {}) => ({ ...profile, services: Array.isArray(profile.services) ? profile.services.join(", ") : (profile.services || ""), serviceFormats: Array.isArray(profile.serviceFormats) ? profile.serviceFormats : [], accessibilityOptions: Array.isArray(profile.accessibilityOptions) ? profile.accessibilityOptions : [], priceDetails: profile.priceDetails || "", sessionLength: profile.sessionLength || "variable" });

const initialForm = {
  name: "", organization: "", type: "recovery-coach", bio: "", city: "", region: "",
  delivery: "both", serviceStyle: "both", services: "", serviceFormats: [], accessibilityOptions: [], priceDetails: "", sessionLength: "variable", credentialType: "", credentialSummary: "",
  acceptsReferrals: false, consentToReview: false,
};

export default function PractitionerPortalPage() {
  const { role, isProvider, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const isWorkspaceOnboarding = new URLSearchParams(window.location.search).get("onboarding") === "1";
  const [record, setRecord] = useState(null);
  const [form, setForm] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const allowedTypes = new Set(TYPES.map(([id]) => id));
    const type = params.get("type");
    if (params.get("claimSource") !== "nppes") return { ...initialForm, type: allowedTypes.has(type) ? type : initialForm.type };
    const npi = params.get("npi") || "";
    return {
      ...initialForm,
      name: params.get("name") || "",
      type: allowedTypes.has(type) ? type : initialForm.type,
      city: params.get("city") || "",
      region: (params.get("region") || "").toUpperCase().slice(0, 2),
      publicDirectoryClaim: /^\d{10}$/.test(npi) ? { source: "nppes", npi } : null,
    };
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [step, setStep] = useState(0);
  const [refreshingAccess, setRefreshingAccess] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.isAnonymous || (!isWorkspaceOnboarding && isProvider)) {
      setLoading(false);
      return;
    }
    let active = true;
    getMyPractitionerApplication()
      .then((result) => { if (active) { setRecord(result); if (result.application?.status === "declined" && result.application.profileDraft) setForm((current) => ({ ...current, ...applicationToForm(result.application.profileDraft) })); } })
      .catch((err) => { if (active) setError(err?.message || "We couldn’t load your practitioner application."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [authLoading, user, role, isProvider, isWorkspaceOnboarding]);

  if (!isWorkspaceOnboarding && isProvider) {
    return <ProviderDashboardPage />;
  }

  if (authLoading) return <div className="min-h-[60vh] grid place-items-center bg-slate-950 text-white"><Loader2 className="h-6 w-6 animate-spin text-amber-300" aria-label="Loading account" /></div>;
  if (!user || user.isAnonymous) return <main className="min-h-[70vh] bg-slate-950 px-4 py-12 text-white"><section className="mx-auto max-w-xl rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.055] to-transparent p-6 sm:p-9"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-100/70">Practitioner community</p><h1 className="mt-3 text-3xl font-semibold">Create your practitioner profile</h1><p className="mt-3 leading-relaxed text-white/65">Use a personal WellnessCafe account to apply. Your profile stays private until it has been reviewed.</p><div className="mt-6 flex flex-wrap gap-3"><Link to="/login" state={{ from: { pathname: "/provider" } }} className="inline-flex min-h-12 items-center justify-center rounded-xl bg-amber-200 px-5 font-semibold text-slate-950">Sign in</Link><Link to="/signup" state={{ from: { pathname: "/provider" } }} className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/15 px-5 text-sm text-white/80">Create an account</Link></div><p className="mt-4 text-xs leading-relaxed text-white/40">If the app currently shows you as a guest, these buttons move you to a personal account and bring you back here afterward.</p></section></main>;

  const setField = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setNotice("");
    setSaving(true);
    try {
      const result = await submitPractitionerApplication({
        ...form,
        services: form.services.split(",").map((service) => service.trim()).filter(Boolean),
      });
      setRecord((current) => ({ ...current, application: { status: result.status } }));
      setNotice("Your profile is in the review queue. We’ll update your practitioner access after the review.");
    } catch (err) {
      setError(err?.message || "We couldn’t submit your profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const continueStep = () => {
    setError("");
    if (step === 0 && (!form.name.trim() || !form.bio.trim())) {
      setError("Add the name people will see and a short introduction before continuing.");
      return;
    }
    if (step === 1 && (!form.services.trim() || !form.serviceFormats.length)) {
      setError("Add at least one service and choose how you provide it.");
      return;
    }
    setStep((current) => Math.min(2, current + 1));
  };

  const openApprovedWorkspace = async () => {
    setRefreshingAccess(true);
    setError("");
    try {
      await user?.getIdToken(true);
      navigate("/provider/dashboard", { replace: true });
    } catch (err) {
      setError(err?.message || "Your access could not be refreshed. Please try again.");
    } finally {
      setRefreshingAccess(false);
    }
  };

  const refreshApplicationStatus = async () => {
    setCheckingStatus(true);
    setError("");
    setNotice("");
    try {
      const result = await getMyPractitionerApplication();
      setRecord(result);
      if (result.application?.status === "approved") {
        setNotice("Your profile is approved. Refresh your access to open the practitioner workspace.");
      } else if (result.application?.status === "pending") {
        setNotice("Your profile is still in the review queue.");
      } else if (result.application?.status === "declined") {
        setForm((current) => ({ ...current, ...applicationToForm(result.application?.profileDraft || {}) }));
        setNotice("The review team requested an update. Their note is shown below.");
      } else {
        setNotice("No application was found. You can start a profile below.");
      }
    } catch (err) {
      setError(err?.message || "We couldn’t check your application status. Please try again.");
    } finally {
      setCheckingStatus(false);
    }
  };

  if (loading) return <div className="min-h-[60vh] grid place-items-center bg-slate-950 text-white"><Loader2 className="h-6 w-6 animate-spin text-amber-300" aria-label="Loading practitioner portal" /></div>;

  const status = record?.application?.status;
  const pageHeading = status === "pending"
    ? "Your profile is in review"
    : status === "approved"
      ? "Your practitioner profile is approved"
      : status === "declined"
        ? "Your application needs an update"
        : "Bring your kind of support here.";
  const pageDescription = status === "pending"
    ? "Your submitted profile stays private while our team reviews it."
    : status === "approved"
      ? "Refresh your account access to continue into your practitioner workspace."
      : status === "declined"
        ? "Review the note below, update your profile, and send it back for review."
        : isWorkspaceOnboarding
          ? "Your practitioner workspace is ready. Add your profile details so people can understand the support you offer. Your profile stays private until a person reviews it."
          : "Create a profile for your practice, peer support, movement work, bodywork, spiritual care, or community giving. People can find you after a human review.";
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-6 sm:py-12">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8 max-w-2xl">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-200/20 bg-amber-200/10 text-amber-200"><HeartHandshake className="h-6 w-6" /></div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-200/75">{status === "pending" ? "Application in review" : status === "approved" ? "Review complete" : status === "declined" ? "Application update" : "Practitioner community"}</p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{pageHeading}</h1>
          <p className="mt-3 text-base leading-relaxed text-white/65">{pageDescription}</p>
        </header>

        {status === "pending" ? (
          <section className="rounded-3xl border border-amber-200/20 bg-white/[0.04] p-6 sm:p-8">
            <div className="flex items-start gap-4"><div className="rounded-xl bg-amber-200/10 p-3 text-amber-200"><ShieldCheck className="h-6 w-6" /></div><div><h2 className="text-xl font-semibold">Review underway</h2><p className="mt-2 max-w-xl leading-relaxed text-white/65">A person reviews each profile before it appears in the directory.</p></div></div>
            <ol aria-label="Application progress" className="mt-6 grid gap-3 sm:grid-cols-3">
              <li className="flex items-center gap-3 rounded-2xl border border-emerald-200/20 bg-emerald-200/[0.045] p-4"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-emerald-200/10 text-emerald-100"><Check aria-hidden="true" className="h-5 w-5" /></span><span><span className="block text-sm font-medium text-white">Submitted</span><span className="mt-0.5 block text-xs text-white/50">Profile received</span></span></li>
              <li aria-current="step" className="flex items-center gap-3 rounded-2xl border border-amber-200/30 bg-amber-200/[0.06] p-4"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-amber-200/10 text-amber-100"><ShieldCheck aria-hidden="true" className="h-5 w-5" /></span><span><span className="block text-sm font-medium text-white">Human review</span><span className="mt-0.5 block text-xs text-white/55">In progress</span></span></li>
              <li className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-4"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/[0.05] text-white/50"><BriefcaseBusiness aria-hidden="true" className="h-5 w-5" /></span><span><span className="block text-sm font-medium text-white/80">Practitioner workspace</span><span className="mt-0.5 block text-xs text-white/45">Opens after approval</span></span></li>
            </ol>
            <p className="mt-4 text-sm text-white/55">Your profile is not public while it is being reviewed. You can leave this page and check the status again later.</p>
            {error && <p role="alert" className="mt-4 rounded-xl border border-rose-300/20 bg-rose-400/10 p-3 text-sm text-rose-100">{error}</p>}
            {notice && <p role="status" className="mt-4 rounded-xl border border-emerald-300/20 bg-emerald-400/10 p-3 text-sm text-emerald-100">{notice}</p>}
            <button type="button" onClick={refreshApplicationStatus} disabled={checkingStatus} className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/15 px-4 text-sm text-white/85 transition hover:bg-white/[0.06] disabled:opacity-50">
              {checkingStatus ? <Loader2 className="h-4 w-4 animate-spin" /> : null}{checkingStatus ? "Refreshing…" : "Refresh review status"}
            </button>
          </section>
        ) : status === "approved" ? (
          <section className="rounded-3xl border border-emerald-200/20 bg-emerald-200/[0.04] p-6 sm:p-8">
            <div className="flex items-start gap-4"><div className="rounded-xl bg-emerald-200/10 p-3 text-emerald-100"><BadgeCheck className="h-6 w-6" /></div><div><h2 className="text-xl font-semibold">Your practitioner profile is approved</h2><p className="mt-2 max-w-xl leading-relaxed text-white/65">Your listing has completed review. Refresh your account access to open your practitioner workspace and manage connections, schedule, and support tools.</p></div></div>
            {error && <p role="alert" className="mt-4 rounded-xl border border-rose-300/20 bg-rose-400/10 p-3 text-sm text-rose-100">{error}</p>}
            {notice && <p role="status" className="mt-4 rounded-xl border border-emerald-300/20 bg-emerald-400/10 p-3 text-sm text-emerald-100">{notice}</p>}
            <button type="button" onClick={openApprovedWorkspace} disabled={refreshingAccess} className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-amber-200 px-4 text-sm font-semibold text-slate-950 disabled:opacity-60">{refreshingAccess ? <Loader2 className="h-4 w-4 animate-spin" /> : null}{refreshingAccess ? "Opening workspace…" : "Open practitioner workspace"}</button>
          </section>
        ) : (
          <form onSubmit={handleSubmit} className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.055] to-white/[0.02] p-5 shadow-2xl shadow-black/20 sm:p-7">
            <div className="mb-6 flex items-center gap-3"><div className="rounded-xl bg-amber-200/10 p-2.5 text-amber-200"><BriefcaseBusiness className="h-5 w-5" /></div><div><h2 className="text-lg font-semibold">Your practitioner profile</h2><p className="mt-0.5 text-xs text-white/50">A short, three-step application. You can review before sending.</p></div></div>
            {form.publicDirectoryClaim && <div className="mb-5 rounded-xl border border-sky-200/15 bg-sky-200/[0.04] p-3 text-sm text-white/70"><p className="font-medium text-sky-100">You came from a public NPI directory listing</p><p className="mt-1 text-xs leading-relaxed text-white/55">We’ll ask a reviewer to match your application to NPI {form.publicDirectoryClaim.npi}. This public record does not verify a license or professional credentials.</p></div>}
            <ol aria-label="Application steps" className="mb-6 grid grid-cols-3 gap-2">{["About you", "Your support", "Review"].map((label, index) => <li key={label} className={`rounded-lg border px-2.5 py-2 text-xs ${index === step ? "border-amber-200/30 bg-amber-200/[0.07] text-amber-100" : index < step ? "border-emerald-200/15 bg-emerald-200/[0.04] text-emerald-100/75" : "border-white/[0.07] text-white/35"}`}><span className="mr-1.5 inline-grid h-4 w-4 place-items-center rounded-full bg-white/[0.07] text-[10px]">{index < step ? <Check className="h-3 w-3" /> : index + 1}</span>{label}</li>)}</ol>
            {record?.application?.status === "declined" && <div className="mb-5 rounded-2xl border border-amber-200/20 bg-amber-200/5 p-4 text-sm text-amber-100">Your last application needs an update. {record.application.reviewNote}</div>}
            {error && <p role="alert" className="mb-5 rounded-xl border border-rose-300/20 bg-rose-400/10 p-3 text-sm text-rose-100">{error}</p>}
            {notice && <p role="status" className="mb-5 rounded-xl border border-emerald-300/20 bg-emerald-400/10 p-3 text-sm text-emerald-100">{notice}</p>}

            {step === 0 && <div className="grid gap-5 sm:grid-cols-2">
              <Field label="How do you support people?">
                <select required value={form.type} onChange={(e) => setField("type", e.target.value)} className={inputClass}>{TYPES.map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select>
              </Field>
              <Field label="Name shown to people"><input required maxLength={100} value={form.name} onChange={(e) => setField("name", e.target.value)} className={inputClass} placeholder="Your name or practice name" /></Field>
              <Field label="Organization (optional)"><input maxLength={120} value={form.organization} onChange={(e) => setField("organization", e.target.value)} className={inputClass} placeholder="Organization or group" /></Field>
              <Field label="A short introduction" className="sm:col-span-2"><textarea required maxLength={900} rows={4} value={form.bio} onChange={(e) => setField("bio", e.target.value)} className={`${inputClass} resize-y`} placeholder="Who do you support? What can someone expect from a first conversation or session?" /></Field>
            </div>}
            {step === 1 && <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Services you offer"><input required value={form.services} onChange={(e) => setField("services", e.target.value)} className={inputClass} placeholder="Yoga, peer support, bus passes" /><span className="mt-1 block text-xs text-white/45">Separate services with commas.</span></Field>
              <Field label="City"><input maxLength={80} value={form.city} onChange={(e) => setField("city", e.target.value)} className={inputClass} placeholder="City" /></Field>
              <Field label="State"><input maxLength={2} value={form.region} onChange={(e) => setField("region", e.target.value.toUpperCase())} className={inputClass} placeholder="CO" /></Field>
              <Field label="How can people meet with you?"><select value={form.delivery} onChange={(e) => setField("delivery", e.target.value)} className={inputClass}><option value="both">In person or online</option><option value="online">Online</option><option value="in-person">In person</option></select></Field>
              <Field label="Your support is usually"><select value={form.serviceStyle} onChange={(e) => setField("serviceStyle", e.target.value)} className={inputClass}><option value="both">Free and paid</option><option value="free">Free</option><option value="paid">Paid</option></select></Field>
              <Field label="How do you offer this support?" className="sm:col-span-2"><div className="grid gap-2 sm:grid-cols-2">{SERVICE_FORMATS.map(([value, label]) => <label key={value} className="flex min-h-11 items-center gap-3 rounded-xl border border-white/10 bg-slate-950/45 px-3 text-sm text-white/75"><input type="checkbox" checked={form.serviceFormats.includes(value)} onChange={(event) => setField("serviceFormats", event.target.checked ? [...form.serviceFormats, value] : form.serviceFormats.filter((item) => item !== value))} className="h-4 w-4 accent-amber-300" />{label}</label>)}</div><span className="mt-1 block text-xs text-white/45">Choose at least one to help people understand what to expect.</span></Field>
              <Field label="Accessibility options (optional)" className="sm:col-span-2"><div className="grid gap-2 sm:grid-cols-3">{ACCESS_OPTIONS.map(([value, label]) => <label key={value} className="flex min-h-11 items-center gap-3 rounded-xl border border-white/10 bg-slate-950/45 px-3 text-xs leading-snug text-white/75"><input type="checkbox" checked={form.accessibilityOptions.includes(value)} onChange={(event) => setField("accessibilityOptions", event.target.checked ? [...form.accessibilityOptions, value] : form.accessibilityOptions.filter((item) => item !== value))} className="h-4 w-4 shrink-0 accent-amber-300" />{label}</label>)}</div></Field>
              <Field label="Typical session length"><select value={form.sessionLength} onChange={(e) => setField("sessionLength", e.target.value)} className={inputClass}>{SESSION_LENGTHS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></Field>
              <Field label="Cost details (optional)"><input maxLength={180} value={form.priceDetails} onChange={(e) => setField("priceDetails", e.target.value)} className={inputClass} placeholder="For example, free drop-in or sliding scale" /></Field>
              {form.type !== "community-supporter" && <><Field label="Credential or experience type"><input maxLength={100} value={form.credentialType} onChange={(e) => setField("credentialType", e.target.value)} className={inputClass} placeholder="License, certification, lived experience" /></Field><Field label="Credential summary for review"><input maxLength={240} value={form.credentialSummary} onChange={(e) => setField("credentialSummary", e.target.value)} className={inputClass} placeholder="Issuing body or relevant experience" /></Field></>}
            </div>}
            {step === 2 && <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4 sm:p-5"><h3 className="font-semibold">Check your profile details</h3><dl className="mt-4 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2"><Review label="Support type" value={TYPES.find(([id]) => id === form.type)?.[1]} /><Review label="Name" value={form.name} /><Review label="Organization" value={form.organization || "Individual"} /><Review label="Services" value={form.services} /><Review label="Format" value={form.serviceFormats.map((item) => SERVICE_FORMATS.find(([id]) => id === item)?.[1]).filter(Boolean).join(", ")} /><Review label="Location" value={[form.city, form.region].filter(Boolean).join(", ") || "Not listed"} /><Review label="Delivery" value={form.delivery === "both" ? "Online or in person" : form.delivery} /><Review label="Cost" value={`${form.serviceStyle === "both" ? "Free and paid" : form.serviceStyle}${form.priceDetails ? ` · ${form.priceDetails}` : ""}`} /><Review label="Session length" value={SESSION_LENGTHS.find(([id]) => id === form.sessionLength)?.[1]} /><Review label="Accessibility" value={form.accessibilityOptions.map((item) => ACCESS_OPTIONS.find(([id]) => id === item)?.[1]).filter(Boolean).join(", ")} /><Review label="Introduction" value={form.bio} wide /></dl><p className="mt-4 border-t border-white/10 pt-4 text-xs leading-relaxed text-white/45">Your profile remains private until reviewed. This review is not a substitute for a client checking fit, credentials, or availability.</p>
              <label className="mt-4 flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.025] p-3 text-sm leading-relaxed text-white/75"><input type="checkbox" checked={form.acceptsReferrals} onChange={(e) => setField("acceptsReferrals", e.target.checked)} className="mt-1 h-4 w-4 accent-amber-300" />I’m open to receiving requests or referrals through the platform.</label>
              <label className="mt-3 flex items-start gap-3 text-sm leading-relaxed text-white/65"><input type="checkbox" required checked={form.consentToReview} onChange={(e) => setField("consentToReview", e.target.checked)} className="mt-1 h-4 w-4 accent-amber-300" />I agree to a human review. A listing will clearly distinguish community identity review from professional credential review.</label>
            </div>}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5">{step > 0 ? <button type="button" onClick={() => { setError(""); setStep((current) => current - 1); }} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/10 px-4 text-sm text-white/70 hover:bg-white/[0.05]"><ArrowLeft className="h-4 w-4" />Back</button> : <p className="text-xs text-white/40">Your profile stays private until a person reviews it.</p>}{step < 2 ? <button type="button" onClick={continueStep} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-amber-200 px-4 text-sm font-semibold text-slate-950 hover:bg-amber-100">Continue<ArrowRight className="h-4 w-4" /></button> : <button type="submit" disabled={saving} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-amber-200 px-5 font-semibold text-slate-950 transition hover:bg-amber-100 disabled:opacity-50">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><span>Send for review</span><ArrowRight className="h-4 w-4" /></>}</button>}</div>
          </form>
        )}
        <p className="mt-5 flex items-center gap-2 text-xs text-white/45"><BadgeCheck className="h-4 w-4" />Professional credentials and community-giver identity are reviewed and labeled separately.</p>
      </div>
    </main>
  );
}

function Field({ label, children, className = "" }) {
  return <label className={`block text-sm text-white/75 ${className}`}><span className="mb-2 block font-medium">{label}</span>{children}</label>;
}

function Review({ label, value, wide }) {
  return <div className={wide ? "sm:col-span-2" : ""}><dt className="text-[11px] uppercase tracking-wide text-white/40">{label}</dt><dd className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-white/80">{value || "Not provided"}</dd></div>;
}

const inputClass = "min-h-11 w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-amber-200/50 focus:ring-2 focus:ring-amber-200/10";
