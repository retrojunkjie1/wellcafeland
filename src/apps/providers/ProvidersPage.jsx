import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BadgeCheck, ExternalLink, HeartHandshake, MapPin, Search, ShieldCheck, Sparkles, Users, X, Phone, UserRoundPlus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { listVerifiedPractitioners, requestPractitionerConnection, searchPublicPractitionerDirectory } from "@/services/practitionerRegistry";
import { getPublicPracticeAvailability } from "@/services/practiceAvailability";
import MyIntroductionsPanel from "./MyIntroductionsPanel";

const CATEGORIES = [
  ["", "Everyone"], ["recovery-coach", "Recovery coaches"], ["peer-support", "Peer support"],
  ["therapist", "Therapists"], ["counselor", "Counselors"], ["yoga", "Yoga and movement"],
  ["massage", "Massage and bodywork"], ["acupuncture", "Acupuncture"], ["spiritual-counselor", "Spiritual care"],
  ["community-supporter", "Community givers"],
];
const SERVICE_FORMATS = [["", "Any format"], ["one-to-one", "One-to-one"], ["group", "Group sessions"], ["community-event", "Classes and events"], ["practical-giving", "Practical giving"]];
const ACCESS_OPTIONS = [["", "Any access option"], ["wheelchair-accessible", "Wheelchair accessible"], ["interpreter-available", "Interpreter available"], ["low-sensory-option", "Quieter space"]];
const DELIVERY_OPTIONS = [["", "Any meeting option"], ["online", "Online"], ["in-person", "In person"]];
const COST_OPTIONS = [["", "Any cost"], ["free", "Free options"], ["paid", "Paid options"]];
const INTAKE_OPTIONS = [["any", "Any connection status"], ["open", "Open to introductions"]];
const formatLabel = (value) => SERVICE_FORMATS.find(([id]) => id === value)?.[1];
const accessLabel = (value) => ACCESS_OPTIONS.find(([id]) => id === value)?.[1];
const categoryLabel = (value) => CATEGORIES.find(([id]) => id === value)?.[1] || "Community support";
const durationLabel = (value) => ({ 30: "30 minutes", 45: "45 minutes", 60: "60 minutes", variable: "Length varies" })[value] || "";

export default function ProvidersPage() {
  const { user } = useAuth();
  const [type, setType] = useState("");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [cityInput, setCityInput] = useState("");
  const [regionInput, setRegionInput] = useState("");
  const [city, setCity] = useState("");
  const [region, setRegion] = useState("");
  const [serviceFormat, setServiceFormat] = useState("");
  const [accessibilityOption, setAccessibilityOption] = useState("");
  const [deliveryOption, setDeliveryOption] = useState("");
  const [costOption, setCostOption] = useState("");
  const [acceptingNewClients, setAcceptingNewClients] = useState(false);
  const [practitioners, setPractitioners] = useState([]);
  const [directory, setDirectory] = useState("reviewed");
  const [directoryAvailable, setDirectoryAvailable] = useState(null);
  const [directoryAvailabilityError, setDirectoryAvailabilityError] = useState("");
  const [availabilityRetry, setAvailabilityRetry] = useState(0);
  const [publicListings, setPublicListings] = useState([]);
  const [publicLoading, setPublicLoading] = useState(false);
  const [publicError, setPublicError] = useState("");
  const [publicRetry, setPublicRetry] = useState(0);
  const [publicDetail, setPublicDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [introduction, setIntroduction] = useState("");
  const [sending, setSending] = useState(false);
  const [requestNotice, setRequestNotice] = useState("");
  const [accountNeeded, setAccountNeeded] = useState(false);
  const [myRequests, setMyRequests] = useState([]);
  const hasActiveFilters = Boolean(query || type || serviceFormat || accessibilityOption || deliveryOption || costOption || city || region || acceptingNewClients);
  const requestByPractitioner = new Map(myRequests.map((request) => [request.practitionerId, request]));

  useEffect(() => {
    let active = true;
    setDirectoryAvailable(null);
    setDirectoryAvailabilityError("");
    getPublicPracticeAvailability()
      .then((availability) => {
        if (active) setDirectoryAvailable(availability.providersMarketplace !== false);
      })
      .catch((err) => {
        if (!active) return;
        setDirectoryAvailable(false);
        setDirectoryAvailabilityError(err?.message || "Directory availability could not be checked.");
      });
    return () => { active = false; };
  }, [availabilityRetry]);

  useEffect(() => {
    if (directoryAvailable !== true) return undefined;
    let active = true;
    setLoading(true);
    setError("");
    listVerifiedPractitioners({ type, search: query, serviceFormat, accessibilityOption, deliveryOption, costOption, city, region, acceptingNewClients })
      .then((data) => { if (active) setPractitioners(data.practitioners || []); })
      .catch((err) => { if (active) setError(err?.message || "The directory couldn’t load. Please try again."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [directoryAvailable, type, query, serviceFormat, accessibilityOption, deliveryOption, costOption, city, region, acceptingNewClients]);

  useEffect(() => {
    if (directoryAvailable !== true) return undefined;
    if (directory !== "public" || !city || !region) return;
    const publicCategories = new Set(["therapist", "counselor", "massage", "acupuncture"]);
    if (type && !publicCategories.has(type)) {
      setPublicListings([]);
      setPublicLoading(false);
      setPublicError("");
      return;
    }
    let active = true;
    setPublicLoading(true);
    setPublicError("");
    searchPublicPractitionerDirectory({ city, region, category: type })
      .then((data) => { if (active) setPublicListings(data.listings || []); })
      .catch((err) => { if (active) setPublicError(err?.message || "The public registry couldn’t be reached. Please try again."); })
      .finally(() => { if (active) setPublicLoading(false); });
    return () => { active = false; };
  }, [directoryAvailable, directory, city, region, type, publicRetry]);

  useEffect(() => {
    if (!publicDetail) return undefined;
    const closeOnEscape = (event) => { if (event.key === "Escape") setPublicDetail(null); };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [publicDetail]);

  const makeClaimLink = (person) => {
    const params = new URLSearchParams({ claimSource: "nppes", npi: person.id, name: person.name, type: person.category, city: person.city, region: person.region });
    return `${window.location.origin}/provider/apply?${params.toString()}`;
  };

  const shareClaimLink = async (person) => {
    const url = makeClaimLink(person);
    const shareData = { title: "Join WellnessCafe OS", text: "A client found your public provider listing and would like to invite you to create an official WellnessCafe practitioner profile.", url };
    try {
      if (navigator.share) await navigator.share(shareData);
      else { await navigator.clipboard.writeText(url); setRequestNotice("Invitation link copied. You can share it with this practitioner."); }
    } catch (err) {
      if (err?.name !== "AbortError") setPublicError("The invitation link could not be shared. Please copy the page address and send it directly.");
    }
  };

  const sendConnectionRequest = async (event) => {
    event.preventDefault();
    if (!selected || sending) return;
    setSending(true);
    setRequestNotice("");
    setAccountNeeded(false);
    setError("");
    try {
      const request = await requestPractitionerConnection(selected.id, introduction);
      setMyRequests((current) => [
        { id: request.requestId, practitionerId: selected.id, practitionerName: selected.name, status: "pending" },
        ...current.filter((item) => item.practitionerId !== selected.id),
      ]);
      setRequestNotice("Your introduction was sent. You’ll see a reply in your account.");
      setSelected(null);
      setIntroduction("");
    } catch (err) {
      const needsAccount = err?.code === "functions/unauthenticated" || /personal account|sign in/i.test(err?.message || "");
      setAccountNeeded(needsAccount);
      setError(needsAccount ? "A personal account is needed to send this request. Your guest session can still browse profiles." : err?.message || "Your introduction couldn’t be sent. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-6 sm:py-12">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div><div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-200/20 bg-amber-200/10 text-amber-200"><HeartHandshake className="h-5 w-5" /></div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200/70">Support from real people</p><h1 className="mt-2 text-3xl font-semibold sm:text-4xl">Find someone who fits.</h1><p className="mt-2 max-w-2xl leading-relaxed text-white/60">Explore reviewed coaches, counselors, movement guides, bodyworkers, spiritual care, and community givers. Choose the kind of support and pace that feel right to you.</p></div>
          <Link to="/provider" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/15 bg-white/[0.04] px-4 text-sm text-white/80 transition hover:bg-white/10">Offer support</Link>
        </header>

        <MyIntroductionsPanel user={user} onRequestsLoaded={setMyRequests} />

        {directoryAvailable === false ? <section role={directoryAvailabilityError ? "alert" : "status"} className="mt-6 rounded-3xl border border-amber-100/15 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/25 p-6 sm:p-9">
          <div className="mx-auto max-w-2xl text-center"><div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-amber-100/20 bg-amber-100/[0.07] text-amber-100"><HeartHandshake className="h-6 w-6" /></div><h2 className="mt-5 text-2xl font-semibold">{directoryAvailabilityError ? "Practitioner discovery is unavailable" : "Practitioner discovery is taking a pause"}</h2><p className="mt-3 text-sm leading-relaxed text-white/65">{directoryAvailabilityError ? directoryAvailabilityError : "You can still use your existing practitioner connections, manage appointments, or apply to offer support. New directory browsing is temporarily turned off."}</p>{directoryAvailabilityError && <button type="button" onClick={() => setAvailabilityRetry((value) => value + 1)} className="mt-5 min-h-11 rounded-xl bg-amber-200 px-5 text-sm font-semibold text-slate-950">Check again</button>}<div className="mt-6 flex flex-wrap justify-center gap-3"><Link to="/my-sessions" className="inline-flex min-h-11 items-center rounded-xl border border-white/15 px-4 text-sm text-white/80">View my sessions</Link><Link to="/provider" className="inline-flex min-h-11 items-center rounded-xl border border-white/15 px-4 text-sm text-white/80">Offer support</Link></div></div>
        </section> : directoryAvailable === null ? <div role="status" className="mt-6 rounded-2xl border border-white/10 bg-white/[0.025] p-6 text-center text-sm text-white/60">Preparing practitioner discovery…</div> : <>

        <form onSubmit={(event) => { event.preventDefault(); setQuery(search.trim()); setCity(cityInput.trim()); setRegion(regionInput.trim()); }} className="mb-5 grid gap-2 rounded-2xl border border-white/10 bg-gradient-to-r from-white/[0.05] to-emerald-100/[0.025] p-3 sm:grid-cols-[minmax(12rem,1fr)_minmax(9rem,.7fr)_minmax(7rem,.45fr)_auto] sm:items-end">
          <label className="text-xs text-white/55"><span className="mb-1 flex items-center gap-1.5"><Search className="h-3.5 w-3.5" />Name, service, or support</span><input value={search} onChange={(event) => setSearch(event.target.value)} className="min-h-11 w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-amber-100/40" placeholder="e.g. recovery coaching" aria-label="Search practitioners" /></label>
          <label className="text-xs text-white/55"><span className="mb-1 flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />City</span><input value={cityInput} onChange={(event) => setCityInput(event.target.value)} className="min-h-11 w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-amber-100/40" placeholder="Any city" aria-label="Filter by city" /></label>
          <label className="text-xs text-white/55">State / region code<input value={regionInput} onChange={(event) => setRegionInput(event.target.value)} maxLength={2} className="mt-1 min-h-11 w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 text-sm uppercase text-white outline-none placeholder:normal-case placeholder:text-white/35 focus:border-amber-100/40" placeholder="e.g. CO" aria-label="Filter by state or region" /></label>
          <button className="min-h-11 rounded-xl bg-amber-200 px-5 text-sm font-semibold text-slate-950 transition hover:bg-amber-100">Find support</button>
        </form>

        <div className="mb-5 grid gap-2 rounded-2xl border border-white/10 bg-slate-900/55 p-2 sm:grid-cols-2" role="tablist" aria-label="Practitioner directories">
          <button type="button" role="tab" aria-selected={directory === "reviewed"} onClick={() => setDirectory("reviewed")} className={`min-h-12 rounded-xl px-4 text-left transition ${directory === "reviewed" ? "bg-amber-200 text-slate-950" : "text-white/70 hover:bg-white/[0.05]"}`}><span className="block font-semibold">WellnessCafe-reviewed</span><span className={`mt-0.5 block text-xs ${directory === "reviewed" ? "text-slate-800/75" : "text-white/45"}`}>Profiles reviewed before they are listed here</span></button>
          <button type="button" role="tab" aria-selected={directory === "public"} onClick={() => setDirectory("public")} className={`min-h-12 rounded-xl px-4 text-left transition ${directory === "public" ? "bg-sky-200 text-slate-950" : "text-white/70 hover:bg-white/[0.05]"}`}><span className="block font-semibold">Nearby public listings</span><span className={`mt-0.5 block text-xs ${directory === "public" ? "text-slate-800/75" : "text-white/45"}`}>Public CMS provider records · not reviewed by WellnessCafe</span></button>
        </div>

        <div className="mb-8 flex gap-2 overflow-x-auto pb-2" aria-label="Filter practitioners by support type">{CATEGORIES.map(([id, label]) => <button key={id || "all"} type="button" onClick={() => setType(id)} aria-pressed={type === id} className={`min-h-10 flex-shrink-0 rounded-full border px-4 text-sm transition ${type === id ? "border-amber-200/50 bg-amber-200/10 text-amber-100" : "border-white/10 bg-white/[0.03] text-white/65 hover:bg-white/[0.07]"}`}>{label}</button>)}</div>

        <div className="mb-6 grid gap-3 rounded-2xl border border-white/10 bg-white/[0.025] p-3 sm:grid-cols-2 xl:grid-cols-5">
          <label className="text-xs text-white/55">Ways to connect<select value={serviceFormat} onChange={(event) => setServiceFormat(event.target.value)} className="mt-1.5 min-h-11 w-full rounded-xl border border-white/10 bg-slate-950 px-3 text-sm text-white outline-none focus:border-amber-200/40" aria-label="Filter by service format">{SERVICE_FORMATS.map(([value, label]) => <option key={value || "any-format"} value={value}>{label}</option>)}</select></label>
          <label className="text-xs text-white/55">Access needs<select value={accessibilityOption} onChange={(event) => setAccessibilityOption(event.target.value)} className="mt-1.5 min-h-11 w-full rounded-xl border border-white/10 bg-slate-950 px-3 text-sm text-white outline-none focus:border-amber-200/40" aria-label="Filter by accessibility">{ACCESS_OPTIONS.map(([value, label]) => <option key={value || "any-access"} value={value}>{label}</option>)}</select></label>
          <label className="text-xs text-white/55">Meeting preference<select value={deliveryOption} onChange={(event) => setDeliveryOption(event.target.value)} className="mt-1.5 min-h-11 w-full rounded-xl border border-white/10 bg-slate-950 px-3 text-sm text-white outline-none focus:border-amber-200/40" aria-label="Filter by meeting preference">{DELIVERY_OPTIONS.map(([value, label]) => <option key={value || "any-delivery"} value={value}>{label}</option>)}</select></label>
          <label className="text-xs text-white/55">Cost preference<select value={costOption} onChange={(event) => setCostOption(event.target.value)} className="mt-1.5 min-h-11 w-full rounded-xl border border-white/10 bg-slate-950 px-3 text-sm text-white outline-none focus:border-amber-200/40" aria-label="Filter by cost">{COST_OPTIONS.map(([value, label]) => <option key={value || "any-cost"} value={value}>{label}</option>)}</select></label>
          <label className="text-xs text-white/55">Accepting connections<select value={acceptingNewClients ? "open" : "any"} onChange={(event) => setAcceptingNewClients(event.target.value === "open")} className="mt-1.5 min-h-11 w-full rounded-xl border border-white/10 bg-slate-950 px-3 text-sm text-white outline-none focus:border-amber-200/40" aria-label="Filter by connection availability">{INTAKE_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        </div>

        {hasActiveFilters && <div className="-mt-3 mb-5 flex flex-wrap items-center gap-2 text-xs text-white/45" aria-live="polite"><span>Filters applied</span>{city && <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-white/65">{city}</span>}{region && <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-white/65">{region.toUpperCase()}</span>}{acceptingNewClients && <span className="rounded-full border border-emerald-200/15 bg-emerald-200/[0.06] px-2.5 py-1 text-emerald-100/75">Open to introductions</span>}<button type="button" onClick={() => { setSearch(""); setQuery(""); setCityInput(""); setRegionInput(""); setCity(""); setRegion(""); setType(""); setServiceFormat(""); setAccessibilityOption(""); setDeliveryOption(""); setCostOption(""); setAcceptingNewClients(false); }} className="min-h-8 rounded-lg px-2.5 text-amber-100/80 underline decoration-amber-100/35 underline-offset-2 hover:text-amber-50">Clear all</button></div>}

        {directory === "public" && <section role="tabpanel" aria-label="Nearby public practitioner listings" className="mb-7">
          <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-sky-200/15 bg-sky-200/[0.035] p-4 sm:flex-row sm:items-center sm:justify-between">
            <div><p className="text-sm font-semibold text-sky-100">Public healthcare provider records</p><p className="mt-1 max-w-3xl text-xs leading-relaxed text-white/55">Searched from the city and state you entered above. These records come from the U.S. NPI Registry. An NPI is an identifier; it does not confirm a current license, availability, or endorsement. We show business contact details present in the source record.</p></div>
            <a href="https://npiregistry.cms.hhs.gov/" target="_blank" rel="noreferrer" className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-sky-100/15 px-3 text-xs text-sky-100/85 hover:bg-white/[0.05]">About this source <ExternalLink className="h-3.5 w-3.5" /></a>
          </div>
          {!city || !region ? <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-6 text-sm text-white/70">Enter a city and two-letter state code above, then choose <strong className="text-white">Find support</strong> to look for public listings. Your exact location is not requested.</div>
            : type && !["therapist", "counselor", "massage", "acupuncture"].includes(type) ? <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-6"><p className="font-medium text-white/80">This public source doesn’t list that kind of support.</p><p className="mt-1 text-sm text-white/50">The CMS NPI Registry covers certain healthcare professionals. Choose a therapist, counselor, massage therapist, acupuncturist, or “Everyone” to search it. Yoga guides, peer supporters, spiritual care, and community givers can apply to join our reviewed directory.</p></div>
            : publicLoading ? <div role="status" className="rounded-2xl border border-white/10 bg-white/[0.025] p-6 text-sm text-white/60">Looking up public provider records near {city}, {region.toUpperCase()}…</div>
              : publicError ? <div role="alert" className="rounded-2xl border border-rose-200/20 bg-rose-300/10 p-5 text-sm text-rose-100">{publicError}<button type="button" onClick={() => setPublicRetry((value) => value + 1)} className="ml-3 underline underline-offset-2">Try again</button></div>
                : publicListings.length ? <><p className="mb-3 text-xs text-white/45" role="status">{publicListings.length} public records near {city}, {region.toUpperCase()} · CMS NPI Registry</p><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{publicListings.map((person) => <article key={person.id} className="flex min-h-56 flex-col rounded-3xl border border-sky-100/10 bg-gradient-to-br from-sky-100/[0.055] to-white/[0.02] p-5"><div className="flex items-start justify-between gap-3"><div className="grid h-11 w-11 place-items-center rounded-2xl bg-sky-200/10 text-sky-100"><Users className="h-5 w-5" /></div><span className="rounded-full border border-sky-100/15 bg-sky-100/[0.05] px-2.5 py-1 text-[11px] text-sky-100/80">Public record · not reviewed</span></div><h2 className="mt-4 text-lg font-semibold">{person.name}{person.credential && <span className="ml-1.5 text-sm font-normal text-white/55">{person.credential}</span>}</h2><p className="mt-1 text-sm text-white/60">{person.specialty}</p><p className="mt-2 flex items-center gap-1.5 text-xs text-white/45"><MapPin className="h-3.5 w-3.5" />{person.city}, {person.region} {person.postalCode}</p><div className="mt-auto flex flex-wrap gap-2 border-t border-white/10 pt-4">{person.phone && <a href={`tel:${person.phone.replace(/[^+\d]/g, "")}`} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/15 px-3 text-sm text-white/80 hover:bg-white/[0.05]"><Phone className="h-4 w-4" />Call listed office</a>}<button type="button" onClick={() => setPublicDetail(person)} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/15 px-3 text-sm text-white/75 hover:bg-white/[0.05]">View listing details</button><button type="button" onClick={() => shareClaimLink(person)} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-sky-100 px-3 text-sm font-semibold text-slate-950 hover:bg-white"><UserRoundPlus className="h-4 w-4" />Invite to join</button></div></article>)}</div></>
                  : <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-6"><p className="font-medium text-white/80">No public records found for this location and category.</p><p className="mt-1 text-sm text-white/50">Try a nearby city, choose “Everyone,” or switch to WellnessCafe-reviewed profiles. The public registry only covers certain healthcare provider types; it does not include yoga guides, peer supporters, spiritual care, or community givers.</p></div>}
        </section>}

        {error && <div role="alert" className="mb-5 rounded-2xl border border-rose-200/20 bg-rose-300/10 p-4 text-sm text-rose-100">{error}</div>}
        {requestNotice && <div role="status" className="mb-5 rounded-2xl border border-emerald-200/20 bg-emerald-300/[0.08] p-4 text-sm text-emerald-100">{requestNotice}</div>}
        {directory === "reviewed" && (loading ? <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-10 text-center text-white/55">Finding reviewed profiles…</div> : practitioners.length ? (
          <><p className="mb-3 text-xs text-white/45" role="status">{practitioners.length} reviewed {practitioners.length === 1 ? "profile" : "profiles"}{city || region ? ` near ${[city, region].filter(Boolean).join(", ")}` : ""}</p><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{practitioners.map((person) => { const request = requestByPractitioner.get(person.id); return <article key={person.id} className="flex min-h-64 flex-col rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.065] to-white/[0.02] p-5"><div className="flex items-start justify-between gap-3"><div className="grid h-11 w-11 place-items-center rounded-2xl bg-amber-200/10 text-amber-100"><Sparkles className="h-5 w-5" /></div><span className="inline-flex items-center gap-1 rounded-full border border-emerald-200/15 bg-emerald-200/[0.07] px-2.5 py-1 text-[11px] text-emerald-100"><BadgeCheck className="h-3.5 w-3.5" />{person.verificationType === "community-identity-reviewed" ? "Community profile reviewed" : "Profile reviewed"}</span></div><p className="mt-4 text-xs font-medium text-amber-100/70">{categoryLabel(person.category)}</p><h2 className="mt-1 text-xl font-semibold">{person.name}</h2>{person.organization && <p className="mt-1 text-sm text-white/55">{person.organization}</p>}<p className="mt-3 text-sm leading-relaxed text-white/70">{person.bio}</p><div className="mt-4 flex flex-wrap gap-2">{person.services.map((service) => <span key={service} className="rounded-full bg-white/[0.06] px-2.5 py-1 text-xs text-white/65">{service}</span>)}</div>
            {(person.serviceFormats?.length > 0 || person.accessibilityOptions?.length > 0) && <div className="mt-3 rounded-xl border border-white/[0.07] bg-slate-950/35 p-3"><p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">What to expect</p><div className="mt-2 flex flex-wrap gap-1.5">{person.serviceFormats.map((value) => <span key={value} className="rounded-full border border-sky-200/10 bg-sky-200/[0.05] px-2 py-1 text-[11px] text-sky-100/80">{formatLabel(value)}</span>)}{person.accessibilityOptions.map((value) => <span key={value} className="rounded-full border border-emerald-200/10 bg-emerald-200/[0.05] px-2 py-1 text-[11px] text-emerald-100/80">{accessLabel(value)}</span>)}</div></div>}
            <div className="mt-auto"><div className="my-4 border-t border-white/10 pt-4"><div className="flex items-start justify-between gap-3"><span className="text-xs text-white/50">{[person.city, person.region].filter(Boolean).join(", ") || "Location shared after connection"} · {person.delivery === "online" ? "Online" : person.delivery === "in-person" ? "In person" : "Online or in person"}</span><span className="shrink-0 text-xs text-amber-100/80">{person.serviceStyle === "free" ? "Free options" : person.serviceStyle === "paid" ? "Paid" : "Free and paid"}</span></div>{(person.priceDetails || durationLabel(person.sessionLength)) && <p className="mt-2 text-xs text-white/50">{person.priceDetails}{person.priceDetails && durationLabel(person.sessionLength) ? " · " : ""}{durationLabel(person.sessionLength)}</p>}<p className="mt-2 flex items-start gap-1.5 text-[11px] leading-relaxed text-white/40"><ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-100/50" />Weekly appointment hours are shared after you connect.</p></div>{request?.status === "pending" ? <p className="min-h-11 rounded-xl border border-amber-200/20 bg-amber-200/[0.07] px-4 py-3 text-center text-sm text-amber-100">Introduction sent · waiting for reply</p> : request?.status === "accepted" ? <p className="min-h-11 rounded-xl border border-emerald-200/20 bg-emerald-200/[0.07] px-4 py-3 text-center text-sm text-emerald-100">You’re connected</p> : person.acceptsReferrals ? <button type="button" onClick={() => setSelected(person)} className="min-h-11 w-full rounded-xl bg-amber-200 px-4 text-sm font-semibold text-slate-950 transition hover:bg-amber-100">Request an introduction</button> : <p className="rounded-xl border border-white/10 bg-white/[0.025] px-3 py-3 text-center text-xs text-white/45">Not accepting requests right now</p>}</div></article>; })}</div></>
        ) : <section className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900/90 to-emerald-950/30">
          <div className="grid gap-7 p-6 sm:p-9 lg:grid-cols-[1.1fr_.9fr] lg:items-center lg:p-10">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-100/15 bg-amber-100/[0.05] px-3 py-1.5 text-xs text-amber-100/80"><HeartHandshake className="h-3.5 w-3.5" />Real people, reviewed before listing</div>
              <h2 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">{hasActiveFilters ? "No reviewed profiles match these filters." : "No reviewed practitioner profiles are published yet."}</h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/60">{hasActiveFilters ? "Try a broader search or clear the filters to see every reviewed profile. We only show practitioners who have completed human review." : "This directory is ready for real practitioners and community supporters. Once an application is reviewed and approved, people can see the support offered, service area, meeting options, and whether it is free or paid. We don’t fill this space with sample profiles."}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {hasActiveFilters && <button type="button" onClick={() => { setSearch(""); setQuery(""); setCityInput(""); setRegionInput(""); setCity(""); setRegion(""); setType(""); setServiceFormat(""); setAccessibilityOption(""); setDeliveryOption(""); setCostOption(""); setAcceptingNewClients(false); }} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-amber-200 px-4 text-sm font-semibold text-slate-950">Clear search and filters</button>}
                <Link to="/resources" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/15 bg-white/[0.04] px-4 text-sm text-white/80 transition hover:bg-white/[0.08]">Browse support resources</Link>
                <Link to="/provider" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/15 px-4 text-sm text-white/80 transition hover:bg-white/[0.08]">Offer support <span aria-hidden="true">→</span></Link>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-5 sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/40">Support you’ll be able to explore</p>
              <div className="mt-4 grid grid-cols-2 gap-2">{["Recovery and peer coaching", "Therapy and counseling", "Yoga and bodywork", "Spiritual care", "Community giving", "Online or local support"].map((item) => <div key={item} className="flex min-h-12 items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.025] px-3 text-xs leading-snug text-white/65"><BadgeCheck className="h-3.5 w-3.5 shrink-0 text-emerald-200/70" />{item}</div>)}</div>
              <p className="mt-4 text-xs leading-relaxed text-white/40">Each listing will explain what was reviewed. A review label is not a guarantee of fit or outcomes.</p>
            </div>
          </div>
        </section>)}

        <footer className="mt-8 rounded-2xl border border-white/10 bg-white/[0.025] p-4 text-xs leading-relaxed text-white/45">Profiles are reviewed before listing. A review label describes the review performed; it is not a guarantee of outcomes or a substitute for checking credentials, fit, and availability before choosing care.</footer>
        </>}
      </div>
      {selected && <div className="fixed inset-0 z-[120] grid place-items-center bg-slate-950/85 p-4 backdrop-blur-sm"><form onSubmit={sendConnectionRequest} className="w-full max-w-lg rounded-3xl border border-white/10 bg-slate-900 p-5 shadow-2xl sm:p-7"><div className="flex items-start justify-between gap-4"><div><p className="text-xs uppercase tracking-[0.15em] text-amber-100/70">Start a conversation</p><h2 className="mt-2 text-2xl font-semibold">Contact {selected.name}</h2></div><button type="button" onClick={() => setSelected(null)} aria-label="Close" className="grid h-10 w-10 place-items-center rounded-xl text-white/70 hover:bg-white/10"><X className="h-5 w-5" /></button></div><p className="mt-3 text-sm leading-relaxed text-white/60">Share a short introduction or send the request without a note. Please don’t include urgent safety information or details you aren’t ready to share.</p><label className="mt-5 block text-sm text-white/75">A note (optional)<textarea maxLength={500} rows={4} value={introduction} onChange={(event) => setIntroduction(event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-3 text-sm text-white outline-none focus:border-amber-200/50" placeholder="What kind of support are you hoping to find?" /></label>{error && <p role="alert" className="mt-3 text-sm text-rose-200">{error}</p>}{accountNeeded && <Link to="/login" state={{ from: { pathname: "/providers" } }} className="mt-3 inline-flex min-h-10 items-center rounded-lg border border-amber-200/25 px-3 text-sm text-amber-100">Sign in to send this request</Link>}<button disabled={sending} className="mt-5 min-h-12 w-full rounded-xl bg-amber-200 px-4 font-semibold text-slate-950 disabled:opacity-50">{sending ? "Sending…" : "Send introduction request"}</button></form></div>}
      {publicDetail && <div className="fixed inset-0 z-[125] grid place-items-center bg-slate-950/85 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) setPublicDetail(null); }}><section role="dialog" aria-modal="true" aria-labelledby="public-listing-title" className="max-h-[88vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-sky-100/15 bg-slate-900 p-5 shadow-2xl sm:p-7"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.15em] text-sky-100/70">Public CMS provider record</p><h2 id="public-listing-title" className="mt-2 text-2xl font-semibold">{publicDetail.name}{publicDetail.credential && <span className="ml-2 text-base font-normal text-white/60">{publicDetail.credential}</span>}</h2><p className="mt-2 text-sm text-white/55">{publicDetail.specialty}</p></div><button type="button" onClick={() => setPublicDetail(null)} aria-label="Close listing details" className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-white/70 hover:bg-white/10"><X className="h-5 w-5" /></button></div><div className="mt-5 rounded-2xl border border-sky-100/10 bg-sky-100/[0.035] p-4"><p className="text-sm font-medium text-sky-50">This information stays in WellnessCafe</p><p className="mt-1 text-xs leading-relaxed text-white/55">Review the public listing here. The source link below is optional and opens the original CMS record in a new tab.</p></div><dl className="mt-5 grid gap-3 sm:grid-cols-2"><div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-3"><dt className="text-[11px] uppercase tracking-wide text-white/40">NPI number</dt><dd className="mt-1 text-sm text-white/85">{publicDetail.id}</dd></div><div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-3"><dt className="text-[11px] uppercase tracking-wide text-white/40">Practice location</dt><dd className="mt-1 text-sm text-white/85">{publicDetail.city}, {publicDetail.region} {publicDetail.postalCode}</dd></div><div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-3"><dt className="text-[11px] uppercase tracking-wide text-white/40">Public office phone</dt><dd className="mt-1 text-sm text-white/85">{publicDetail.phone ? <a className="underline decoration-white/30 underline-offset-2" href={`tel:${publicDetail.phone.replace(/[^+\d]/g, "")}`}>{publicDetail.phone}</a> : "Not included in the source record"}</dd></div><div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-3"><dt className="text-[11px] uppercase tracking-wide text-white/40">Registry updated</dt><dd className="mt-1 text-sm text-white/85">{publicDetail.sourceUpdated || "Date not provided"}</dd></div></dl><p className="mt-4 text-xs leading-relaxed text-white/50">NPI records identify providers for healthcare transactions. They do not confirm current license status, availability, quality, or WellnessCafe review. Please confirm details with the practitioner.</p><div className="mt-5 flex flex-col gap-2 sm:flex-row"><a href={publicDetail.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/15 px-4 text-sm text-white/80 hover:bg-white/[0.05]">Open original CMS record <ExternalLink className="h-4 w-4" /></a><button type="button" onClick={() => shareClaimLink(publicDetail)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-sky-100 px-4 text-sm font-semibold text-slate-950 hover:bg-white"><UserRoundPlus className="h-4 w-4" />Invite to join WellnessCafe</button></div></section></div>}
    </main>
  );
}
