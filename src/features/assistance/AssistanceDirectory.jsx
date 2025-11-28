/* global globalThis */
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
// Reuse the unified glass icon system from PageTemplate for transparent icons
import "../../Views/PageTemplate.css";
import "./AssistanceDirectory.css";
import data from "../../data/assistanceDirectory.json";

const iconForCategory = (cat) => {
  const map = {
    "Recovery Centers": "🧘",
    "Sober Living Homes": "🏠",
    "Legal Aid": "⚖️",
    "Financial Assistance": "💼",
    "Housing Assistance": "🏘️",
    "Healthcare Navigation": "💊",
    "Crisis & Hotlines": "📞",
    "Employment & Education": "🎓",
    "Resource Hubs": "🧭",
  };
  return map[cat] || "📚";
};

const unique = (arr) => Array.from(new Set(arr));

const AssistanceDirectory = () => {
  // Note: we rely on window in this app environment
  const [query, setQuery] = useState("");
  const [stateFilter, setStateFilter] = useState("ALL");
  const [modalCat, setModalCat] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const slugify = (s) =>
    String(s)
      .toLowerCase()
      .replaceAll(/[^a-z0-9]+/g, "-")
      .replaceAll(/(^-|-$)/g, "");
  const resourceSlug = (it) => `${slugify(it.category)}-${slugify(it.name)}`;

  const categories = useMemo(() => unique(data.map((d) => d.category)), []);
  const states = useMemo(
    () => ["ALL", ...unique(data.map((d) => d.state).filter(Boolean))],
    []
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return data.filter((d) => {
      const byState = stateFilter === "ALL" || d.state === stateFilter;
      const byQuery =
        !q ||
        [d.category, d.name, d.location, d.type]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q));
      return byState && byQuery;
    });
  }, [query, stateFilter]);

  const grouped = useMemo(() => {
    const map = {};
    for (const item of filtered) {
      map[item.category] = map[item.category] || [];
      map[item.category].push(item);
    }
    return map;
  }, [filtered]);

  const categoryMeta = useMemo(
    () => ({
      "Recovery Centers": {
        title: "Recovery Centers",
        desc: "Inpatient and outpatient treatment with holistic recovery programs.",
        bullets: [
          "Detox, residential, PHP/IOP/OP",
          "Medication-Assisted Treatment (MAT)",
          "Family, peer, and aftercare support",
          "Grants and sliding-scale options",
        ],
      },
      "Sober Living Homes": {
        title: "Sober Living Homes",
        desc: "Safe, peer-supported housing for sustained recovery.",
        bullets: [
          "Drug-free housing with accountability",
          "House meetings, curfews, and chores",
          "Transition planning and job support",
          "Scholarships and low-cost beds (varies)",
        ],
      },
      "Legal Aid": {
        title: "Legal Aid & Advocacy",
        desc: "Civil legal support, tenant rights, benefits, and more.",
        bullets: [
          "Evictions, housing conditions, benefits appeals",
          "Protection orders and family law assistance",
          "Immigration and disability rights",
          "Pro bono and low-cost services",
        ],
      },
      "Financial Assistance": {
        title: "Financial Assistance",
        desc: "Find public benefits, grants, and cost-of-care help.",
        bullets: [
          "SSI/SSDI, TANF, SNAP/EBT",
          "LIHEAP utility assistance",
          "Emergency cash and rental aid",
          "Program finder and eligibility guidance",
        ],
      },
      "Housing Assistance": {
        title: "Housing Assistance",
        desc: "Affordable housing, HUD resources, homeless services.",
        bullets: [
          "Section 8/HCV and public housing",
          "Continuum of Care and rapid rehousing",
          "Emergency shelter placement",
          "Fair housing and tenant protections",
        ],
      },
      "Healthcare Navigation": {
        title: "Healthcare Navigation",
        desc: "Medicaid options, coverage, and care coordination.",
        bullets: [
          "Medicaid/CHIP/Medicare enrollment",
          "Marketplace plans and subsidies",
          "Primary care and specialist referrals",
          "Behavioral health coverage and parity",
        ],
      },
      "Crisis & Hotlines": {
        title: "Emergency & Crisis Intervention",
        desc: "24/7 hotlines, safety planning, and rapid response.",
        bullets: [
          "988 Suicide & Crisis Lifeline",
          "DV shelters and safety planning",
          "Utility shut-off and eviction prevention",
          "Emergency food and transportation",
        ],
      },
      "Employment & Education": {
        title: "Employment & Education",
        desc: "Job search, training, and upskilling programs.",
        bullets: [
          "Workforce centers and resume help",
          "Vocational rehab and apprenticeships",
          "GED and adult education",
          "Job Corps and tuition support",
        ],
      },
      "Resource Hubs": {
        title: "Resource Hubs",
        desc: "One-stop directories to search local help across many needs.",
        bullets: [
          "Food, housing, money, care, education, work",
          "Browse by ZIP code and contact directly",
          "National and local nonprofit programs",
          "Filter for cost, language, and eligibility",
        ],
      },
    }),
    []
  );

  const track = (event, payload = {}) => {
    try {
      if (globalThis && Array.isArray(globalThis.dataLayer)) {
        globalThis.dataLayer.push({ event, ...payload });
      }
      // eslint-disable-next-line no-console
      console.log(`[analytics] ${event}`, payload);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn("[analytics] track failed", e);
    }
  };

  const openModal = (cat) => {
    setModalCat(cat);
    track("assistance_category_open", { category: cat });
  };
  const closeModal = () => setModalCat(null);

  // Robust clipboard helper with fallback for older/iOS browsers
  const copyToClipboard = async (text) => {
    try {
      if (globalThis.navigator?.clipboard && globalThis.isSecureContext) {
        await globalThis.navigator.clipboard.writeText(text);
        return true;
      }
      // Fallback disabled to avoid deprecated execCommand; report failure
      return false;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log("Clipboard copy failed", e);
      return false;
    }
  };

  const bgStyle = {
    backgroundImage: `linear-gradient(160deg, #0b0f0c 0%, #0f1813 70%, #172420 100%), url(${process.env.PUBLIC_URL}/assets/images/assistance-bg-dark.jpg), url(${process.env.PUBLIC_URL}/assets/images/assistance-bg-dark.svg)`,
    backgroundPosition: "center",
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
  };

  const modalRef = useRef(null);

  useEffect(() => {
    if (!modalCat) return;
    const onKey = (e) => {
      if (e.key === "Escape") {
        closeModal();
      }
    };
    globalThis.addEventListener?.("keydown", onKey);
    // focus modal for accessibility
    const t = setTimeout(() => {
      modalRef.current?.focus();
    }, 0);
    return () => {
      globalThis.removeEventListener?.("keydown", onKey);
      clearTimeout(t);
    };
  }, [modalCat]);

  // Initialize filters from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get("q");
    const st = params.get("state");
    if (q) setQuery(q);
    if (st) setStateFilter(st);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist filters to URL without reload
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (query) params.set("q", query);
    else params.delete("q");
    if (stateFilter && stateFilter !== "ALL") params.set("state", stateFilter);
    else params.delete("state");
    const search = params.toString();
    const next = search
      ? `?${search}${location.hash || ""}`
      : `${location.hash || ""}`;
    if (next !== `${location.search}${location.hash || ""}`) {
      navigate(
        {
          pathname: location.pathname,
          search: search || undefined,
          hash: location.hash,
        },
        { replace: true }
      );
    }
  }, [
    query,
    stateFilter,
    navigate,
    location.pathname,
    location.search,
    location.hash,
  ]);

  // Deep-link support: auto-open category via ?open=<Category> or #<Category>
  useEffect(() => {
    if (modalCat) return;
    const params = new URLSearchParams(location.search);
    const open =
      params.get("open") || decodeURIComponent(location.hash.replace(/^#/, ""));
    if (!open) return;
    const target = categories.find(
      (c) => c && c.toLowerCase() === String(open).toLowerCase()
    );
    if (target) {
      setTimeout(() => openModal(target), 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search, location.hash, categories.length]);

  return (
    <section
      className="assistance-section"
      aria-label="WellnessCafe Assistance Whitebook"
      style={bgStyle}
    >
      <div className="assistance-overlay"></div>
      <div className="assistance-container">
        <header className="assistance-header">
          <h2 className="assistance-title">
            Government & Wellness Assistance — Connect. Recover. Rebuild.
          </h2>
          <p className="assistance-sub">
            Your living directory of wellness, recovery, and support systems.
          </p>
        </header>

        <div className="ad-actions">
          <div className="ad-search">
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
              }}
              placeholder="Search by state, category, or name"
              aria-label="Search"
            />
          </div>
          <div className="ad-select">
            <select
              value={stateFilter}
              onChange={(e) => {
                setStateFilter(e.target.value);
              }}
              aria-label="Filter by state"
            >
              {states.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="ad-grid">
          {Object.entries(categoryMeta).map(([cat, meta]) => (
            <article key={cat} className="ad-card">
              <button
                type="button"
                className="ad-card-click"
                onClick={() => openModal(cat)}
                aria-label={`Open ${meta.title} resources`}
              >
                <div
                  className="wellness-icon-card wellness-icon wellness-icon-sm"
                  aria-hidden
                >
                  {iconForCategory(cat)}
                </div>
                <h3 className="ad-card-title">{meta.title}</h3>
                <p className="ad-card-desc">{meta.desc}</p>
                <span className="ad-learn">Learn more →</span>
              </button>
            </article>
          ))}
        </div>

        {modalCat && (
          <dialog
            className="ad-modal-backdrop"
            open
            onCancel={(e) => {
              e.preventDefault();
              closeModal();
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                e.preventDefault();
                closeModal();
              }
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) closeModal();
            }}
          >
            <div className="ad-modal" tabIndex={-1} ref={modalRef}>
              <div className="ad-modal-header">
                <div
                  className="wellness-icon-card wellness-icon wellness-icon-sm"
                  aria-hidden
                >
                  {iconForCategory(modalCat)}
                </div>
                <h3 className="ad-modal-title">
                  {categoryMeta[modalCat]?.title || modalCat}
                </h3>
                <button
                  className="ad-modal-close"
                  onClick={async () => {
                    const url = `${
                      globalThis.location.origin
                    }/assistance?open=${encodeURIComponent(modalCat)}`;
                    const ok = await copyToClipboard(url);
                    track("assistance_share_category", {
                      category: modalCat,
                      ok,
                    });
                  }}
                  aria-label="Share category"
                  title="Copy share link"
                >
                  ⤴︎
                </button>
                <button
                  className="ad-modal-close"
                  onClick={closeModal}
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>
              <div className="ad-links">
                {categoryMeta[modalCat] && (
                  <div className="ad-category-info">
                    <div className="ad-section-title">
                      What this category offers
                    </div>
                    <p className="ad-category-desc">
                      {categoryMeta[modalCat].desc}
                    </p>
                    {categoryMeta[modalCat].bullets && (
                      <ul className="ad-bullets">
                        {categoryMeta[modalCat].bullets.map((b) => (
                          <li key={b}>{b}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
                {(grouped[modalCat] || []).map((it) => (
                  <div key={it.name + it.location} className="ad-item">
                    {it.contact?.website && (
                      <a
                        className="ad-link"
                        href={it.contact.website}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`Open official site for ${it.name}`}
                        onClick={() =>
                          track("assistance_apply_click", {
                            name: it.name,
                            category: it.category,
                          })
                        }
                      >
                        Apply
                      </a>
                    )}
                    <div>
                      <div className="ad-item-title">{it.name}</div>
                      <div className="ad-item-meta">
                        {it.type} • {it.location}
                      </div>
                    </div>
                    <div className="ad-links">
                      {it.contact?.phone && (
                        <a
                          className="ad-link"
                          href={`tel:${it.contact.phone.replaceAll(
                            /[^+\d]/g,
                            ""
                          )}`}
                          onClick={() =>
                            track("assistance_call_click", {
                              name: it.name,
                              category: it.category,
                            })
                          }
                        >
                          Call
                        </a>
                      )}
                      <button
                        type="button"
                        className="ad-link"
                        onClick={() => {
                          track("assistance_details_click", {
                            name: it.name,
                            category: it.category,
                          });
                          navigate(`/assistance/${resourceSlug(it)}`);
                        }}
                        aria-label={`Open details for ${it.name}`}
                      >
                        Details
                      </button>
                      {it.contact?.email && it.contact.email !== "" && (
                        <a
                          className="ad-link"
                          href={`mailto:${it.contact.email}`}
                          onClick={() =>
                            track("assistance_email_click", {
                              name: it.name,
                              category: it.category,
                            })
                          }
                        >
                          Email
                        </a>
                      )}
                    </div>
                    {(it.description ||
                      it.services ||
                      it.eligibility ||
                      it.howToApply ||
                      it.documents ||
                      it.hours ||
                      it.languages ||
                      it.cost ||
                      it.notes) && (
                      <details className="ad-details">
                        <summary>More details</summary>
                        {it.description && (
                          <p className="ad-detail-text">{it.description}</p>
                        )}
                        {Array.isArray(it.services) &&
                          it.services.length > 0 && (
                            <div className="ad-detail-block">
                              <div className="ad-detail-title">Services</div>
                              <ul className="ad-bullets">
                                {it.services.map((s) => (
                                  <li key={s}>{s}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        {it.eligibility && (
                          <div className="ad-detail-block">
                            <div className="ad-detail-title">Eligibility</div>
                            <p className="ad-detail-text">{it.eligibility}</p>
                          </div>
                        )}
                        {it.howToApply && (
                          <div className="ad-detail-block">
                            <div className="ad-detail-title">How to apply</div>
                            <p className="ad-detail-text">{it.howToApply}</p>
                          </div>
                        )}
                        {Array.isArray(it.documents) &&
                          it.documents.length > 0 && (
                            <div className="ad-detail-block">
                              <div className="ad-detail-title">
                                Documents to prepare
                              </div>
                              <ul className="ad-bullets">
                                {it.documents.map((d) => (
                                  <li key={d}>{d}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        {it.hours && (
                          <div className="ad-detail-grid">
                            <span>Hours</span>
                            <span>{it.hours}</span>
                          </div>
                        )}
                        {it.languages && (
                          <div className="ad-detail-grid">
                            <span>Languages</span>
                            <span>{it.languages}</span>
                          </div>
                        )}
                        {it.cost && (
                          <div className="ad-detail-grid">
                            <span>Cost</span>
                            <span>{it.cost}</span>
                          </div>
                        )}
                        {it.notes && (
                          <div className="ad-detail-block">
                            <div className="ad-detail-title">Notes</div>
                            <p className="ad-detail-text">{it.notes}</p>
                          </div>
                        )}
                      </details>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </dialog>
        )}

        <div className="ad-footer">
          “Built with clarity — powered by WellnessCafe Intelligence © 2025”
        </div>
      </div>
    </section>
  );
};

export default AssistanceDirectory;
