import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowUpRight, Globe2, LoaderCircle, MapPin, UsersRound } from "lucide-react";
import { searchRecoveryMeetings } from "@/services/recoveryMeetings";

const FELLOWSHIPS = {
  aa: {
    name: "Alcoholics Anonymous",
    short: "A.A.",
    localUrl: "https://www.aa.org/find-aa",
    onlineUrl: "https://aa-intergroup.org/meetings/",
    sourceLabel: "A.A. local meeting finder",
  },
  na: {
    name: "Narcotics Anonymous",
    short: "N.A.",
    localUrl: "https://na.org/meetingsearch/",
    onlineUrl: "https://na.org/meetingsearch/virtual-meeting-search/",
    sourceLabel: "N.A. World Services meeting finder",
  },
};

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function SourceButton({ href, title, onOpen, children, className = "" }) {
  return <button type="button" onClick={() => onOpen({ url: href, title })} className={className}>{children}</button>;
}

function MeetingCard({ meeting, onOpen }) {
  const day = meeting.weekdays?.length ? meeting.weekdays.map((weekday) => DAYS[weekday]).filter(Boolean).join(", ") : meeting.weekday ? DAYS[meeting.weekday - 1] : "Day not listed";
  const time = meeting.startTime ? `${day} · ${meeting.startTime}${meeting.timeZone ? ` ${meeting.timeZone}` : ""}` : day;
  const formatText = meeting.formats?.length ? meeting.formats.join(" · ") : "Meeting details from local service listing";
  return <article className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 sm:p-5">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h3 className="text-lg font-semibold text-white">{meeting.name}</h3>
        <p className="mt-1 text-sm font-medium text-amber-100">{time}</p>
      </div>
      {meeting.venueType === 2 && <span className="shrink-0 rounded-full bg-emerald-200/10 px-3 py-1 text-xs font-medium text-emerald-100">Online</span>}
      {meeting.venueType === 3 && <span className="shrink-0 rounded-full bg-emerald-200/10 px-3 py-1 text-xs font-medium text-emerald-100">Online + in person</span>}
    </div>
    {meeting.address && <p className="mt-3 flex gap-2 text-sm leading-relaxed text-white/75"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-amber-100" />{meeting.address}</p>}
    {meeting.location && <p className="mt-2 text-sm text-white/65">{meeting.location}</p>}
    <p className="mt-3 text-xs leading-relaxed text-white/50">{formatText}</p>
    <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-3">
      <p className="text-xs text-white/45">{meeting.sourceArea ? `Listing area: ${meeting.sourceArea}` : "Public N.A. listing"}</p>
      {meeting.virtualLink && <SourceButton href={meeting.virtualLink} title={`Join ${meeting.name}`} onOpen={onOpen} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-emerald-200/25 px-3 text-sm font-medium text-emerald-100 hover:bg-emerald-200/10">Open online meeting<ExternalLinkIcon /></SourceButton>}
    </div>
  </article>;
}

function ExternalLinkIcon() { return <ArrowUpRight className="h-4 w-4" aria-hidden="true" />; }

export default function RecoveryMeetingsPage() {
  const [fellowship, setFellowship] = useState("aa");
  const [format, setFormat] = useState("in-person");
  const [location, setLocation] = useState("");
  const [searchState, setSearchState] = useState({ status: "idle", meetings: [], message: "" });
  const [externalPage, setExternalPage] = useState(null);

  useEffect(() => {
    if (!externalPage) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setExternalPage(null);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [externalPage]);

  const selected = FELLOWSHIPS[fellowship];
  const externalFinder = format === "online" ? selected.onlineUrl : selected.localUrl;
  const canSearchLocally = location.trim().length >= 2;

  async function submitSearch(event) {
    event.preventDefault();
    if (!canSearchLocally) return;
    setSearchState({ status: "loading", meetings: [], message: `Searching ${selected.short} listings…` });
    try {
      const result = await searchRecoveryMeetings({ location: location.trim(), format, fellowship });
      const meetings = result.meetings || [];
      setSearchState({ status: fellowship === "aa" && meetings.length === 0 ? "external" : "results", meetings, message: "" });
    } catch (error) {
      setSearchState({ status: "error", meetings: [], message: error.message || `The ${selected.short} meeting directory could not be reached.` });
    }
  }

  function changeFellowship(id) {
    setFellowship(id);
    setSearchState({ status: "idle", meetings: [], message: "" });
  }

  return (
    <main className="min-h-full bg-slate-950 px-4 py-5 text-white sm:px-6 sm:py-8">
      <div className="mx-auto max-w-4xl">
        <Link to="/assistance" className="inline-flex min-h-10 items-center gap-2 rounded-full px-3 text-sm text-white/65 hover:bg-white/5 hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Back to Assistance
        </Link>

        <header className="mt-4 flex items-center gap-4 rounded-3xl border border-amber-200/15 bg-gradient-to-r from-amber-200/[0.09] to-slate-900/75 p-5 sm:p-6">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-amber-200/20 bg-amber-200/10 text-amber-200"><UsersRound className="h-6 w-6" /></div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-200/80">Recovery meetings</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Find a meeting</h1>
            <p className="mt-1 text-sm text-white/65">Search approved community listings here. If this directory has no match, use the fellowship’s live finder.</p>
          </div>
        </header>

        <form onSubmit={submitSearch} className="mt-4 rounded-3xl border border-white/10 bg-slate-900/75 p-4 sm:p-6">
          <fieldset>
            <legend className="text-sm font-semibold text-white/80">Fellowship</legend>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:gap-3">
              {Object.entries(FELLOWSHIPS).map(([id, item]) => <button key={id} type="button" aria-pressed={fellowship === id} onClick={() => changeFellowship(id)} className={`min-h-14 rounded-2xl border px-4 text-left transition ${fellowship === id ? "border-amber-200/70 bg-amber-200/10 text-amber-100" : "border-white/10 bg-white/[0.03] text-white/75 hover:bg-white/[0.06]"}`}>
                <span className="block font-semibold">{item.short}</span><span className="text-xs opacity-70">{item.name}</span>
              </button>)}
            </div>
          </fieldset>

          <fieldset className="mt-5">
            <legend className="text-sm font-semibold text-white/80">Meeting type</legend>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {[{ id: "in-person", label: "In person", icon: MapPin }, { id: "online", label: "Online", icon: Globe2 }].map(({ id, label, icon: Icon }) => <button key={id} type="button" aria-pressed={format === id} onClick={() => { setFormat(id); setSearchState({ status: "idle", meetings: [], message: "" }); }} className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border px-3 text-sm font-medium transition ${format === id ? "border-emerald-200/60 bg-emerald-200/10 text-emerald-100" : "border-white/10 bg-white/[0.03] text-white/70 hover:bg-white/[0.06]"}`}><Icon className="h-4 w-4" />{label}</button>)}
            </div>
          </fieldset>

          <label htmlFor="meeting-location" className="mt-5 block text-sm font-semibold text-white/80">City, region, or postal code</label>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <input id="meeting-location" value={location} onChange={(event) => { setLocation(event.target.value); if (searchState.status !== "idle") setSearchState({ status: "idle", meetings: [], message: "" }); }} placeholder="For example, Austin, TX" autoComplete="postal-code" className="min-h-12 min-w-0 flex-1 rounded-xl border border-white/15 bg-slate-950/70 px-4 text-base text-white placeholder:text-white/35 focus:border-amber-200/60 focus:outline-none focus:ring-2 focus:ring-amber-200/20" />
            <button type="submit" disabled={!canSearchLocally || searchState.status === "loading"} className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-amber-200 px-5 font-semibold text-slate-950 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-45">
              {searchState.status === "loading" ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}Find {selected.short} meetings
            </button>
          </div>
          <p className="mt-2 text-xs text-white/45">Your area is used to search approved listings and, for N.A., current public listings. <Link to="/policies/meeting-directory" className="text-amber-100 underline decoration-amber-100/30 underline-offset-2">Details</Link></p>
          {searchState.status === "external" && <div role="status" className="mt-4 rounded-2xl border border-amber-200/20 bg-amber-200/[0.06] p-4">
            <p className="text-sm leading-relaxed text-white/75">No A.A. listing is available for that area in our approved directory yet. You can still search the fellowship’s current {format === "online" ? "online" : "local"} finder.</p>
            <SourceButton href={externalFinder} title={`${selected.short} ${format === "online" ? "online" : "local"} meeting finder`} onOpen={setExternalPage} className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-full bg-amber-200 px-4 text-sm font-semibold text-slate-950 hover:bg-amber-100">Open official A.A. finder<ExternalLinkIcon /></SourceButton>
          </div>}
        </form>

        {searchState.status === "loading" && <div role="status" className="mt-4 flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/65 p-4 text-sm text-white/75"><LoaderCircle className="h-5 w-5 animate-spin text-amber-100" />Searching this area for {selected.short} meetings…</div>}
        {searchState.status === "error" && <div role="alert" className="mt-4 rounded-2xl border border-rose-200/20 bg-rose-950/30 p-4">
          <p className="font-semibold text-rose-100">Search couldn’t finish</p><p className="mt-1 text-sm text-white/70">{searchState.message}</p>
          <SourceButton href={externalFinder} title="Official N.A. meeting finder" onOpen={setExternalPage} className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-full border border-white/15 px-4 text-sm font-medium text-white hover:bg-white/5">Open official N.A. finder<ExternalLinkIcon /></SourceButton>
        </div>}
        {searchState.status === "results" && <section aria-live="polite" className="mt-5">
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-lg font-semibold">{searchState.meetings.length ? `${searchState.meetings.length} ${selected.short} ${format === "online" ? "online" : "in-person"} ${searchState.meetings.length === 1 ? "meeting" : "meetings"}` : `No matching ${selected.short} meetings found`}</h2>
            <span className="text-xs text-white/45">Approved and public listings · <Link to="/policies/meeting-directory" className="underline underline-offset-2">Directory details</Link></span>
          </div>
          {searchState.meetings.length ? <div className="grid gap-3">{searchState.meetings.map((meeting) => <MeetingCard key={meeting.id} meeting={meeting} onOpen={setExternalPage} />)}</div> : <div className="rounded-2xl border border-white/10 bg-slate-900/65 p-5">
            <p className="text-sm leading-relaxed text-white/70">There are no N.A. listings matching that area and meeting type right now. Try a nearby city or switch between online and in person.</p>
            <SourceButton href={externalFinder} title="Official N.A. meeting finder" onOpen={setExternalPage} className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-full border border-white/15 px-4 text-sm font-medium text-white hover:bg-white/5">Check the official N.A. finder<ExternalLinkIcon /></SourceButton>
          </div>}
        </section>}
        <div className="mt-5 border-t border-white/8 pt-4 text-center">
          <Link to="/recovery/meetings/share-source" className="text-sm text-white/55 underline decoration-white/20 underline-offset-4 hover:text-white/85">Are you part of a local service group? Share an authorized feed</Link>
        </div>
      </div>
      {externalPage && <div className="fixed inset-0 z-[140] flex flex-col bg-slate-950" role="dialog" aria-modal="true" aria-label={externalPage.title}>
        <header className="flex min-h-16 items-center justify-between gap-3 border-b border-white/10 bg-slate-900 px-3 sm:px-5">
          <button type="button" autoFocus onClick={() => setExternalPage(null)} className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl px-3 text-sm font-medium text-white hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200" aria-label="Back to meeting results"><ArrowLeft className="h-4 w-4" /><span className="hidden sm:inline">Back to results</span><span className="sm:hidden">Back</span></button>
          <p className="min-w-0 flex-1 truncate text-center text-sm text-white/75">{externalPage.title}</p>
          <a href={externalPage.url} target="_blank" rel="noreferrer" className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl border border-white/15 px-3 text-xs font-medium text-amber-100 hover:bg-white/5"><span className="hidden sm:inline">Open in browser</span><span className="sm:hidden">Open</span><ExternalLinkIcon /></a>
        </header>
        <p className="border-b border-white/10 bg-slate-900/70 px-4 py-2 text-center text-xs text-white/50">Your meeting results stay open here. Use “Back” to return to them.</p>
        <iframe src={externalPage.url} title={externalPage.title} className="min-h-0 flex-1 border-0 bg-white" sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox" referrerPolicy="no-referrer" />
      </div>}
    </main>
  );
}
