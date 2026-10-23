import React, { useMemo, useState } from "react";
import { ChevronDown, ExternalLink, MapPinned, ShieldAlert } from "lucide-react";
import { NIGERIA_COVERAGE_TOTALS, NIGERIA_DIRECTORY_CATEGORIES, NIGERIA_DIRECTORY_COVERAGE, NIGERIA_NDLEA_SOURCE_GAPS, getNigeriaStateCoverage } from "@/data/nigeriaDirectoryCoverage";

export default function NigeriaCoverageAudit() {
  const [state, setState] = useState("Federal Capital Territory");
  const [activeCategory, setActiveCategory] = useState("");
  const selectedCoverage = useMemo(() => getNigeriaStateCoverage(state), [state]);
  const visibleCategories = activeCategory
    ? selectedCoverage.filter((category) => category.id === activeCategory)
    : selectedCoverage;
  const localContactGaps = selectedCoverage.filter((category) => category.localContacts.length === 0);
  const stateEvidenceGaps = selectedCoverage.filter((category) => category.records.length === 0);

  const selectState = (stateName, categoryId = "") => {
    setState(stateName);
    setActiveCategory(categoryId);
  };

  return <section className="mt-5 rounded-3xl border border-amber-100/20 bg-gradient-to-br from-amber-100/[0.055] via-slate-900/75 to-slate-950 p-3 sm:p-4" aria-labelledby="nigeria-coverage-title">
    <details>
      <summary className="group flex cursor-pointer list-none items-center gap-3 rounded-2xl p-2 outline-none focus-visible:ring-2 focus-visible:ring-amber-200 [&::-webkit-details-marker]:hidden">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-amber-100/20 bg-amber-100/[0.07] text-amber-100"><MapPinned className="h-5 w-5" /></span>
        <span className="min-w-0 flex-1">
          <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-amber-100/65">Nigeria · coverage review in progress</span>
          <span id="nigeria-coverage-title" className="mt-0.5 block text-base font-semibold text-white">37 jurisdictions · 6 support categories · {NIGERIA_COVERAGE_TOTALS.independentlyVerifiedJurisdictions}/37 independently checked</span>
          <span className="mt-0.5 block text-xs text-white/50">Open the state-by-state evidence and source gaps</span>
        </span>
        <ChevronDown aria-hidden="true" className="h-5 w-5 shrink-0 text-white/55 transition-transform group-open:rotate-180" />
      </summary>

      <div className="mt-3 border-t border-white/10 pt-4">
        <p className="max-w-4xl text-sm leading-relaxed text-white/65">This ledger counts records currently in WellnessCafe’s Nigeria source file across all 36 states and the FCT. State offices and national referrals are not local providers. An independent check requires a second source and a recorded review date; none is recorded here, so this directory cannot be called complete or independently verified.</p>

        <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
          <Metric label="States and FCT in scope" value={NIGERIA_COVERAGE_TOTALS.jurisdictions} detail="36 states plus the FCT" />
          <Metric label="Support categories" value={NIGERIA_COVERAGE_TOTALS.categories} detail="Treatment, peer, housing, food, benefits, urgent" />
          <Metric label="Independently checked" value={`${NIGERIA_COVERAGE_TOTALS.independentlyVerifiedJurisdictions}/37`} detail="No second-source checks recorded" />
          <Metric label="State referral routes" value={NIGERIA_COVERAGE_TOTALS.stateReferralRoutes} detail="Not local-provider counts" />
          <Metric label="NDLEA contacts in source" value={`${NIGERIA_COVERAGE_TOTALS.statesWithNdleaContact}/36`} detail="One government directory" />
        </div>

        <div className="mt-3 rounded-xl border border-amber-100/15 bg-amber-100/[0.035] p-3 text-xs leading-relaxed text-white/65">
          <p><span className="font-medium text-amber-50">NDLEA source gap:</span> its public rehabilitation page lists contacts for 29 states and the FCT, but not {NIGERIA_NDLEA_SOURCE_GAPS.join(", ")}. That gap applies to this source only; it does not mean those states have no services.</p>
        </div>

        <div className="mt-3 overflow-hidden rounded-2xl border border-white/10">
          <div className="flex flex-wrap items-end justify-between gap-3 border-b border-white/10 bg-black/10 p-3">
            <div><h3 className="text-sm font-semibold">State coverage snapshot</h3><p className="mt-1 text-xs text-white/50">Select any count to open the supporting records below.</p></div>
            <label className="min-w-48 text-xs text-white/65">Review a state
              <select value={state} onChange={(event) => selectState(event.target.value)} className="mt-1 block min-h-10 w-full rounded-lg border border-white/15 bg-slate-950 px-3 text-sm text-white">
                {NIGERIA_DIRECTORY_COVERAGE.map((item) => <option key={item.state} value={item.state}>{item.state}</option>)}
              </select>
            </label>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-[820px] w-full border-collapse text-left text-xs">
              <caption className="sr-only">Select a state/category count to review its saved Nigeria support records</caption>
              <thead className="bg-white/[0.035] text-white/55"><tr><th scope="col" className="px-3 py-2.5 font-medium">State</th>{NIGERIA_DIRECTORY_CATEGORIES.map((category) => <th key={category.id} scope="col" className="min-w-28 px-2 py-2.5 font-medium">{category.label}</th>)}</tr></thead>
              <tbody>{NIGERIA_DIRECTORY_COVERAGE.map((item) => <tr key={item.state} className={`border-t border-white/[0.07] ${item.state === state ? "bg-amber-100/[0.07]" : "hover:bg-white/[0.025]"}`}>
                <th scope="row" className="whitespace-nowrap px-2 py-1.5 font-medium text-white/80"><button type="button" onClick={() => selectState(item.state)} aria-pressed={item.state === state && !activeCategory} className="min-h-9 rounded-md px-1.5 text-left underline-offset-2 hover:text-amber-100 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200">{item.state}</button></th>
                {item.categories.map((category) => <td key={category.id} className="px-1.5 py-1.5">
                  <button type="button" onClick={() => selectState(item.state, category.id)} aria-pressed={item.state === state && activeCategory === category.id} aria-label={`${item.state}, ${category.label}: ${category.localContacts.length} local records, ${category.referralRoutes.length} referrals, ${category.nationalRoutes.length} nationwide routes. Show evidence.`} className={`min-h-10 w-full rounded-lg px-2 py-1.5 text-left hover:bg-amber-100/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200 ${item.state === state && activeCategory === category.id ? "bg-amber-100/[0.1] text-white" : "text-white/65"}`}>
                    <span className="block">{category.localContacts.length} local · {category.referralRoutes.length} referrals</span>
                    {category.nationalRoutes.length > 0 && <span className="mt-0.5 block text-[10px] text-emerald-100/55">+ {category.nationalRoutes.length} nationwide</span>}
                  </button>
                </td>)}
              </tr>)}</tbody>
            </table>
          </div>
        </div>

        <div className="mt-3 rounded-2xl border border-white/10 bg-black/10 p-3 sm:p-4" aria-live="polite">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div><h3 className="font-semibold text-white">{state}: {activeCategory ? NIGERIA_DIRECTORY_CATEGORIES.find((item) => item.id === activeCategory)?.label : "source records by category"}</h3><p className="mt-1 text-xs text-white/50">Each row below is a clickable source link. A state office, hotline, meeting finder, or partner directory is a referral, not a local provider.</p></div>
            <div className="flex flex-wrap gap-2"><span className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-white/60">{selectedCoverage.reduce((sum, item) => sum + item.records.length, 0)} state-linked records</span>{activeCategory && <button type="button" onClick={() => setActiveCategory("")} className="min-h-8 rounded-full border border-white/15 px-3 text-xs text-white/70 hover:bg-white/5">Show all categories</button>}</div>
          </div>
          {!activeCategory && <div className="mt-3 rounded-xl border border-rose-100/10 bg-rose-100/[0.025] p-3 text-xs leading-relaxed text-white/60"><p><span className="font-medium text-white/75">Local-contact gaps:</span> {localContactGaps.map((category) => category.label).join(", ") || "None in these six categories"}. A gap means no location-linked contact is saved in this source file; it does not mean no service exists.</p>{stateEvidenceGaps.length > 0 && <p className="mt-1.5"><span className="font-medium text-white/75">No state-linked source saved yet:</span> {stateEvidenceGaps.map((category) => category.label).join(", ")}.</p>}</div>}
          <div className="mt-3 grid gap-2 lg:grid-cols-2">
            {visibleCategories.map((category) => <article key={category.id} className="rounded-xl border border-white/[0.09] bg-slate-950/40 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2"><h4 className="text-sm font-medium text-white/85">{category.label}</h4><span className="text-[11px] text-white/45">{category.localContacts.length} local · {category.referralRoutes.length} referral · {category.nationalRoutes.length} nationwide</span></div>
              {category.records.length === 0 ? <p className="mt-2 text-xs text-white/45">No state-linked record is saved in this category yet.</p> : <ul className="mt-2 space-y-2">
                {category.records.map((record) => <li key={record.id} className="rounded-lg border border-white/[0.07] p-2.5">
                  <div className="flex flex-wrap items-start justify-between gap-2"><div><p className="text-sm text-white/85">{record.name}</p><p className="mt-0.5 text-[11px] text-white/45">{category.localContacts.includes(record) ? "Location-linked service/contact" : "Referral route · not a local provider"} · independent check not recorded</p></div>{record.link && <a href={record.link} target="_blank" rel="noreferrer" className="inline-flex min-h-9 items-center gap-1 rounded-md px-2 text-xs text-amber-100/80 underline underline-offset-2 hover:bg-amber-100/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200">Open source <ExternalLink className="h-3 w-3" /></a>}</div>
                  <p className="mt-1 text-xs leading-relaxed text-white/55">{[record.address, record.city, record.state, record.phone && `Phone: ${record.phone}`, record.alternatePhone && `Alt: ${record.alternatePhone}`, record.email && `Email: ${record.email}`].filter(Boolean).join(" · ") || record.locationLine || "Contact details are not saved."}</p>
                  <p className="mt-1 text-[11px] text-white/40">Source: {record.source || record.sourceName || "Not recorded"} · checked {record.checkedAt || "date not recorded"}</p>
                </li>)}
              </ul>}
              {category.nationalRoutes.length > 0 && <div className="mt-3 border-t border-white/[0.08] pt-3"><p className="text-[11px] font-medium uppercase tracking-wide text-emerald-100/60">Nigeria-wide routes · not local listings</p><ul className="mt-2 space-y-2">{category.nationalRoutes.map((record) => <li key={record.id} className="rounded-lg border border-emerald-100/[0.12] bg-emerald-100/[0.025] p-2.5"><div className="flex flex-wrap items-start justify-between gap-2"><p className="text-sm text-white/85">{record.name}</p>{record.link && <a href={record.link} target="_blank" rel="noreferrer" className="inline-flex min-h-9 items-center gap-1 rounded-md px-2 text-xs text-amber-100/80 underline underline-offset-2 hover:bg-amber-100/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200">Open source <ExternalLink className="h-3 w-3" /></a>}</div><p className="mt-1 text-xs leading-relaxed text-white/55">{[record.phone && `Phone: ${record.phone}`, record.alternatePhone && `Alt: ${record.alternatePhone}`, record.email && `Email: ${record.email}`, record.locationLine].filter(Boolean).join(" · ")}</p><p className="mt-1 text-[11px] text-white/40">Source: {record.source || "Not recorded"} · checked {record.checkedAt || "date not recorded"}</p></li>)}</ul></div>}
            </article>)}
          </div>
        </div>

        <p className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-white/45"><ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-100/70" />These counts do not represent the total number of services. Provider discovery and independent checks must continue state by state and category by category before any completion claim.</p>
      </div>
    </details>
  </section>;
}

function Metric({ label, value, detail }) {
  return <article className="rounded-xl border border-white/10 bg-black/10 p-3"><p className="text-[11px] leading-relaxed text-white/50">{label}</p><p className="mt-1 text-xl font-semibold text-white">{value}</p><p className="mt-1 text-[11px] text-white/40">{detail}</p></article>;
}
