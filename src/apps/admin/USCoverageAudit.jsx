import React, { useMemo, useState } from "react";
import { ChevronDown, ExternalLink, MapPinned, ShieldAlert } from "lucide-react";
import { US_COVERAGE_TOTALS, US_DIRECTORY_CATEGORIES, US_DIRECTORY_COVERAGE, US_DIRECTORY_TARGET, getUSStateCoverage } from "@/data/usDirectoryCoverage";

export default function USCoverageAudit() {
  const [state, setState] = useState("Texas");
  const [activeCategory, setActiveCategory] = useState("");
  const selectedCoverage = useMemo(() => getUSStateCoverage(state), [state]);
  const selectedStateCoverage = US_DIRECTORY_COVERAGE.find((entry) => entry.state === state);
  const visibleCategories = activeCategory ? selectedCoverage.filter((category) => category.id === activeCategory) : selectedCoverage;
  const selectState = (stateName, categoryId = "") => { setState(stateName); setActiveCategory(categoryId); };

  return <section className="mt-4 rounded-3xl border border-sky-100/15 bg-gradient-to-br from-sky-100/[0.04] via-slate-900/75 to-slate-950 p-3 sm:p-4" aria-labelledby="us-coverage-title">
    <details>
      <summary className="group flex cursor-pointer list-none items-center gap-3 rounded-2xl p-2 outline-none focus-visible:ring-2 focus-visible:ring-sky-200 [&::-webkit-details-marker]:hidden">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-sky-100/15 bg-sky-100/[0.06] text-sky-100"><MapPinned className="h-5 w-5" /></span>
        <span className="min-w-0 flex-1">
          <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-sky-100/65">United States · coverage review in progress</span>
          <span id="us-coverage-title" className="mt-0.5 block text-base font-semibold text-white">51 jurisdictions · 6 support categories · {US_COVERAGE_TOTALS.statesCategoryBalanced}/51 meet the {US_DIRECTORY_TARGET.minimumRecordsPerCategoryPerState}-per-category floor</span>
          <span className="mt-0.5 block text-xs text-white/50">Every state must meet both the {US_DIRECTORY_TARGET.minimumRecordsPerState}–{US_DIRECTORY_TARGET.upperPlanningRangePerState} total planning range and the minimum in each category.</span>
        </span>
        <ChevronDown aria-hidden="true" className="h-5 w-5 shrink-0 text-white/55 transition-transform group-open:rotate-180" />
      </summary>

      <div className="mt-3 border-t border-white/10 pt-4">
        <p className="max-w-4xl text-sm leading-relaxed text-white/65">A state meets the initial coverage floor only when it has {US_DIRECTORY_TARGET.minimumRecordsPerState}–{US_DIRECTORY_TARGET.upperPlanningRangePerState} unique state-linked records overall and at least {US_DIRECTORY_TARGET.minimumRecordsPerCategoryPerState} in each support category. Counts distinguish local contacts, county access routes, regional access routes and statewide routes; they deduplicate repeated IDs and exclude national-only pathways. This is a planning floor, not exhaustive coverage. Confirm current availability with each organization.</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-4">
          <Metric label="States and District of Columbia" value={US_COVERAGE_TOTALS.jurisdictions} />
          <Metric label="States meeting category floors" value={`${US_COVERAGE_TOTALS.statesCategoryBalanced}/51`} />
          <Metric label="Unique state-linked records" value={US_COVERAGE_TOTALS.stateLinkedRecords} />
          <Metric label="Saved local contacts" value={US_COVERAGE_TOTALS.localContacts} />
        </div>

        <div className="mt-3 overflow-hidden rounded-2xl border border-white/10">
          <div className="flex flex-wrap items-end justify-between gap-3 border-b border-white/10 bg-black/10 p-3">
            <div><h3 className="text-sm font-semibold">U.S. state coverage snapshot</h3><p className="mt-1 text-xs text-white/50">Select a count to inspect its saved records.</p></div>
            <label className="min-w-48 text-xs text-white/65">Review a state
              <select value={state} onChange={(event) => selectState(event.target.value)} className="mt-1 block min-h-10 w-full rounded-lg border border-white/15 bg-slate-950 px-3 text-sm text-white">
                {US_DIRECTORY_COVERAGE.map((entry) => <option key={entry.code} value={entry.state}>{entry.state}</option>)}
              </select>
            </label>
          </div>
          <details className="group border-t border-white/[0.08]">
            <summary className="flex min-h-11 cursor-pointer items-center gap-2 px-3 text-xs font-medium text-white/65 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-200">
              <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" /> Open state-by-state table
            </summary>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1060px] border-collapse text-left text-xs" aria-label="Saved U.S. support records">
                <thead className="bg-white/[0.035] text-white/55"><tr><th className="p-2.5">State</th><th className="p-2.5">Unique records · target {US_DIRECTORY_TARGET.minimumRecordsPerState}–{US_DIRECTORY_TARGET.upperPlanningRangePerState}</th>{US_DIRECTORY_CATEGORIES.map((category) => <th key={category.id} className="p-2.5">{category.label}</th>)}</tr></thead>
                <tbody>{US_DIRECTORY_COVERAGE.map((entry) => <tr key={entry.code} className={`border-t border-white/[0.07] ${entry.state === state ? "bg-sky-100/[0.05]" : "hover:bg-white/[0.02]"}`}>
                  <th scope="row" className="p-2.5 font-medium text-white/75">{entry.state}</th>
                  <td className="p-2.5"><button type="button" onClick={() => selectState(entry.state)} aria-label={`${entry.state}: ${entry.stateLinkedRecordCount} unique state-linked records; ${entry.targetStatus}; ${entry.categoriesBelowMinimum.length} categories below floor`} className="min-h-9 rounded-md px-2 text-left hover:bg-sky-100/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-200"><span className="block text-white/75">{entry.stateLinkedRecordCount} records</span><span className={`text-[10px] ${entry.meetsMinimum ? "text-emerald-100/70" : "text-amber-100/65"}`}>{entry.meetsMinimum ? "Both floors met" : entry.categoriesBelowMinimum.length ? `${entry.categoriesBelowMinimum.length} category gaps` : entry.targetStatus === "above-range" ? "Above total range" : `Below ${US_DIRECTORY_TARGET.minimumRecordsPerState} total`}</span></button></td>
                  {entry.categories.map((category) => <td key={category.id} className="p-2.5"><button type="button" onClick={() => selectState(entry.state, category.id)} aria-label={`${entry.state}, ${category.label}: ${category.localContacts.length} local, ${category.countywideRoutes.length} county, ${category.regionalRoutes.length} regional, ${category.statewideRoutes.length} statewide routes`} className="min-h-9 rounded-md px-2 text-left text-white/65 hover:bg-sky-100/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-200"><span className="block">{category.localContacts.length} local</span><span className="block text-[10px] text-white/40">{category.countywideRoutes.length} county · {category.regionalRoutes.length} regional</span><span className="text-[10px] text-white/40">{category.statewideRoutes.length} state routes</span></button></td>)}
                </tr>)}</tbody>
              </table>
            </div>
          </details>
        </div>

        <div className="mt-3 rounded-2xl border border-white/10 bg-black/10 p-3 sm:p-4" aria-live="polite">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div><h3 className="font-semibold text-white">{state}: {activeCategory ? US_DIRECTORY_CATEGORIES.find((category) => category.id === activeCategory)?.label : "saved records by category"}</h3><p className="mt-1 text-xs text-white/50">A county or state access route and a nationwide finder are not a local provider address or an open appointment.</p></div>
            <div className="flex flex-wrap gap-2"><span className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-white/60">{selectedStateCoverage?.stateLinkedRecordCount || 0} unique records</span><span className={`rounded-full border px-2.5 py-1 text-xs ${selectedStateCoverage?.meetsMinimum ? "border-emerald-100/20 text-emerald-100/70" : "border-amber-100/20 text-amber-100/70"}`}>{selectedStateCoverage?.meetsMinimum ? "Both floors met" : selectedStateCoverage?.categoriesBelowMinimum?.length ? `${selectedStateCoverage.categoriesBelowMinimum.length} category gaps` : selectedStateCoverage?.targetStatus === "above-range" ? "Above total range" : `Below ${US_DIRECTORY_TARGET.minimumRecordsPerState}-record total`}</span>{activeCategory && <button type="button" onClick={() => setActiveCategory("")} className="min-h-8 rounded-full border border-white/15 px-3 text-xs text-white/70 hover:bg-white/5">Show all categories</button>}</div>
          </div>
          <div className="mt-3 grid gap-2 lg:grid-cols-2">
            {visibleCategories.map((category) => <article key={category.id} className="rounded-xl border border-white/[0.09] bg-slate-950/40 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2"><h4 className="text-sm font-medium text-white/85">{category.label}</h4><span className="text-[11px] text-white/45">{category.localContacts.length} local · {category.countywideRoutes.length} county · {category.regionalRoutes.length} regional · {category.statewideRoutes.length} state · {category.nationwideRoutes.length} national routes</span></div>
              {category.records.length === 0 ? <p className="mt-2 text-xs text-white/45">No local or area-linked record is saved in this category yet.</p> : <ul className="mt-2 space-y-2">{category.records.map((record) => <Record key={record.id} record={record} local={category.localContacts.includes(record)} />)}</ul>}
              {category.nationwideRoutes.length > 0 && <div className="mt-3 border-t border-white/[0.08] pt-3"><p className="text-[11px] font-medium uppercase tracking-wide text-emerald-100/60">Nationwide routes · not local listings</p><ul className="mt-2 space-y-2">{category.nationwideRoutes.map((record) => <Record key={record.id} record={record} local={false} />)}</ul></div>}
            </article>)}
          </div>
        </div>
        <p className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-white/45"><ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-sky-100/70" />Coverage must be researched, cross-checked, and refreshed state by state and category by category. A listing count is never a count of all services in that place.</p>
      </div>
    </details>
  </section>;
}

function Record({ record, local }) {
  return <li className="rounded-lg border border-white/[0.07] p-2.5">
    <div className="flex flex-wrap items-start justify-between gap-2"><div><p className="text-sm text-white/85">{record.name}</p><p className="mt-0.5 text-[11px] text-white/45">{local ? "Location-linked contact · current availability needs confirmation" : record.coverageScope === "county" ? "Countywide access route · not a city provider" : record.coverageScope === "state" ? "Statewide access route · not a local provider" : "Referral route · not a local provider"}</p></div>{record.link && <a href={record.link} target="_blank" rel="noreferrer" className="inline-flex min-h-9 items-center gap-1 rounded-md px-2 text-xs text-amber-100/80 underline underline-offset-2 hover:bg-amber-100/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200">Open source <ExternalLink className="h-3 w-3" /></a>}</div>
          <p className="mt-1 text-xs leading-relaxed text-white/55">{[record.address, record.city, record.county && `${record.county} County`, record.serviceArea && !record.city && record.serviceArea, record.state, record.phone && `Phone: ${record.phone}`, record.email && `Email: ${record.email}`].filter(Boolean).join(" · ") || record.locationLine || "Contact details are not saved."}</p>
    <p className="mt-1 text-[11px] text-white/40">Source: {record.source || "Not recorded"}</p>
  </li>;
}

function Metric({ label, value }) {
  return <article className="rounded-xl border border-white/10 bg-black/10 p-3"><p className="text-[11px] leading-relaxed text-white/50">{label}</p><p className="mt-1 text-xl font-semibold text-white">{value}</p></article>;
}
