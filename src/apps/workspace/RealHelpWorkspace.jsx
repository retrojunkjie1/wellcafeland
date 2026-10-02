// src/apps/workspace/RealHelpWorkspace.jsx
// Unified Assistance — one page, action-first. Housing, Food, Funding, Programs, Emergency, Circles.

import React, { useState, useEffect, useRef } from "react"
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { ExternalLink, Heart, MapPin, PhoneCall, X, UsersRound, Flag, Send } from "lucide-react";
import { rememberWorkspace } from "@/engines/memory/workspaceMemoryEngine";
import { searchResources } from "@/services/resourceSearch";
import { searchDirectory } from "@/services/directorySearch";
import { getFoodStateCode, searchFoodDirectory, searchFoodDirectoryByState, suggestFoodLocations } from "@/services/foodDirectory";
import { matchesHelpLocation } from "@/services/helpLocationMatch";
import { listHousingProviders } from "@/services/housingService";
import { listGrants } from "@/services/grantsService";
import { listSupportPrograms } from "@/services/supportProgramsService";
import { listCircles } from "@/services/circlesService";
import { saveFavoriteResource } from "@/services/directoryService";
import { getCuratedFallback } from "@/lib/directoryCuratedFallback";
import InAppWebView from "@/components/InAppWebView";
import { reportHelpListingIssue, searchPublicHelpListings } from "@/services/helpDirectory";
import { dedupeResourceListings } from "./assistanceListingUtils";
import { getAssistanceSearchStatus, getCuratedSearchStatus } from "./assistanceSearchStatus";
import { getPracticeReturnPath } from "../assistance/assistanceReturnPath";

const DOMAIN_TO_PRIORITY = {
  "food.essentials": "food",
  hotlines: "emergency",
  housing: "housing",
  grants: "funding",
  programs: "programs",
};

const CATEGORY_SEARCH_TERMS = {
  housing: "recovery housing shelter",
  food: "food pantry food assistance",
  funding: "recovery treatment financial assistance",
  programs: "recovery support programs",
  emergency: "crisis support hotline",
  circles: "peer recovery community support groups",
};

function toCuratedWorkspaceResource(resource, domain) {
  return {
    id: `curated:${domain}:${resource.id}`,
    name: resource.name,
    title: resource.name,
    description: resource.description,
    website: resource.link,
    url: resource.link,
    phone: resource.phone || null,
    source: resource.sourceManaged ? "WellnessCafe" : resource.source,
    address: resource.address || "",
    locationLabel: resource.locationLabel || (resource.address ? "Address" : "Service area"),
    city: resource.city || "",
    state: resource.state || "",
    locationLine: resource.locationLine || "",
    postalCode: resource.postalCode || "",
    checkedAt: resource.checkedAt || null,
    sourceManaged: resource.sourceManaged === true,
    curated: true,
    verification: { status: "curated" },
  };
}

const RealHelpWorkspace = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isAssistanceRoute = location.pathname === "/assistance";
  const returnToPractice = getPracticeReturnPath(location.state);
  const qp = searchParams;
  const urlPriority = qp.get("priority");
  const urlDomain = qp.get("domain");
  const urlQuery = qp.get("query") || "";
  const urlRegion = qp.get("region") || "";
  const resolvedDomain = (urlDomain && urlDomain.trim()) ? urlDomain.trim() : null;
  const resolvedPriority = urlPriority || (urlDomain && DOMAIN_TO_PRIORITY[urlDomain]) || "housing";
  const internalFoodNavigationRef = useRef("");
  const [activeTab, setActiveTab] = useState(resolvedPriority);

  // A same-route navigation can change search intent without remounting this
  // workspace. Keep the visible form and results aligned with that new URL.
  useEffect(() => {
    const currentUrl = `${location.pathname}${location.search}`;
    if (internalFoodNavigationRef.current === currentUrl) {
      // The selected place is already represented by the state used to load
      // its results. Keep those results while the address bar catches up.
      internalFoodNavigationRef.current = "";
      return;
    }
    internalFoodNavigationRef.current = "";
    const next = urlPriority || (urlDomain && DOMAIN_TO_PRIORITY[urlDomain]) || "housing";
    setActiveTab((prev) => (prev !== next ? next : prev));
    setQuery(urlQuery);
    setRegion(urlRegion);
    setSelectedFoodLocation(null);
    setFoodLocationOptions([]);
    setFoodLocationMessage("");
    setResults([]);
    setCuratedResults([]);
    setSearchResponse(null);
  }, [location.pathname, location.search, urlPriority, urlDomain, urlQuery, urlRegion]);
  const [query, setQuery] = useState(urlQuery);
  const [region, setRegion] = useState(urlRegion);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [curatedResults, setCuratedResults] = useState([]);
  const [searchResponse, setSearchResponse] = useState(null)
  const [webViewUrl, setWebViewUrl] = useState(null)
  const [selectedDetail, setSelectedDetail] = useState(null)
  const [savedIds, setSavedIds] = useState(() => new Set())
  const [savingIds, setSavingIds] = useState(() => new Set())
  const [actionNotice, setActionNotice] = useState(null)
  const [showAllFoodResults, setShowAllFoodResults] = useState(false)
  const [foodLocationOptions, setFoodLocationOptions] = useState([])
  const [foodLocationMessage, setFoodLocationMessage] = useState("")
  const [foodLocationBusy, setFoodLocationBusy] = useState(false)
  const [selectedFoodLocation, setSelectedFoodLocation] = useState(null)
  const debounceRef = useRef(null);
  const abortControllerRef = useRef(null);
  const searchInputRef = useRef(null);
  const regionInputRef = useRef(null);
  const requestIdRef = useRef(0);
  const DEBOUNCE_MS = 600;
  const MIN_QUERY_LEN = 3;

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (activeTab === "food") {
      // Resolve the typed place only after an explicit click, never on each keystroke.
      if (selectedFoodLocation?.value === region.trim()) return undefined;
      abortControllerRef.current?.abort();
      requestIdRef.current += 1;
      setLoading(false);
      setResults([]);
      setSearchResponse(null);
      setCuratedResults([]);
      setFoodLocationOptions([]);
      setFoodLocationMessage("");
      return () => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = null;
      };
    }
    debounceRef.current = setTimeout(() => loadData(), DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = null;
    };
  }, [activeTab, query, region, resolvedDomain, selectedFoodLocation]);

  useEffect(() => {
    // Remember workspace visit (PHASE 44)
    rememberWorkspace("real-help", {
      priority: activeTab,
      query: query || null,
      region: region || null,
    });
  }, [activeTab, query, region]);

  useEffect(() => {
    setShowAllFoodResults(false);
  }, [activeTab, region]);

  const loadData = async ({ searchFood = false } = {}) => {
    if (abortControllerRef.current) abortControllerRef.current.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;
    const signal = controller.signal;
    const reqId = ++requestIdRef.current;
    let reviewedDirectoryError = "";
    let reviewedDirectoryAvailable = false;

    setLoading(true);
    try {
      // Load curated Firestore data first
      let curated = [];
      
      if (activeTab === "housing") {
        curated = await listHousingProviders({ region: region || undefined });
        curated = [...curated, ...getCuratedFallback("housing", query, region).map((item) => toCuratedWorkspaceResource(item, "housing"))];
      } else if (activeTab === "funding") {
        const savedGrants = await listGrants({ region: region || undefined });
        const benefitPathways = getCuratedFallback("grants", query, region).map((item) => toCuratedWorkspaceResource(item, "grants"));
        curated = [...savedGrants, ...benefitPathways];
      } else if (activeTab === "programs") {
        curated = await listSupportPrograms({ region: region || undefined });
        if (!curated.length) curated = getCuratedFallback("programs", query).map((item) => toCuratedWorkspaceResource(item, "programs"));
      } else if (activeTab === "circles") {
        const localCircles = await listCircles({ region: region || undefined });
        const peerPathways = getCuratedFallback("peer", query, region).map((item) => toCuratedWorkspaceResource(item, "peer"));
        curated = [...localCircles, ...peerPathways];
      } else if (activeTab === "food") {
        curated = [];
      } else if (activeTab === "emergency") {
        curated = getCuratedFallback("hotlines", query, region).map((item) => toCuratedWorkspaceResource(item, "hotlines"));
      }

      // Route the admin-reviewed, permission-backed directory into each
      // matching client category. This is separate from broad web search and
      // only queries when the client has supplied an area; the callable
      // returns published records with a current source check and exact
      // city/state/ZIP match.
      if (region.trim() && ["funding", "programs", "circles", "emergency"].includes(activeTab)) {
        try {
          const reviewed = await searchPublicHelpListings(activeTab, region.trim());
          reviewedDirectoryAvailable = true;
          curated = [
            ...curated,
            ...(reviewed.listings || []).map((item) => toCuratedWorkspaceResource(item, activeTab)),
          ];
        } catch (error) {
          if (signal.aborted || reqId !== requestIdRef.current) return;
          reviewedDirectoryError = error?.message || "Reviewed local listings are temporarily unavailable.";
        }
      }

      if (signal.aborted || reqId !== requestIdRef.current) return;
      setCuratedResults(curated);

      // A location by itself is a valid search: supply a useful category query
      // so people do not need to know the right search words before finding help.
      const typedQuery = (query || "").trim()
      const q = typedQuery.length >= MIN_QUERY_LEN ? typedQuery : (region.trim() ? CATEGORY_SEARCH_TERMS[activeTab] : "")
      if (q) {
        const domain = resolvedDomain || (activeTab === "housing" ? "housing" : activeTab === "food" ? "food.essentials" : activeTab === "funding" ? "grants" : activeTab === "programs" ? "assistance" : activeTab === "emergency" ? "hotlines" : activeTab === "circles" ? "peer" : "programs");

        // Programs tab: use globalResourceSearch (live pipeline) with abort support
        if (activeTab === "programs") {
          const dirResult = await searchDirectory({
            query: q,
            domain,
            location: region || undefined,
            category: activeTab,
            limit: 20,
            signal,
          });
          if (signal.aborted || reqId !== requestIdRef.current) return;
          if (import.meta.env.DEV) {
            console.debug("[RealHelp] programs search", { query: q, region: region || null, domain, resultCount: dirResult.items?.length ?? 0 });
          }
          setSearchResponse({ ok: dirResult.ok, results: dirResult.items, error: reviewedDirectoryError || (reviewedDirectoryAvailable ? null : dirResult.error), meta: dirResult.meta });
          if (dirResult.ok && dirResult.items?.length) {
            setResults(dirResult.items.map((r) => ({
              id: r.id,
            name: r.title,
            title: r.title,
            description: r.description || r.summary,
            website: r.url,
            url: r.url,
            city: r.city,
            state: r.state,
            address: r.address,
            locationLine: r.locationLine,
            region: r.state || r.address || r.locationLine,
              source: r.source,
              verification: r.verified ? { status: "verified" } : { status: "external" },
              ...(domain && { domain: domain }),
            })));
          } else {
            setResults([]);
          }
        } else if (activeTab === "food") {
          if (!region.trim() || !searchFood) {
            setSearchResponse(null);
            setResults([]);
            return;
          }
          const foodResult = await searchFoodDirectory({ area: region, limit: 20, signal });
          if (signal.aborted || reqId !== requestIdRef.current) return;
          setSearchResponse({
            ok: foodResult.ok,
            results: foodResult.items,
            error: foodResult.error,
            meta: { source: "feedam", totalAvailable: foodResult.totalAvailable, attribution: foodResult.attribution },
          });
          setResults(foodResult.items.map((item) => ({ ...item, domain })));
        } else {
          const searchResult = await searchResources({
            query: q,
            domain: domain,
            region: region || undefined,
            category: activeTab,
          });
          if (signal.aborted || reqId !== requestIdRef.current) return;
          setSearchResponse({ ...searchResult, error: reviewedDirectoryError || (reviewedDirectoryAvailable ? null : searchResult.error) });
          if (searchResult.ok && searchResult.results) {
            setResults(searchResult.results.map((r) => ({
              ...r,
              ...(domain && { domain: domain }),
            })));
          } else {
            setResults([]);
          }
        }
      } else {
        setResults([]);
        setSearchResponse(null);
      }
    } catch (err) {
      if (err?.name === "AbortError") return;
      console.error("Failed to load real help data:", err);
      setResults([]);
      setSearchResponse({ ok: false, error: reviewedDirectoryAvailable ? null : "Live search is temporarily unavailable." });
    } finally {
      if (abortControllerRef.current === controller) setLoading(false);
    }
  };

  const handleSaveFavorite = async (item) => {
    const itemId = item.id || item.url || item.website || item.name || item.title;
    setSavingIds((previous) => new Set(previous).add(itemId));
    setActionNotice(null);
    try {
      const domain = resolvedDomain || (activeTab === "housing" ? "housing" : activeTab === "food" ? "food.essentials" : activeTab === "funding" ? "grants" : activeTab === "programs" ? "assistance" : activeTab === "emergency" ? "hotlines" : activeTab === "circles" ? "peer" : "programs");
      
      const response = await saveFavoriteResource(domain, {
        id: item.id,
        title: item.name || item.title,
        description: item.description || item.snippet,
        url: item.website || item.url,
        source: item.source || "curated",
      });
      if (!response?.ok) throw new Error(response?.error || "This resource could not be saved right now.");
      setSavedIds((previous) => new Set(previous).add(itemId));
      setActionNotice({ type: "success", message: "Saved to your favorites." });
    } catch (err) {
      console.error("Failed to save favorite:", err);
      setActionNotice({ type: "error", message: err?.message || "Could not save this resource. Please try again." });
    } finally {
      setSavingIds((previous) => {
        const next = new Set(previous);
        next.delete(itemId);
        return next;
      });
    }
  };

  const handleOpenDetail = (item) => {
    setSelectedDetail(item);
  };

  const runSelectedFoodSearch = async (selection) => {
    const controller = new AbortController();
    abortControllerRef.current?.abort();
    abortControllerRef.current = controller;
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setFoodLocationOptions([]);
    setFoodLocationMessage("");
    setResults([]);
    setSearchResponse(null);
    setCuratedResults([]);
    try {
      const response = selection.kind === "state"
        ? await searchFoodDirectoryByState({ state: selection.stateCode, signal: controller.signal })
        : await searchFoodDirectory({ area: selection.value, limit: 20, signal: controller.signal });
      if (controller.signal.aborted || requestId !== requestIdRef.current) return;
      setSearchResponse({
        ok: response.ok,
        error: response.error,
        results: response.items,
        mode: response.mode || "nearby",
        area: selection.kind === "state" ? selection.value : response.area || selection.value,
        page: response.page || 1,
        nextPage: response.nextPage || null,
        hasMore: Boolean(response.hasMore),
        meta: { source: "feedam", totalAvailable: response.totalAvailable, attribution: response.attribution },
      });
      setResults(response.items || []);
    } catch (error) {
      if (error?.name !== "AbortError") {
        setSearchResponse({ ok: false, error: "The food directory is temporarily unavailable. Try again or call 211." });
      }
    } finally {
      if (abortControllerRef.current === controller) setLoading(false);
    }
  };

  const loadMoreStatewideFood = async () => {
    if (selectedFoodLocation?.kind !== "state" || !searchResponse?.nextPage || foodLocationBusy) return;
    const controller = new AbortController();
    abortControllerRef.current?.abort();
    abortControllerRef.current = controller;
    const requestId = ++requestIdRef.current;
    setFoodLocationBusy(true);
    try {
      const response = await searchFoodDirectoryByState({ state: selectedFoodLocation.stateCode, page: searchResponse.nextPage, signal: controller.signal });
      if (controller.signal.aborted || requestId !== requestIdRef.current) return;
      if (!response.ok) {
        setSearchResponse((current) => ({ ...current, error: response.error || "More listings could not be loaded." }));
        return;
      }
      setResults((current) => {
        const existing = new Set(current.map((item) => item.id));
        return [...current, ...response.items.filter((item) => !existing.has(item.id))];
      });
      setSearchResponse((current) => ({ ...current, error: null, page: response.page, nextPage: response.nextPage, hasMore: response.hasMore, meta: { ...current.meta, totalAvailable: (current.meta?.totalAvailable || 0) + response.totalAvailable } }));
    } catch (error) {
      if (error?.name !== "AbortError") setSearchResponse((current) => ({ ...current, error: "More food listings are temporarily unavailable. Try again in a moment." }));
    } finally {
      if (abortControllerRef.current === controller) setFoodLocationBusy(false);
    }
  };

  const handleFoodLocationAction = async () => {
    const text = region.trim();
    if (text.length < 3) {
      setFoodLocationMessage("Type at least 3 letters, or enter a 5-digit ZIP code.");
      return;
    }
    if (selectedFoodLocation?.value === text) {
      await runSelectedFoodSearch(selectedFoodLocation);
      return;
    }

    const stateCode = getFoodStateCode(text);
    if (stateCode && text.length > 2) {
      const stateName = text.length === 2 ? text.toUpperCase() : text;
      setFoodLocationOptions([{ kind: "state", stateCode, value: stateName, label: `Browse food listings across ${stateName}` }]);
      setFoodLocationMessage("Choose a statewide browse, or type a city for nearby options.");
      return;
    }

    if (/^\d{5}$/.test(text)) {
      const selection = { kind: "zip", value: text, label: `Search near ${text}` };
      setSelectedFoodLocation(selection);
      syncFoodLocationUrl(selection);
      await runSelectedFoodSearch(selection);
      return;
    }

    setFoodLocationBusy(true);
    setFoodLocationMessage("");
    setFoodLocationOptions([]);
    try {
      const response = await suggestFoodLocations({ query: text });
      const options = response.items.map((value) => ({ kind: "city", value, label: value }));
      if (options.length) {
        setFoodLocationOptions(options);
        setFoodLocationMessage("Choose the place you mean to see nearby food support.");
      } else if (/^.+,\s*([A-Za-z]{2}|[A-Za-z][A-Za-z\s]+)$/.test(text)) {
        setFoodLocationOptions([{ kind: "city", value: text, label: `Search this area: ${text}` }]);
        setFoodLocationMessage("No place suggestions came back. You can still search this exact city and state.");
      } else {
        setFoodLocationMessage(response.error || `No place suggestions for “${text}”. Add a state or ZIP code, or call 211.`);
      }
    } catch (error) {
      if (error?.name !== "AbortError") setFoodLocationMessage("Place suggestions are unavailable. Add a state or ZIP code, or call 211.");
    } finally {
      setFoodLocationBusy(false);
    }
  };

  const handleChooseFoodLocation = async (selection) => {
    setSelectedFoodLocation(selection);
    setRegion(selection.value);
    syncFoodLocationUrl(selection);
    await runSelectedFoodSearch(selection);
  };

  const syncFoodLocationUrl = (selection) => {
    const params = new URLSearchParams(location.search);
    params.set("priority", "food");
    params.delete("domain");
    if (query.trim()) params.set("query", query.trim());
    else params.delete("query");
    params.set("region", selection.value);
    const nextUrl = `${location.pathname}?${params.toString()}`;
    const currentUrl = `${location.pathname}${location.search}`;
    if (nextUrl === currentUrl) return;
    internalFoodNavigationRef.current = nextUrl;
    navigate(nextUrl, { state: location.state });
  };

  const supportTypes = [
    { id: "housing", label: "Housing and a safe place", group: "Food and essentials" },
    { id: "food", label: "Food and groceries", group: "Food and essentials" },
    { id: "programs", label: "Treatment and recovery programs", group: "Care and recovery" },
    { id: "funding", label: "Funding and benefits", group: "Care and recovery" },
    { id: "circles", label: "Peer and community circles", group: "Care and recovery" },
    { id: "emergency", label: "Urgent support", group: "Immediate safety" },
  ];

  const handleCategoryChange = (nextCategory) => {
    if (!nextCategory || nextCategory === activeTab) return;
    const params = new URLSearchParams(location.search);
    params.set("priority", nextCategory);
    params.delete("domain");
    if (query.trim()) params.set("query", query.trim());
    else params.delete("query");
    if (region.trim()) params.set("region", region.trim());
    else params.delete("region");
    navigate(`${location.pathname}?${params.toString()}`, { state: location.state });
  };

  const allResults = dedupeResourceListings([...curatedResults, ...results]);
  const localFoodResults = activeTab === "food"
    ? allResults.filter((item) => item.isFoodDirectoryResult).sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity))
    : [];
  const broaderFoodResults = localFoodResults.length
    ? allResults.filter((item) => !item.isFoodDirectoryResult)
    : [];
  const orderedResults = localFoodResults.length
    ? [...localFoodResults, ...allResults.filter((item) => !item.isFoodDirectoryResult)]
    : allResults;
  const visibleResults = localFoodResults.length && !showAllFoodResults
    ? orderedResults.slice(0, 6)
    : orderedResults;
  const requiresLocationProof = activeTab !== "food" && Boolean(region.trim());
  const locatedResults = requiresLocationProof
    ? allResults.filter((item) => matchesHelpLocation(item, region))
    : visibleResults;
  const broaderLocationResults = requiresLocationProof
    ? allResults.filter((item) => !matchesHelpLocation(item, region))
    : [];
  const showBroaderWhenNoLocalMatch = requiresLocationProof && locatedResults.length === 0 && ["funding", "emergency", "circles"].includes(activeTab);
  const hasSearchIntent = Boolean(query.trim() || region.trim());
  const showingFallback = Boolean(searchResponse?.fallback || searchResponse?.meta?.fallback);
  const webViewTitle = "Resource";
  const unavailableNextStep = activeTab === "programs"
    ? { label: "Open treatment directory", action: () => setWebViewUrl("https://findtreatment.gov") }
    : activeTab === "circles"
      ? { label: "Explore community support", action: () => navigate("/assistance/community") }
      : { label: "Choose another support option", action: () => navigate("/assistance") };

  return (
    <div className="flex h-screen flex-col bg-slate-950 text-white">
      {/* Minimal header — one line, action-first */}
      <div className="flex-shrink-0 border-b border-white/10 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-medium text-white">Find Help</h1>
          </div>
          {isAssistanceRoute ? (
            <a href="tel:988" className="inline-flex min-h-11 items-center gap-2 whitespace-nowrap rounded-xl border border-rose-200/25 bg-rose-100/[0.06] px-2.5 text-[13px] font-semibold text-rose-100 hover:bg-rose-100/10 sm:px-4 sm:text-sm">Call or text 988</a>
          ) : (
            <button type="button" onClick={() => navigate(returnToPractice || "/assistance")} className="min-h-11 rounded-lg px-2 text-sm text-white/60 hover:bg-white/5 hover:text-white">← {returnToPractice ? "Back to your practice" : "Back to support choices"}</button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 space-y-4">
          <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.025] p-3 sm:flex-row sm:items-end sm:justify-between sm:px-4">
            <label className="block min-w-0 flex-1 text-sm font-medium text-white/70">
              What kind of help are you looking for?
              <select
                aria-label="Support type"
                value={activeTab}
                onChange={(event) => handleCategoryChange(event.target.value)}
                className="mt-1.5 min-h-12 w-full rounded-xl border border-white/10 bg-slate-950 px-3 text-base text-white outline-none focus:border-wcGold/60 focus:ring-2 focus:ring-wcGold/20 sm:max-w-xl"
              >
                <optgroup label="Food and essentials">
                  {supportTypes.filter((type) => type.group === "Food and essentials").map((type) => <option key={type.id} value={type.id}>{type.label}</option>)}
                </optgroup>
                <optgroup label="Care and recovery">
                  {supportTypes.filter((type) => type.group === "Care and recovery").map((type) => <option key={type.id} value={type.id}>{type.label}</option>)}
                </optgroup>
                <optgroup label="Immediate safety">
                  {supportTypes.filter((type) => type.group === "Immediate safety").map((type) => <option key={type.id} value={type.id}>{type.label}</option>)}
                </optgroup>
              </select>
            </label>
            {isAssistanceRoute && <details className="group relative sm:shrink-0">
              <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 rounded-xl border border-white/10 px-4 text-sm font-medium text-white/75 transition hover:border-white/20 hover:bg-white/5 sm:min-w-52">
                More ways to connect <span aria-hidden="true" className="text-white/45 transition group-open:rotate-180">⌄</span>
              </summary>
              <div className="mt-2 grid gap-1 rounded-xl border border-white/10 bg-slate-900 p-2 sm:absolute sm:right-0 sm:z-20 sm:w-72 sm:shadow-xl">
                <button type="button" onClick={() => navigate("/recovery/meetings")} className="flex min-h-11 items-center gap-2 rounded-lg px-3 text-left text-sm text-white/80 hover:bg-white/5"><UsersRound className="h-4 w-4 text-amber-200" />A.A. or N.A. meetings</button>
                <button type="button" onClick={() => navigate("/assistance/community")} className="flex min-h-11 items-center gap-2 rounded-lg px-3 text-left text-sm text-white/80 hover:bg-white/5"><Heart className="h-4 w-4 text-emerald-200" />Give or receive community support</button>
                <button type="button" onClick={() => navigate("/providers")} className="flex min-h-11 items-center gap-2 rounded-lg px-3 text-left text-sm text-white/80 hover:bg-white/5"><UsersRound className="h-4 w-4 text-sky-200" />Find a practitioner</button>
              </div>
            </details>}
          </div>

          {/* Search - debounced (450ms), Enter triggers immediate search */}
          <div className="flex flex-col sm:flex-row gap-3">
            {activeTab !== "food" && (
              <div className="min-w-0 flex-1">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      if (debounceRef.current) clearTimeout(debounceRef.current)
                      debounceRef.current = null
                      loadData()
                    }
                  }}
                  placeholder={`Search ${supportTypes.find((type) => type.id === activeTab)?.label.toLowerCase() || "support"}...`}
                  className="w-full px-4 py-3 rounded-lg border border-white/10 bg-white/5 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-wcGold/50 transition"
                />
              </div>
            )}
            <label className={activeTab === "food" ? "block min-w-0 flex-1 text-sm font-medium text-white/70" : "block w-full text-sm font-medium text-white/70 sm:w-64"}>
              Your area
              <input
                aria-label="Your area"
                ref={regionInputRef}
                type="text"
                value={region}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    if (debounceRef.current) clearTimeout(debounceRef.current)
                    debounceRef.current = null
                    if (activeTab === "food") handleFoodLocationAction()
                    else loadData()
                  }
                }}
                onChange={(e) => {
                  setRegion(e.target.value);
                  setSelectedFoodLocation(null);
                  setFoodLocationOptions([]);
                  setFoodLocationMessage("");
                }}
                placeholder={activeTab === "food" ? "City, state, ZIP or place" : "Region (e.g., California)"}
                className="mt-1.5 min-h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white placeholder-white/40 transition focus:outline-none focus:ring-2 focus:ring-wcGold/50"
              />
            </label>
            {activeTab === "food" && (
              <button
                type="button"
                onClick={handleFoodLocationAction}
                disabled={region.trim().length < 3 || loading || foodLocationBusy}
                className="min-h-12 shrink-0 rounded-lg bg-wcGold px-5 text-sm font-semibold text-slate-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {foodLocationBusy ? "Finding places…" : selectedFoodLocation?.value === region.trim() ? (selectedFoodLocation.kind === "state" ? "Browse this state" : "Search nearby food") : "Find a place"}
              </button>
            )}
          </div>
          {actionNotice && (
            <p role={actionNotice.type === "error" ? "alert" : "status"} className={`text-sm ${actionNotice.type === "error" ? "text-rose-200" : "text-emerald-200"}`}>
              {actionNotice.message}
            </p>
          )}
          {activeTab === "food" && region.trim() && (
            <p className="text-xs leading-relaxed text-white/50">Your place is sent to Feed America only when you choose Find a place. Nearby results use the place you select.</p>
          )}
          {activeTab === "food" && foodLocationOptions.length > 0 && (
            <section aria-label="Choose a place" className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
              <h2 className="text-sm font-semibold text-white">Choose a place</h2>
              {foodLocationMessage && <p className="mt-1 text-sm text-white/60">{foodLocationMessage}</p>}
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {foodLocationOptions.map((option) => (
                  <button key={`${option.kind}:${option.value}`} type="button" onClick={() => handleChooseFoodLocation(option)} disabled={loading} className="min-h-12 rounded-xl border border-white/15 px-4 py-3 text-left text-sm font-medium text-white hover:border-wcGold/50 hover:bg-wcGold/10 disabled:opacity-50">
                    <MapPin className="mr-2 inline h-4 w-4 text-wcGold" aria-hidden="true" />{option.label}
                  </button>
                ))}
              </div>
            </section>
          )}
          {activeTab === "food" && foodLocationMessage && foodLocationOptions.length === 0 && !loading && (
            <p role="status" className="rounded-xl border border-amber-200/15 bg-amber-100/[0.04] px-4 py-3 text-sm text-amber-50/80">{foodLocationMessage}</p>
          )}
          {searchResponse?.error && !loading && (activeTab === "food" || allResults.length > 0) && (
            <p role="status" className="rounded-xl border border-white/10 bg-white/[0.025] px-4 py-3 text-sm text-white/65">{activeTab === "food" ? `${searchResponse.error}${curatedResults.length ? " National food-support options remain below." : ""}` : getAssistanceSearchStatus({ category: activeTab, region, localCount: locatedResults.length })}</p>
          )}
          {showingFallback && !searchResponse?.error && !loading && allResults.length > 0 && (
            <p role="status" className="rounded-xl border border-white/10 bg-white/[0.025] px-4 py-3 text-sm text-white/65">{getCuratedSearchStatus({ category: activeTab, region, localCount: locatedResults.length })}</p>
          )}

          {/* Results */}
          {activeTab === "food" && foodLocationOptions.length > 0 ? null : loading ? (
            <div className="flex flex-col items-center justify-center p-12 gap-3">
              <div className="w-8 h-8 border-2 border-wcGold/30 border-t-wcGold rounded-full animate-spin"></div>
              <div className="text-sm text-white/50">Finding resources...</div>
            </div>
          ) : allResults.length === 0 ? (
            searchResponse?.error && hasSearchIntent ? (
              <section role="alert" className="mx-auto flex max-w-xl flex-col items-center gap-3 rounded-2xl border border-rose-200/20 bg-rose-100/[0.045] p-6 text-center">
                <Heart className="h-10 w-10 text-rose-200/70" />
                <h2 className="text-base font-semibold text-white">We couldn’t complete this search</h2>
                <p className="text-sm leading-relaxed text-white/70">{searchResponse.error}</p>
                <p className="text-xs leading-relaxed text-white/50">Your search area is still here. You can try again or adjust your words.</p>
                <div className="mt-1 flex flex-wrap justify-center gap-2">
                  <button type="button" onClick={() => loadData()} className="min-h-11 rounded-xl bg-amber-200 px-4 text-sm font-semibold text-slate-950 hover:bg-amber-100">Try again</button>
                  <button type="button" onClick={unavailableNextStep.action} className="min-h-11 rounded-xl border border-white/20 px-4 text-sm font-medium text-white/80 hover:bg-white/10">{unavailableNextStep.label}</button>
                  {requiresLocationProof && <a href="tel:211" className="inline-flex min-h-11 items-center rounded-xl border border-wcGold/35 px-4 text-sm font-semibold text-wcGold">Call 211 for local help</a>}
                </div>
              </section>
            ) : (
            activeTab === "food" && foodLocationOptions.length === 0 ? (
              <section role="status" className="mx-auto flex max-w-xl flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-6 text-center">
                <MapPin className="h-8 w-8 text-wcGold/80" aria-hidden="true" />
                <h2 className="text-base font-semibold text-white">
                  {searchResponse?.ok ? (searchResponse?.mode === "statewide" ? "No food listings matched this state" : "No nearby food listings matched") : "Find food near you"}
                </h2>
                <p className="text-sm leading-relaxed text-white/65">
                  {searchResponse?.ok
                    ? searchResponse?.mode === "statewide" ? "Try a city for nearby options, or call 211 for local food support." : "Try another ZIP or city, or call 211 for local food support."
                    : "Enter at least 3 letters or a 5-digit ZIP, then choose Find a place. Pick a suggestion to see nearby support."}
                </p>
                <a href="tel:211" className="inline-flex min-h-11 items-center rounded-xl border border-wcGold/35 px-4 text-sm font-semibold text-wcGold transition hover:bg-wcGold/10">
                  Call 211
                </a>
              </section>
            ) : (
            requiresLocationProof ? (
              <section role="status" className="mx-auto flex max-w-xl flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-6 text-center">
                <MapPin className="h-8 w-8 text-wcGold/80" aria-hidden="true" />
                <h2 className="text-base font-semibold text-white">We don’t have a confirmed nearby listing yet</h2>
                <p className="text-sm leading-relaxed text-white/65">Try a nearby city or ZIP, or use the support options below to ask for help in {region}.</p>
                <a href="tel:211" className="inline-flex min-h-11 items-center rounded-xl border border-wcGold/35 px-4 text-sm font-semibold text-wcGold transition hover:bg-wcGold/10">Call 211</a>
              </section>
            ) : (
            <div className="flex flex-col items-center justify-center p-10 gap-3">
              <Heart className="h-10 w-10 text-white/20" />
              <p className="text-sm text-white/50 text-center">
                {query || region ? "Try different words or region." : `Pick a category above or search.`}
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <button type="button" onClick={() => regionInputRef.current?.focus()} className="px-3 py-1.5 text-xs rounded-lg bg-wcGold/20 text-wcGold border border-wcGold/40 hover:bg-wcGold/30 font-medium">Add region</button>
                <button type="button" onClick={() => setWebViewUrl("https://findtreatment.gov")} className="px-3 py-1.5 text-xs rounded-lg border border-white/20 text-white/70 hover:bg-white/10 font-medium inline-flex items-center gap-1">
                  <ExternalLink className="h-3 w-3" /> National resources
                </button>
              </div>
            </div>
            )))
          ) : (
            <>
              {!(requiresLocationProof && locatedResults.length === 0 && showBroaderWhenNoLocalMatch) && <div className="flex flex-col gap-2 mb-4">
                <p className="text-sm text-white/60">
                  {searchResponse?.mode === "statewide" ? (
                    <>Food listings across <span className="font-medium text-white">{searchResponse.area}</span><span className="ml-2 text-xs text-white/45">Statewide list, not sorted by distance; call before traveling.</span></>
                  ) : localFoodResults.length ? (
                    <>
                      Found <span className="font-medium text-white">{localFoodResults.length}</span> nearby food option{localFoodResults.length !== 1 ? "s" : ""}
                      {broaderFoodResults.length > 0 ? <span className="ml-2 text-xs text-white/45">+ {broaderFoodResults.length} broader food resources</span> : null}
                    </>
                  ) : requiresLocationProof && locatedResults.length ? (
                    <>Found <span className="font-medium text-white">{locatedResults.length}</span> listing{locatedResults.length !== 1 ? "s" : ""} with a location matching <span className="font-medium text-white">{region}</span></>
                  ) : requiresLocationProof ? (
                    <>No nearby listing was confirmed for <span className="font-medium text-white">{region}</span>; showing other ways to connect</>
                  ) : (
                    <>Found <span className="font-medium text-white border border-black shadow-[0px_4px_12px_0px_rgba(0,0,0,0.15)]">{allResults.length}</span> resource{allResults.length !== 1 ? 's' : ''}</>
                  )}
                </p>
              </div>}

              {requiresLocationProof && locatedResults.length === 0 && !showBroaderWhenNoLocalMatch && (
                <section role="status" className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3">
                  <p className="text-sm text-white/70">This directory has no confirmed nearby listing for {region}. These options can help you reach support in or near your area.</p>
                  <a href="tel:211" className="inline-flex min-h-10 shrink-0 items-center rounded-lg bg-wcGold px-3 text-sm font-semibold text-slate-950">Call 211</a>
                </section>
              )}

              {locatedResults.length > 0 && <div role="list" aria-label={activeTab === "food" ? "Food support results" : requiresLocationProof ? "Location-matched support resources" : "Nearby support resources"} className="space-y-2.5">
                {locatedResults.map((item, index) => (
                  <article
                    key={item.id || index}
                    role="listitem"
                    className="group rounded-xl border border-white/10 bg-white/[0.035] px-3.5 py-3 transition-colors hover:border-wcGold/30 hover:bg-white/[0.055] sm:px-4"
                  >
                    <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-5">
                      <div className="min-w-0 flex-1">
                        <div className="flex min-w-0 items-center gap-x-2">
                          <h3 title={item.name || item.title} className="min-w-0 max-w-[75vw] truncate text-[15px] font-semibold leading-snug text-white sm:max-w-[28rem] sm:text-base">
                            {item.name || item.title}
                          </h3>
                        </div>

                        <div className="mt-1 flex min-w-0 items-start gap-1.5 text-sm text-white/60">
                          {(item.address || item.locationLine || item.region) && (
                            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                          )}
                          <div className="min-w-0">
                            {(item.address || item.locationLine || item.region) && (
                              <div className="break-words leading-snug">{item.address || item.locationLine || item.region}</div>
                            )}
                            {item.distance != null && (
                              <div className="mt-0.5 text-xs text-white/45">About {item.distance.toFixed(1)} mi from your search area</div>
                            )}
                          {item.capacity_status && (
                            <span className={`rounded-full px-2 py-0.5 font-medium ${
                              item.capacity_status === "open" ? "bg-green-400/15 text-green-200" :
                              item.capacity_status === "waitlist" ? "bg-yellow-400/15 text-yellow-200" :
                              "bg-red-400/15 text-red-200"
                            }`}>
                              {item.capacity_status === "open" ? "Currently open" :
                              item.capacity_status === "waitlist" ? "Waitlist available" :
                               "Limited availability"}
                            </span>
                          )}
                          </div>
                        </div>
                      </div>

                      <div className="flex shrink-0 flex-wrap items-center gap-1.5 sm:justify-end">
                          {item.phone && (
                            <a
                              href={`tel:${item.phone}`}
                              className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 text-xs font-medium text-white transition hover:border-wcGold/30 hover:bg-wcGold/10"
                            >
                              <PhoneCall className="h-3.5 w-3.5" />
                              <span>Call</span>
                            </a>
                          )}
                      <button
                        onClick={() => handleOpenDetail(item)}
                        className="inline-flex min-h-9 items-center rounded-lg px-3 text-xs font-medium text-white/75 transition hover:bg-white/10 hover:text-white"
                      >
                        Details
                      </button>
                      <button
                        onClick={() => handleSaveFavorite(item)}
                        disabled={savingIds.has(item.id || item.url || item.website || item.name || item.title)}
                        aria-label={savedIds.has(item.id || item.url || item.website || item.name || item.title) ? "Saved to favorites" : "Save to favorites"}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/70 transition hover:border-wcGold/30 hover:bg-wcGold/10 hover:text-wcGold disabled:opacity-60"
                        title={savedIds.has(item.id || item.url || item.website || item.name || item.title) ? "Saved to favorites" : "Save to favorites"}
                      >
                        <Heart className={`h-3.5 w-3.5 ${savedIds.has(item.id || item.url || item.website || item.name || item.title) ? "fill-current text-wcGold" : ""}`} />
                      </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>}
              {requiresLocationProof && broaderLocationResults.length > 0 && (
                <details open={showBroaderWhenNoLocalMatch} className="mt-3 rounded-xl border border-white/10 bg-white/[0.025] px-4 py-3">
                  <summary className="cursor-pointer text-sm font-medium text-white/75">{activeTab === "circles" ? `Wider-area and online options (${broaderLocationResults.length})` : activeTab === "funding" ? `Benefits and referral options (${broaderLocationResults.length})` : activeTab === "emergency" ? `24/7 and wider-area support (${broaderLocationResults.length})` : `Other useful options (${broaderLocationResults.length})`}</summary>
                  <p className="mt-1 text-xs text-white/50">{activeTab === "circles" ? "These community services and meeting finders reach beyond your selected area. Call to confirm current local options and schedules." : activeTab === "funding" ? "These benefit finders and state programs can help you check options or apply. Each program decides eligibility." : activeTab === "emergency" ? "These support options serve a wider area than the location-specific listing. For immediate danger, call 911." : `These options are national or don’t include a confirmed location for ${region}.`}</p>
                  <div role="list" aria-label="Broader support options" className="mt-3 space-y-2.5">
                    {broaderLocationResults.map((item, index) => (
                      <article key={item.id || `broader-${index}`} role="listitem" className="rounded-xl border border-white/10 bg-white/[0.025] px-3.5 py-3 sm:px-4">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div className="min-w-0">
                            <h3 className="truncate text-[15px] font-semibold text-white sm:text-base">{item.name || item.title}</h3>
                            <p className="mt-1 text-sm text-white/55">{item.address || item.locationLine || item.region || "Location not listed"}</p>
                            {(item.description || item.summary) && <p className="mt-1 text-sm leading-relaxed text-white/65">{item.description || item.summary}</p>}
                          </div>
                          <div className="flex shrink-0 items-center gap-1.5">
                            {item.phone && <a href={`tel:${item.phone}`} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 text-xs font-medium text-white"><PhoneCall className="h-3.5 w-3.5" />Call</a>}
                            <button type="button" onClick={() => handleOpenDetail(item)} className="inline-flex min-h-9 items-center rounded-lg px-3 text-xs font-medium text-white/75 hover:bg-white/10">Details</button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </details>
              )}
              {localFoodResults.length > 6 && (
                <button
                  type="button"
                  onClick={() => setShowAllFoodResults((current) => !current)}
                  className="mt-4 min-h-11 rounded-xl border border-white/15 px-4 text-sm font-medium text-white/80 transition hover:border-wcGold/40 hover:bg-white/5"
                >
                  {showAllFoodResults ? "Show fewer results" : `See all ${orderedResults.length} results`}
                </button>
              )}
              {activeTab === "food" && searchResponse?.mode === "statewide" && searchResponse.hasMore && (
                <button
                  type="button"
                  onClick={loadMoreStatewideFood}
                  disabled={foodLocationBusy}
                  className="mt-3 min-h-11 rounded-xl border border-white/15 px-4 text-sm font-medium text-white/80 transition hover:border-wcGold/40 hover:bg-white/5 disabled:opacity-50"
                >
                  {foodLocationBusy ? "Loading more listings…" : "Load more food listings"}
                </button>
              )}
            </>
          )}

          {/* Minimal crisis footer — tap to act */}
          <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center justify-center gap-3 text-xs text-white/50">
            <a href="tel:988" className="text-red-300 hover:text-red-200 font-medium">988</a>
            <a href="tel:18006624357" className="hover:text-white">SAMHSA 1-800-662-4357</a>
            <span className="text-white/30">|</span>
            <a href="sms:741741" className="hover:text-white">Text HOME to 741741</a>
          </div>
        </div>
      </div>
      {webViewUrl && (
        <InAppWebView
          url={webViewUrl}
          title={webViewTitle}
          onClose={() => setWebViewUrl(null)}
          onOpenExternally
        />
      )}
      {selectedDetail && (
        <div className="fixed inset-0 z-[130] grid place-items-center bg-slate-950/85 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedDetail(null); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="resource-detail-title" className="max-h-[88vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-white/10 bg-slate-900 p-5 shadow-2xl sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-wcGold/80">{selectedDetail.curated ? "WellnessCafe resource guide" : "Resource details"}</p>
                <h2 id="resource-detail-title" className="mt-2 text-2xl font-semibold text-white">{selectedDetail.name || selectedDetail.title}</h2>
              </div>
              <button type="button" onClick={() => setSelectedDetail(null)} aria-label="Close resource details" className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-white/70 hover:bg-white/10"><X className="h-5 w-5" /></button>
            </div>
            {selectedDetail.isFoodDirectoryResult && <p className="mt-4 inline-flex rounded-full border border-emerald-200/20 bg-emerald-100/[0.06] px-3 py-1.5 text-sm font-medium text-emerald-50">Food support listing</p>}
            <p className="mt-4 text-sm leading-relaxed text-white/75">{selectedDetail.description || selectedDetail.summary || selectedDetail.snippet || "This listing has limited public details. Contact the organization to confirm services, eligibility, hours, and availability."}</p>
            <dl className="mt-5 grid gap-3 sm:grid-cols-2">
              {(selectedDetail.address || selectedDetail.locationLine || selectedDetail.region) && <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-3"><dt className="text-[11px] uppercase tracking-wide text-white/45">{selectedDetail.locationLabel || (selectedDetail.address ? "Address" : "Service area")}</dt><dd className="mt-1 break-words text-sm text-white/85">{selectedDetail.address || selectedDetail.locationLine || selectedDetail.region}</dd></div>}
              {selectedDetail.phone && <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-3"><dt className="text-[11px] uppercase tracking-wide text-white/45">Phone</dt><dd className="mt-1 text-sm text-white/85"><a className="underline decoration-white/30 underline-offset-2" href={`tel:${String(selectedDetail.phone).replace(/[^+\d]/g, "")}`}>{selectedDetail.phone}</a></dd></div>}
            </dl>
            <p className="mt-4 text-xs leading-relaxed text-white/50">{selectedDetail.isFoodDirectoryResult ? "Call ahead to confirm public access, today’s hours, and availability." : "Please contact the organization to confirm current services, eligibility, cost, and availability. If you need immediate emergency help in the U.S., call or text 988; call 911 for immediate danger."}</p>
            {(selectedDetail.website || selectedDetail.url) && (
              <button
                type="button"
                onClick={() => {
                  setWebViewUrl(selectedDetail.website || selectedDetail.url);
                  setSelectedDetail(null);
                }}
                className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-wcGold px-4 text-sm font-semibold text-slate-950 transition hover:bg-amber-200"
              >
                Open this resource here <ExternalLink className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
            {selectedDetail.sourceManaged && <HelpListingCorrectionForm listing={selectedDetail} />}
          </section>
        </div>
      )}
    </div>
  );
};

const ISSUE_OPTIONS = [
  ["wrong_address", "Address is wrong"],
  ["wrong_phone", "Phone number is wrong"],
  ["hours_or_availability", "Hours or availability changed"],
  ["services_changed", "Services or eligibility changed"],
  ["closed", "This service appears to be closed"],
  ["other", "Something else needs attention"],
];

function newReportSubmissionId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  const suffix = `${Date.now().toString(16)}${Math.floor(Math.random() * 0xfffff).toString(16)}`.padStart(12, "0").slice(-12);
  return `00000000-0000-4000-8000-${suffix}`;
}

function HelpListingCorrectionForm({ listing }) {
  const [issue, setIssue] = useState(ISSUE_OPTIONS[0][0]);
  const [details, setDetails] = useState("");
  const [submissionId] = useState(newReportSubmissionId);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setSending(true);
    setError("");
    try {
      await reportHelpListingIssue(listing.id, issue, details, submissionId);
      setSent(true);
    } catch (reason) {
      setError(reason?.message || "We couldn’t send that report. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return <details className="mt-5 rounded-2xl border border-white/10 bg-white/[0.025]">
    <summary className="flex min-h-12 cursor-pointer list-none items-center gap-2 px-4 text-sm font-medium text-white/75"><Flag className="h-4 w-4 text-amber-200" />Report a listing issue</summary>
    <div className="border-t border-white/[0.08] p-4">
      {sent ? <p role="status" className="text-sm text-emerald-100">Thanks. Your report is with our review team.</p> : <form onSubmit={submit} className="space-y-3">
        <label className="block text-sm text-white/75">What needs attention?<select value={issue} onChange={(event) => setIssue(event.target.value)} className="mt-1.5 min-h-11 w-full rounded-xl border border-white/10 bg-slate-950 px-3 text-sm text-white">{ISSUE_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label className="block text-sm text-white/75">A short note <span className="text-white/45">(optional)</span><textarea value={details} onChange={(event) => setDetails(event.target.value)} maxLength={400} rows={2} placeholder="What should we check? Please leave out personal or health details." className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-amber-100/40" /></label>
        <div className="flex flex-wrap items-center justify-between gap-2"><p className="text-xs text-white/45">This report helps us recheck the public listing.</p><button type="submit" disabled={sending} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-amber-200 px-4 text-sm font-semibold text-slate-950 disabled:opacity-50"><Send className="h-4 w-4" />{sending ? "Sending…" : "Send report"}</button></div>
        {error && <p role="alert" className="text-sm text-rose-200">{error}</p>}
      </form>}
    </div>
  </details>;
}

export default RealHelpWorkspace;
