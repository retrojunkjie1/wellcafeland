// src/apps/workspace/RealHelpWorkspace.jsx
// Unified Assistance — one page, action-first. Housing, Food, Funding, Programs, Emergency, Circles.

import React, { useState, useEffect, useRef, useCallback } from "react"
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { ExternalLink, Heart, MapPin, PhoneCall, X, UsersRound, Flag, Send, ArrowLeft } from "lucide-react";
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
import { getCuratedFallback, isNigeriaLocation, isUSLocation } from "@/lib/directoryCuratedFallback";
import InAppWebView from "@/components/InAppWebView";
import { reportHelpListingIssue, searchPublicHelpListings } from "@/services/helpDirectory";
import { dedupeResourceListings, isHelpCategoryRelevant } from "./assistanceListingUtils";
import { getAssistanceSearchStatus, getCuratedSearchStatus, getFriendlySearchFailure } from "./assistanceSearchStatus";
import { getPracticeReturnTarget } from "../assistance/assistanceReturnPath";
import { returnFromTool } from "@/navigation/toolReturn";

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
    website: resource.link || resource.sourceUrl,
    url: resource.link || resource.sourceUrl,
    phone: resource.phone || null,
    alternatePhone: resource.alternatePhone || null,
    email: resource.email || null,
    resourceType: resource.resourceType || "",
    source: resource.sourceManaged ? (resource.sourceName || "WellnessCafe reviewed listing") : resource.source,
    address: resource.address || resource.locationLine || "",
    locationLabel: resource.locationLabel || (resource.address ? "Address" : "Service area"),
    city: resource.city || "",
    state: resource.state || "",
    country: resource.country || "",
    region: resource.region || resource.country || "",
    locationLine: resource.locationLine || "",
    postalCode: resource.postalCode || "",
    checkedAt: resource.checkedAt || null,
    sourceManaged: resource.sourceManaged === true,
    curated: true,
    verification: { status: "curated" },
  };
}

function getPublicSourceLabel(source) {
  const label = String(source || "").trim();
  if (!label || /\b(internal|directory api|firestore|curated fallback)\b/i.test(label)) return "";
  return label;
}

function toDirectoryWorkspaceResource(item, domain) {
  return {
    id: item.id,
    name: item.title,
    title: item.title,
    description: item.description || item.summary,
    website: item.url,
    url: item.url,
    city: item.city,
    state: item.state,
    country: item.country,
    postalCode: item.postalCode,
    phone: item.phone,
    address: item.address,
    locationLine: item.locationLine,
    region: item.state || item.country || item.address || item.locationLine,
    locationLabel: item.locationLabel,
    checkedAt: item.checkedAt || null,
    updatedAt: item.updatedAt,
    source: item.source,
    resourceType: item.type,
    category: item.category,
    verification: { status: "external" },
    domain,
  };
}

const RealHelpWorkspace = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isAssistanceRoute = location.pathname === "/assistance";
  const returnToPractice = getPracticeReturnTarget(location.state);
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
    if (debounceRef.current) clearTimeout(debounceRef.current);
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    requestIdRef.current += 1;
    setLoading(false);
    setLoadingMoreResults(false);
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
  const hasUSSupportNumbers = isUSLocation(region);
  const [loading, setLoading] = useState(false);
  const [loadingMoreResults, setLoadingMoreResults] = useState(false);
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

  const invalidateResultsForSearchEdit = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = null;
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    requestIdRef.current += 1;
    setLoading(activeTab !== "food");
    setLoadingMoreResults(false);
    setResults([]);
    setCuratedResults([]);
    setSearchResponse(null);
    setSelectedDetail(null);
  };

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

  const loadData = useCallback(async ({ searchFood = false } = {}) => {
    if (abortControllerRef.current) abortControllerRef.current.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;
    const signal = controller.signal;
    const reqId = ++requestIdRef.current;
    let reviewedDirectoryError = "";

    setLoading(true);
    setLoadingMoreResults(false);
    try {
      // Load curated Firestore data first
      let curated = [];
      
      const internationalSearch = Boolean(region.trim() && !isUSLocation(region));
      if (activeTab === "housing") {
        curated = internationalSearch ? [] : await listHousingProviders({ region: region || undefined });
        curated = [...curated, ...getCuratedFallback("housing", query, region).map((item) => toCuratedWorkspaceResource(item, "housing"))];
      } else if (activeTab === "funding") {
        const savedGrants = internationalSearch ? [] : await listGrants({ region: region || undefined });
        const benefitPathways = getCuratedFallback("grants", query, region).map((item) => toCuratedWorkspaceResource(item, "grants"));
        curated = [...savedGrants, ...benefitPathways];
      } else if (activeTab === "programs") {
        curated = internationalSearch ? [] : await listSupportPrograms({ region: region || undefined });
        curated = [...curated, ...getCuratedFallback("programs", query, region).map((item) => toCuratedWorkspaceResource(item, "programs"))];
      } else if (activeTab === "circles") {
        const localCircles = internationalSearch ? [] : await listCircles({ region: region || undefined });
        const peerPathways = getCuratedFallback("peer", query, region).map((item) => toCuratedWorkspaceResource(item, "peer"));
        curated = [...localCircles, ...peerPathways];
      } else if (activeTab === "food") {
        curated = internationalSearch
          ? getCuratedFallback("food.essentials", query, region).map((item) => toCuratedWorkspaceResource(item, "food"))
          : [];
      } else if (activeTab === "emergency") {
        curated = getCuratedFallback("hotlines", query, region).map((item) => toCuratedWorkspaceResource(item, "hotlines"));
      }

      // Route the admin-reviewed, permission-backed directory into each
      // matching client category, in every country and across all help types.
      // A successful live provider search cannot gate this reviewed local
      // directory, so known local records remain available through outages.
      if (region.trim() && ["housing", "food", "funding", "programs", "circles", "emergency"].includes(activeTab)) {
        try {
          const reviewed = await searchPublicHelpListings(activeTab, region.trim());
          curated = [
            ...curated,
            ...(reviewed.listings || []).map((item) => toCuratedWorkspaceResource(item, activeTab)),
          ];
        } catch (error) {
          if (signal.aborted || reqId !== requestIdRef.current) return;
          // Firebase callable errors can contain provider, index, or internal
          // implementation details. Keep those out of the client interface.
          reviewedDirectoryError = "The reviewed local directory is temporarily unavailable. Saved and wider-area support options remain below.";
        }
      }

      if (signal.aborted || reqId !== requestIdRef.current) return;
      setCuratedResults(curated);

      // A location by itself is a valid search: supply a useful category query
      // so people do not need to know the right search words before finding help.
      const typedQuery = (query || "").trim()
      const q = typedQuery.length >= MIN_QUERY_LEN ? typedQuery : (region.trim() ? CATEGORY_SEARCH_TERMS[activeTab] : "")
      if (q) {
        const locationAwareQuery = internationalSearch ? `${q} official contact phone address` : q;
        const domain = resolvedDomain || (activeTab === "housing" ? "housing" : activeTab === "food" ? "food.essentials" : activeTab === "funding" ? "grants" : activeTab === "programs" ? "assistance" : activeTab === "emergency" ? "hotlines" : activeTab === "circles" ? "peer" : "programs");

        // International categories all use the same live discovery service.
        // Category filtering is applied before cards are rendered, and the
        // location matcher still decides whether an item counts as local.
        if (internationalSearch || activeTab !== "food") {
          const dirResult = await searchDirectory({
            query: locationAwareQuery,
            domain,
            location: region || undefined,
            category: activeTab,
            limit: 20,
            signal,
          });
          if (signal.aborted || reqId !== requestIdRef.current) return;
          if (import.meta.env.DEV) {
            console.debug("[RealHelp] directory search", { category: activeTab, query: q, region: region || null, domain, resultCount: dirResult.items?.length ?? 0 });
          }
          setSearchResponse({ ok: dirResult.ok, results: dirResult.items, nextPageToken: dirResult.nextPageToken || null, error: dirResult.error || null, directoryError: reviewedDirectoryError || null, meta: dirResult.meta });
          if (dirResult.ok && dirResult.items?.length) {
            setResults(dirResult.items
              .filter((item) => isHelpCategoryRelevant(item, activeTab))
              .map((item) => toDirectoryWorkspaceResource(item, domain)));
          } else {
            setResults([]);
          }
        } else if (activeTab === "food") {
          if (internationalSearch) {
            // Nigeria food options are curated contact paths. The U.S.-only
            // food-place resolver must not run for another country.
            setSearchResponse(null);
            setResults([]);
          } else if (!region.trim() || !searchFood) {
            setSearchResponse(null);
            setResults([]);
            return;
          } else {
            const foodResult = await searchFoodDirectory({ area: region, limit: 20, signal });
            if (signal.aborted || reqId !== requestIdRef.current) return;
            setSearchResponse({
              ok: foodResult.ok,
              results: foodResult.items,
              error: foodResult.error,
              meta: { source: "feedam", totalAvailable: foodResult.totalAvailable, attribution: foodResult.attribution },
            });
            setResults(foodResult.items.map((item) => ({ ...item, domain })));
          }
        } else {
          const searchResult = await searchResources({
            query: locationAwareQuery,
            domain: domain,
            region: region || undefined,
            category: activeTab,
            signal,
          });
          if (signal.aborted || reqId !== requestIdRef.current) return;
          setSearchResponse({ ...searchResult, error: searchResult.error || null, directoryError: reviewedDirectoryError || null });
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
      setSearchResponse({
        ok: false,
        error: "Live search is temporarily unavailable. Please try again in a moment.",
        directoryError: reviewedDirectoryError || null,
      });
    } finally {
      if (abortControllerRef.current === controller) setLoading(false);
    }
  }, [activeTab, query, region, resolvedDomain]);

  const loadMoreDirectoryResults = async () => {
    const pageToken = searchResponse?.nextPageToken;
    if (!pageToken || loadingMoreResults) return;
    const controller = new AbortController();
    abortControllerRef.current?.abort();
    abortControllerRef.current = controller;
    const requestId = ++requestIdRef.current;
    const typedQuery = String(query || "").trim();
    const nextQuery = typedQuery.length >= MIN_QUERY_LEN ? typedQuery : (region.trim() ? CATEGORY_SEARCH_TERMS[activeTab] : "");
    if (!nextQuery) return;
    const domain = resolvedDomain || (activeTab === "housing" ? "housing" : activeTab === "food" ? "food.essentials" : activeTab === "funding" ? "grants" : activeTab === "programs" ? "assistance" : activeTab === "emergency" ? "hotlines" : activeTab === "circles" ? "peer" : "programs");
    setLoadingMoreResults(true);
    try {
      const page = internationalSearch || activeTab !== "food"
        ? await searchDirectory({ query: internationalSearch ? `${nextQuery} official contact phone address` : nextQuery, domain, location: region || undefined, category: activeTab, limit: 20, pageToken, signal: controller.signal })
        : await searchResources({ query: internationalSearch ? `${nextQuery} official contact phone address` : nextQuery, domain, region: region || undefined, category: activeTab, limit: 20, pageToken, signal: controller.signal });
      if (controller.signal.aborted || requestId !== requestIdRef.current) return;
      const pageItems = internationalSearch || activeTab !== "food"
        ? (page.items || []).filter((item) => isHelpCategoryRelevant(item, activeTab)).map((item) => toDirectoryWorkspaceResource(item, domain))
        : (page.results || []).map((item) => ({ ...item, domain }));
      if (!page.ok || page.meta?.fallback) {
        setSearchResponse((current) => ({ ...current, nextPageToken: null, error: page.error || "More live results could not be loaded. Saved pathways remain available above." }));
        return;
      }
      setResults((current) => {
        const existing = new Set(current.map((item) => item.id || item.url || item.website || item.name || item.title));
        return [...current, ...pageItems.filter((item) => !existing.has(item.id || item.url || item.website || item.name || item.title))];
      });
      setSearchResponse((current) => ({
        ...current,
        error: page.error || null,
        nextPageToken: page.nextPageToken || null,
        meta: { ...(current?.meta || {}), ...(page.meta || {}) },
      }));
    } catch (error) {
      if (error?.name !== "AbortError") {
        setSearchResponse((current) => ({ ...current, error: "More live results are temporarily unavailable. Try again in a moment." }));
      }
    } finally {
      if (abortControllerRef.current === controller) setLoadingMoreResults(false);
    }
  };

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (activeTab === "food") {
      if (isNigeriaLocation(region) || (region.trim() && !isUSLocation(region))) {
        // International food searches use the saved city and country contacts
        // directly; the explicit place picker is reserved for the U.S. feed.
        abortControllerRef.current?.abort();
        setSelectedFoodLocation(null);
        setFoodLocationOptions([]);
        setFoodLocationMessage("");
        debounceRef.current = setTimeout(() => loadData(), DEBOUNCE_MS);
        return () => {
          if (debounceRef.current) clearTimeout(debounceRef.current);
          debounceRef.current = null;
        };
      }
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
  }, [activeTab, loadData, query, region, resolvedDomain, selectedFoodLocation]);

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
    // Never expose backend or storage implementation names in the public UI.
    setSelectedDetail({ ...item, source: getPublicSourceLabel(item.source) });
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
    // A category change starts a new search intent. Carrying a category-bound
    // term such as "shelter" into peer-support results makes the page appear
    // to return mismatched contacts, so let the new category use its own
    // default search phrase.
    params.delete("query");
    if (region.trim()) params.set("region", region.trim());
    else params.delete("region");
    navigate(`${location.pathname}?${params.toString()}`, { state: location.state });
  };

  const dedupedResults = dedupeResourceListings([...curatedResults, ...results]);
  // Nigeria's live and saved resource feeds have historically contained
  // records from neighboring categories. Keep that data from being presented
  // as a local answer unless the listing itself identifies the service type.
  const allResults = isNigeriaLocation(region)
      ? dedupedResults.filter((item) => isHelpCategoryRelevant(item, activeTab))
    : dedupedResults;
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
  const requiresLocationProof = Boolean(region.trim()) && (activeTab !== "food" || !isUSLocation(region));
  const locatedResults = requiresLocationProof
    ? allResults.filter((item) => matchesHelpLocation(item, region))
    : visibleResults;
  const broaderLocationResults = requiresLocationProof
    ? allResults.filter((item) => !matchesHelpLocation(item, region))
    : [];
  const showBroaderWhenNoLocalMatch = requiresLocationProof && locatedResults.length === 0 && (["funding", "emergency", "circles", "programs", "housing"].includes(activeTab) || activeTab === "food");
  const hasSearchIntent = Boolean(query.trim() || region.trim());
  const showingFallback = Boolean(searchResponse?.fallback || searchResponse?.meta?.fallback);
  const liveSearchUnavailable = Boolean(
    searchResponse?.meta?.subscriptionBlocked ||
    searchResponse?.meta?.unavailable ||
    (searchResponse?.error && searchResponse?.meta?.liveAvailable === false)
  );
  const webViewTitle = "Resource";
  const unavailableNextStep = activeTab === "programs"
    ? { label: "Open treatment directory", action: () => setWebViewUrl("https://findtreatment.gov") }
    : activeTab === "circles"
      ? { label: "Explore community support", action: () => navigate("/assistance/community") }
      : { label: "Choose another support option", action: () => navigate("/assistance") };
  const internationalSearch = Boolean(region.trim() && !hasUSSupportNumbers);

  return (
    <div className="flex h-screen flex-col bg-slate-950 text-white">
      {/* Minimal header — one line, action-first */}
      <div className="flex-shrink-0 border-b border-white/10 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-medium text-white">Find Help</h1>
          </div>
          {isAssistanceRoute ? (
            hasUSSupportNumbers && <a href="tel:988" className="inline-flex min-h-11 items-center gap-2 whitespace-nowrap rounded-xl border border-rose-200/25 bg-rose-100/[0.06] px-2.5 text-[13px] font-semibold text-rose-100 hover:bg-rose-100/10 sm:px-4 sm:text-sm">Call or text 988</a>
          ) : (
            <button type="button" onClick={() => returnToPractice ? returnFromTool(navigate, returnToPractice) : navigate("/assistance")} className="min-h-11 rounded-lg px-2 text-sm text-white/60 hover:bg-white/5 hover:text-white">← {returnToPractice ? "Back to your practice" : "Back to support choices"}</button>
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
          <div className={`grid grid-cols-1 gap-3 ${activeTab === "food" ? "sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end" : "sm:grid-cols-[minmax(0,1fr)_16rem]"}`}>
            {(activeTab !== "food" || internationalSearch) && (
              <label className="block min-w-0 text-sm font-medium text-white/70">
                Search support
                <input
                  ref={searchInputRef}
                  type="text"
                  value={query}
                  onChange={(e) => {
                    invalidateResultsForSearchEdit();
                    setQuery(e.target.value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      if (debounceRef.current) clearTimeout(debounceRef.current)
                      debounceRef.current = null
                      loadData()
                    }
                  }}
                  placeholder={`Search ${supportTypes.find((type) => type.id === activeTab)?.label.toLowerCase() || "support"}...`}
                  className="mt-1.5 min-h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-base text-white placeholder-white/40 transition focus:outline-none focus:ring-2 focus:ring-wcGold/50"
                />
              </label>
            )}
            <label className="block min-w-0 text-sm font-medium text-white/70">
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
                  invalidateResultsForSearchEdit();
                  setRegion(e.target.value);
                  setSelectedFoodLocation(null);
                  setFoodLocationOptions([]);
                  setFoodLocationMessage("");
                }}
                placeholder={activeTab === "food" && !internationalSearch ? "City, state, ZIP or place" : "City, region, or country (e.g. Toronto, Canada)"}
                className="mt-1.5 min-h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white placeholder-white/40 transition focus:outline-none focus:ring-2 focus:ring-wcGold/50"
              />
            </label>
            {activeTab === "food" && !internationalSearch && (
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
          {liveSearchUnavailable && !loading && (
            <section role="status" className="rounded-xl border border-amber-200/25 bg-amber-100/[0.06] px-4 py-4">
              <h2 className="text-sm font-semibold text-amber-50">{activeTab === "circles" && locatedResults.length ? `Recovery support options in ${region}` : activeTab === "circles" ? `Recovery support to explore${region.trim() ? ` in ${region}` : ""}` : `Support options${region.trim() ? ` for ${region}` : ""}`}</h2>
              <p className="mt-1 max-w-4xl text-sm leading-relaxed text-white/75">
                {activeTab === "circles" && locatedResults.length
                  ? "These organizations publish recovery meetings, groups, counseling, or treatment in this area. Times, eligibility, and openings can change; call first. This is not a complete count of every service."
                  : activeTab === "circles"
                  ? "Explore the meeting times and ways to join below. These are useful starting points; more groups may be available through local health services and community organizations."
                  : "Explore the organizations and contact details below. Call or visit their official websites to confirm current services, costs, and availability."}
              </p>
            </section>
          )}
          {activeTab === "food" && region.trim() && isNigeriaLocation(region) && (
            <p className="text-xs leading-relaxed text-white/50">Nigeria food support · contact each organization to confirm its current service area, eligibility, and distribution before travelling. Nationwide referrals are separate from local food-relief contacts.</p>
          )}
          {activeTab === "food" && region.trim() && !internationalSearch && (
            <p className="text-xs leading-relaxed text-white/50">Your place is sent to Feed America only when you choose Find a place. Nearby results use the place you select.</p>
          )}
          {activeTab === "food" && internationalSearch && (
            <p className="text-xs leading-relaxed text-white/50">Food and essential support for {region}. Local contacts are shown first when their service area is confirmed; wider-area organizations appear below.</p>
          )}
          {activeTab === "food" && !internationalSearch && foodLocationOptions.length > 0 && (
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
          {activeTab === "food" && !internationalSearch && foodLocationMessage && foodLocationOptions.length === 0 && !loading && (
            <p role="status" className="rounded-xl border border-amber-200/15 bg-amber-100/[0.04] px-4 py-3 text-sm text-amber-50/80">{foodLocationMessage}</p>
          )}
          {(searchResponse?.error || searchResponse?.directoryError) && !loading && !liveSearchUnavailable && (
            <div role="status" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.025] px-4 py-3">
              <div className="space-y-1.5 text-sm text-white/65">
                {searchResponse.error && <p>{internationalSearch ? "Some additional live listings could not be reached right now. The sourced contacts below remain available; call to ask about other local options." : activeTab === "food" ? `${getFriendlySearchFailure(searchResponse.error)}${curatedResults.length ? " National food-support options remain below." : ""}` : <>{getAssistanceSearchStatus({ category: activeTab, region, localCount: locatedResults.length, international: internationalSearch })} {getFriendlySearchFailure(searchResponse.error)}</>}</p>}
                {searchResponse.directoryError && <p className="text-white/50">{getFriendlySearchFailure(searchResponse.directoryError)}</p>}
              </div>
            </div>
          )}
          {showingFallback && !searchResponse?.meta?.subscriptionBlocked && !searchResponse?.error && !searchResponse?.directoryError && !loading && allResults.length > 0 && (
            <div role="status" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-100/15 bg-amber-100/[0.035] px-4 py-3">
              <p className="max-w-3xl text-sm text-white/70">{searchResponse?.meta?.subscriptionBlocked ? "Explore the organizations and contact details below. Call or visit their official websites to confirm current services and availability." : getCuratedSearchStatus({ category: activeTab, region, localCount: locatedResults.length, international: internationalSearch })}</p>
            </div>
          )}

          {/* Results */}
          {activeTab === "food" && !internationalSearch && foodLocationOptions.length > 0 ? null : loading && allResults.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 gap-3">
              <div className="w-8 h-8 border-2 border-wcGold/30 border-t-wcGold rounded-full animate-spin"></div>
              <div className="text-sm text-white/50">Finding resources...</div>
            </div>
          ) : allResults.length === 0 ? (
            searchResponse?.error && hasSearchIntent ? (
              <section role="alert" className="mx-auto flex max-w-xl flex-col items-center gap-3 rounded-2xl border border-rose-200/20 bg-rose-100/[0.045] p-6 text-center">
                <Heart className="h-10 w-10 text-rose-200/70" />
                <h2 className="text-base font-semibold text-white">{liveSearchUnavailable ? `Let’s find a place to start${region.trim() ? ` in ${region}` : ""}` : "We couldn’t complete this search"}</h2>
                <p className="text-sm leading-relaxed text-white/70">{liveSearchUnavailable ? "We don’t have a nearby listing to show right now. You can still explore the support organizations and meeting options below." : getFriendlySearchFailure(searchResponse.error)}</p>
                <p className="text-xs leading-relaxed text-white/50">{liveSearchUnavailable ? "The options shown are starting points. Contact a local health service or community group to ask about additional support." : "Your search area is still here. You can try again or adjust your words."}</p>
                <div className="mt-1 flex flex-wrap justify-center gap-2">
                  {!liveSearchUnavailable && <button type="button" onClick={() => loadData()} className="min-h-11 rounded-xl bg-amber-200 px-4 text-sm font-semibold text-slate-950 hover:bg-amber-100">Try again</button>}
                  <button type="button" onClick={unavailableNextStep.action} className="min-h-11 rounded-xl border border-white/20 px-4 text-sm font-medium text-white/80 hover:bg-white/10">{unavailableNextStep.label}</button>
                  {requiresLocationProof && hasUSSupportNumbers && <a href="tel:211" className="inline-flex min-h-11 items-center rounded-xl border border-wcGold/35 px-4 text-sm font-semibold text-wcGold">Call 211 for local help</a>}
                </div>
              </section>
            ) : (
            activeTab === "food" && !internationalSearch && foodLocationOptions.length === 0 ? (
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
                {hasUSSupportNumbers && <a href="tel:211" className="inline-flex min-h-11 items-center rounded-xl border border-wcGold/35 px-4 text-sm font-semibold text-wcGold transition hover:bg-wcGold/10">Call 211</a>}
              </section>
            ) : (
            requiresLocationProof ? (
              <section role="status" className="mx-auto flex max-w-xl flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-6 text-center">
                <MapPin className="h-8 w-8 text-wcGold/80" aria-hidden="true" />
                <h2 className="text-base font-semibold text-white">We don’t have a confirmed nearby listing yet</h2>
                <p className="text-sm leading-relaxed text-white/65">Try a nearby city or ZIP, or use the support options below to ask for help in {region}.</p>
                {hasUSSupportNumbers && <a href="tel:211" className="inline-flex min-h-11 items-center rounded-xl border border-wcGold/35 px-4 text-sm font-semibold text-wcGold transition hover:bg-wcGold/10">Call 211</a>}
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
                      {isNigeriaLocation(region) ? <>Showing <span className="font-medium text-white">{localFoodResults.length}</span> location-matched food contacts and referrals</> : <>Found <span className="font-medium text-white">{localFoodResults.length}</span> nearby food option{localFoodResults.length !== 1 ? "s" : ""}</>}
                      {broaderFoodResults.length > 0 ? <span className="ml-2 text-xs text-white/45">+ {broaderFoodResults.length} broader food resources</span> : null}
                    </>
                  ) : requiresLocationProof && locatedResults.length ? (
                    <>{isNigeriaLocation(region) ? <>Showing <span className="font-medium text-white">{locatedResults.length}</span> location-matched contacts and referrals for <span className="font-medium text-white">{region}</span></> : activeTab === "circles" ? <><span className="font-medium text-white">{locatedResults.length}</span> recovery support options in <span className="font-medium text-white">{region}</span></> : <>Found <span className="font-medium text-white">{locatedResults.length}</span> listing{locatedResults.length !== 1 ? "s" : ""} for <span className="font-medium text-white">{region}</span></>}</>
                  ) : requiresLocationProof ? (
                    !hasUSSupportNumbers ? (
                      liveSearchUnavailable
                        ? <>Explore the support organizations and online options below for <span className="font-medium text-white">{region}</span></>
                        : <>Explore support options for <span className="font-medium text-white">{region}</span></>
                    ) : (
                      liveSearchUnavailable
                        ? <>More ways to connect with support in <span className="font-medium text-white">{region}</span></>
                        : <>More ways to connect with support in <span className="font-medium text-white">{region}</span></>
                    )
                  ) : (
                    showingFallback && region.trim() ? (
                      <>{allResults.length} broader support pathway{allResults.length !== 1 ? "s" : ""} — not confirmed local listings</>
                    ) : (
                      <>Found <span className="font-medium text-white">{allResults.length}</span> resource{allResults.length !== 1 ? 's' : ''}</>
                    )
                  )}
                </p>
              </div>}

              {requiresLocationProof && locatedResults.length === 0 && !liveSearchUnavailable && (
                <section role="status" className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3">
                  <p className="text-sm text-white/70">This directory has no confirmed nearby listing for {region}. These options can help you reach support in or near your area.</p>
                  {hasUSSupportNumbers && <a href="tel:211" className="inline-flex min-h-10 shrink-0 items-center rounded-lg bg-wcGold px-3 text-sm font-semibold text-slate-950">Call 211</a>}
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
                        {item.resourceType && <p className="mt-1 text-xs font-medium uppercase tracking-wide text-wcGold/80">{item.resourceType}</p>}

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
                        {internationalSearch && item.phone && (
                          <p className="mt-1 text-sm text-white/70">
                            Phone: <a className="font-medium text-white underline decoration-white/30 underline-offset-2" href={`tel:${String(item.phone).replace(/[^+\d]/g, "")}`}>{item.phone}</a>
                          </p>
                        )}
                        {(item.description || item.summary) && <p className="mt-2 max-w-3xl text-sm leading-relaxed text-white/70">{item.description || item.summary}</p>}
                        {((activeTab !== "food" || internationalSearch) && getPublicSourceLabel(item.source)) && (
                          <p className="mt-1 text-xs text-white/40">
                            Source: {getPublicSourceLabel(item.source)}{internationalSearch && item.checkedAt ? ` · source reviewed ${new Date(`${item.checkedAt}T12:00:00`).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}` : ""}
                          </p>
                        )}
                      </div>

                      <div className="flex shrink-0 flex-wrap items-center gap-1.5 sm:justify-end">
                          {item.email && (
                            <a href={`mailto:${item.email}`} className="inline-flex min-h-9 items-center rounded-lg border border-white/10 bg-white/5 px-3 text-xs font-medium text-white transition hover:border-wcGold/30 hover:bg-wcGold/10">Email</a>
                          )}
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
                <details open={showBroaderWhenNoLocalMatch || (isNigeriaLocation(region) && broaderLocationResults.length > 0) || (activeTab === "circles" && locatedResults.length === 0)} className="mt-3 rounded-xl border border-white/10 bg-white/[0.025] px-4 py-3">
                  <summary className="cursor-pointer text-sm font-medium text-white/75">{activeTab === "circles" ? `Online and wider-area recovery options (${broaderLocationResults.length})` : isNigeriaLocation(region) ? `Statewide, Nigeria-wide and other-city options (${broaderLocationResults.length})` : !hasUSSupportNumbers ? `More support organizations (${broaderLocationResults.length})` : activeTab === "funding" ? `Benefits and referral options (${broaderLocationResults.length})` : activeTab === "emergency" ? `24/7 and wider-area support (${broaderLocationResults.length})` : `Other useful options (${broaderLocationResults.length})`}</summary>
                  <p className="mt-1 text-xs text-white/50">{activeTab === "circles" ? "Explore other peer-support groups and online meetings. Open an option to see its current schedule, format, and how to join." : isNigeriaLocation(region) ? "Statewide and Nigeria-wide services, plus contacts based in another city, appear here. Counts show the contacts in this directory, not every service in Nigeria. Confirm the service area, eligibility, and current availability before travelling." : !hasUSSupportNumbers ? "Explore organizations that offer support in this country or online. Contact each organization to confirm services and availability." : activeTab === "funding" ? "These benefit finders and state programs can help you check options or apply. Each program decides eligibility." : activeTab === "emergency" ? "These support options serve a wider area than the location-specific listing. For immediate danger, contact local emergency services." : `These options may help you connect with support beyond ${region}.`}</p>
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
              {activeTab !== "food" && searchResponse?.nextPageToken && (
                <button
                  type="button"
                  onClick={loadMoreDirectoryResults}
                  disabled={loadingMoreResults || loading}
                  className="mt-3 min-h-11 self-start rounded-xl border border-white/15 px-4 text-sm font-medium text-white/80 transition hover:border-wcGold/40 hover:bg-white/5 disabled:cursor-wait disabled:opacity-55"
                >
                  {loadingMoreResults ? "Loading more live results…" : "Load more live results"}
                </button>
              )}
            </>
          )}

          {/* Minimal crisis footer — tap to act */}
          {hasUSSupportNumbers ? <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center justify-center gap-3 text-xs text-white/50">
            <a href="tel:988" className="text-red-300 hover:text-red-200 font-medium">988</a>
            <a href="tel:18006624357" className="hover:text-white">SAMHSA 1-800-662-4357</a>
            <span className="text-white/30">|</span>
            <a href="sms:741741" className="hover:text-white">Text HOME to 741741</a>
          </div> : region.trim() ? <p className="mt-8 border-t border-white/10 pt-6 text-center text-xs text-white/50">{isNigeriaLocation(region) ? "In Nigeria, call 112 for immediate danger. If the call does not connect, seek the nearest hospital or police station if safe." : "Emergency numbers vary by location. If someone is in immediate danger, contact local emergency services."}</p> : null}
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
            <div className="sticky top-0 z-10 -mx-5 -mt-5 mb-5 flex items-center justify-between border-b border-white/10 bg-slate-900 px-5 py-3 shadow-lg sm:-mx-7 sm:-mt-7 sm:px-7">
              <button type="button" onClick={() => setSelectedDetail(null)} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/15 px-3 text-sm font-medium text-white/85 hover:bg-white/10"><ArrowLeft className="h-4 w-4" aria-hidden="true" />Back to results</button>
              <button type="button" onClick={() => setSelectedDetail(null)} aria-label="Close resource details" className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-white/70 hover:bg-white/10"><X className="h-5 w-5" /></button>
            </div>
            <div className="relative z-0 flex items-start justify-between gap-4 pt-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-wcGold/80">{selectedDetail.curated ? "WellnessCafe resource guide" : "Resource details"}</p>
                <h2 id="resource-detail-title" className="mt-2 text-2xl font-semibold text-white">{selectedDetail.name || selectedDetail.title}</h2>
              </div>
            </div>
            {selectedDetail.isFoodDirectoryResult && <p className="mt-4 inline-flex rounded-full border border-emerald-200/20 bg-emerald-100/[0.06] px-3 py-1.5 text-sm font-medium text-emerald-50">Food support listing</p>}
            <p className="mt-4 text-sm leading-relaxed text-white/75">{selectedDetail.description || selectedDetail.summary || selectedDetail.snippet || "This listing has limited public details. Contact the organization to confirm services, eligibility, hours, and availability."}</p>
            <dl className="mt-5 grid gap-3 sm:grid-cols-2">
              {(selectedDetail.address || selectedDetail.locationLine || selectedDetail.region) && <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-3"><dt className="text-[11px] uppercase tracking-wide text-white/45">{selectedDetail.locationLabel || (selectedDetail.address ? "Address" : "Service area")}</dt><dd className="mt-1 break-words text-sm text-white/85">{selectedDetail.address || selectedDetail.locationLine || selectedDetail.region}</dd></div>}
              {selectedDetail.phone && <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-3"><dt className="text-[11px] uppercase tracking-wide text-white/45">Phone</dt><dd className="mt-1 text-sm text-white/85"><a className="underline decoration-white/30 underline-offset-2" href={`tel:${String(selectedDetail.phone).replace(/[^+\d]/g, "")}`}>{selectedDetail.phone}</a></dd></div>}
              {selectedDetail.alternatePhone && <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-3"><dt className="text-[11px] uppercase tracking-wide text-white/45">Additional phone</dt><dd className="mt-1 text-sm text-white/85"><a className="underline decoration-white/30 underline-offset-2" href={`tel:${String(selectedDetail.alternatePhone).replace(/[^+\d]/g, "")}`}>{selectedDetail.alternatePhone}</a></dd></div>}
              {selectedDetail.email && <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-3"><dt className="text-[11px] uppercase tracking-wide text-white/45">Email</dt><dd className="mt-1 break-words text-sm text-white/85"><a className="underline decoration-white/30 underline-offset-2" href={`mailto:${selectedDetail.email}`}>{selectedDetail.email}</a></dd></div>}
              {selectedDetail.source && <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-3"><dt className="text-[11px] uppercase tracking-wide text-white/45">Organization or directory</dt><dd className="mt-1 text-sm text-white/85">{selectedDetail.source}</dd></div>}
            </dl>
            {selectedDetail.id?.endsWith("who-treatment-systems") && (
              <section className="mt-5 space-y-3" aria-labelledby="who-contact-heading">
                <div>
                  <h3 id="who-contact-heading" className="text-base font-semibold text-white">WHO contact details</h3>
                  <p className="mt-1 text-xs leading-relaxed text-white/55">These are WHO organizational offices, not local treatment clinics. The Eastern Mediterranean Regional Office is the relevant WHO regional office for the UAE.</p>
                </div>
                <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <h4 className="text-sm font-semibold text-white">WHO Regional Office for the Eastern Mediterranean</h4>
                  <p className="mt-2 text-sm leading-relaxed text-white/75">Monazamet El Seha El Alamia Street, Extension of Abdel Razak El Sanhouri Street, P.O. Box 7608, Nasr City, Cairo 11371, Egypt</p>
                  <p className="mt-2 text-sm text-white/80">Telephone: <a className="underline decoration-white/30 underline-offset-2" href="tel:+20222765000">+20 2 2276 5000</a></p>
                  <p className="mt-2 text-sm text-white/80">WHO UAE desk officer: <a className="underline decoration-white/30 underline-offset-2" href="tel:+20222765091">+20 2 2276 5091</a></p>
                </article>
                <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <h4 className="text-sm font-semibold text-white">WHO Headquarters</h4>
                  <p className="mt-2 text-sm leading-relaxed text-white/75">Avenue Appia 20, CH-1211 Geneva 27, Switzerland</p>
                  <p className="mt-2 text-sm text-white/80">Telephone: <a className="underline decoration-white/30 underline-offset-2" href="tel:+41227912111">+41 22 791 21 11</a></p>
                </article>
                <p className="text-xs leading-relaxed text-white/45">Contact details from the WHO official contact directory. WHO country-level treatment data describes health systems and does not provide a live clinic locator.</p>
              </section>
            )}
            <p className="mt-4 text-xs leading-relaxed text-white/50">{selectedDetail.isFoodDirectoryResult ? "Call ahead to confirm public access, today’s hours, and availability." : hasUSSupportNumbers ? "Please contact the organization to confirm current services, eligibility, cost, and availability. If you need immediate emergency help in the U.S., call or text 988; call 911 for immediate danger." : "Please contact the organization to confirm current services, eligibility, cost, and availability. For immediate danger, contact emergency services where you are."}</p>
            {(selectedDetail.website || selectedDetail.url) && !selectedDetail.id?.endsWith("who-treatment-systems") && (
              <a
                href={selectedDetail.website || selectedDetail.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-wcGold px-4 text-sm font-semibold text-slate-950 transition hover:bg-amber-200"
                aria-label={`Open ${selectedDetail.name || selectedDetail.title || "organization website"} in a new tab`}
              >
                Open organization website <ExternalLink className="h-4 w-4" aria-hidden="true" />
              </a>
            )}
            {(selectedDetail.website || selectedDetail.url) && !selectedDetail.id?.endsWith("who-treatment-systems") && <p className="mt-2 text-xs text-white/45">Your WellnessCafe search and these details stay open in this tab.</p>}
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
