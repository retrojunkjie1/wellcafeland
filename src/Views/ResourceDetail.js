/* global globalThis */
import React, { useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import data from "../data/assistanceDirectory.json";
import "./PageTemplate.css";
import "../components/ComplianceNotice.css";
import "./ResourceDetail.css";
import "../features/assistance/AssistanceDirectory.css";

const slugify = (s) => {
  return String(s)
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, "-")
    .replaceAll(/(^-|-$)/g, "");
};

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

const ResourceDetail = () => {
  const { slug } = useParams();
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [copied, setCopied] = useState(false);

  const match = useMemo(() => {
    const bySlug = (it) =>
      `${slugify(it.category)}-${slugify(it.name)}` === slug;
    return data.find(bySlug);
  }, [slug]);

  if (!match) {
    return (
      <section className="page glass">
        <div className="container">
          <h2>Resource not found</h2>
          <p>
            The resource you are looking for may have moved or been updated.
          </p>
          <Link to="/assistance" className="btn">
            ← Back to Assistance
          </Link>
        </div>
      </section>
    );
  }

  const it = match;

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

  const goToOfficial = () => {
    if (!it?.contact?.website) return;
    setConfirmLeave(false);
    globalThis.open?.(it.contact.website, "_blank", "noopener,noreferrer");
  };

  const linkify = (text) => {
    if (!text) return null;
    const parts = String(text).split(/(https?:\/\/[^\s)]+)|(www\.[^\s)]+)/gi);
    let keyCounter = 0;
    return parts.map((part) => {
      if (!part) return null;
      let url = null;
      if (part.startsWith("http")) {
        url = part;
      } else if (part.startsWith("www.")) {
        url = `https://${part}`;
      }
      const k = `seg-${keyCounter++}-${part}`;
      return url ? (
        <a
          key={k}
          className="rd-inline-link"
          href={url}
          target="_blank"
          rel="noreferrer"
        >
          {part}
        </a>
      ) : (
        <span key={k}>{part}</span>
      );
    });
  };

  return (
    <section className="page glass rd-page">
      <div className="container">
        <header className="flex items-center gap-3 mb-4">
          <div
            className="wellness-icon-card wellness-icon wellness-icon-sm"
            aria-hidden
          >
            {iconForCategory(it.category)}
          </div>
          <div>
            <h1 className="rd-title">{it.name}</h1>
            <div className="rd-meta">
              {it.type} • {it.location}
            </div>
          </div>
        </header>

        {it.description && (
          <p className="rd-intro">{linkify(it.description)}</p>
        )}

        <div className="rd-grid">
          {Array.isArray(it.services) && it.services.length > 0 && (
            <div className="rd-block">
              <h3 className="rd-h3">Services</h3>
              <ul className="rd-bullets">
                {it.services.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
          )}
          {it.eligibility && (
            <div className="rd-block">
              <h3 className="rd-h3">Eligibility</h3>
              <p className="rd-text">{linkify(it.eligibility)}</p>
            </div>
          )}
          {it.howToApply && (
            <div className="rd-block">
              <h3 className="rd-h3">How to apply</h3>
              <p className="rd-text">{linkify(it.howToApply)}</p>
            </div>
          )}
          {Array.isArray(it.documents) && it.documents.length > 0 && (
            <div className="rd-block">
              <h3 className="rd-h3">Documents to prepare</h3>
              <ul className="rd-bullets">
                {it.documents.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
            </div>
          )}
          {it.hours && (
            <div className="rd-block">
              <h3 className="rd-h3">Hours</h3>
              <p className="rd-text">{it.hours}</p>
            </div>
          )}
          {it.languages && (
            <div className="rd-block">
              <h3 className="rd-h3">Languages</h3>
              <p className="rd-text">{it.languages}</p>
            </div>
          )}
          {it.cost && (
            <div className="rd-block">
              <h3 className="rd-h3">Cost</h3>
              <p className="rd-text">{it.cost}</p>
            </div>
          )}
          {it.notes && (
            <div className="rd-block">
              <h3 className="rd-h3">Notes</h3>
              <p className="rd-text">{linkify(it.notes)}</p>
            </div>
          )}
        </div>

        <div className="rd-cta">
          {it.contact?.phone && (
            <a
              className="btn rd-btn"
              href={`tel:${String(it.contact.phone).replaceAll(/[^+\d]/g, "")}`}
            >
              Call
            </a>
          )}
          {it.contact?.email && it.contact.email !== "" && (
            <a className="btn rd-btn" href={`mailto:${it.contact.email}`}>
              Email
            </a>
          )}
          <button
            type="button"
            className="btn rd-btn"
            onClick={() => {
              try {
                navigator.clipboard?.writeText(globalThis.location?.href ?? "");
                setCopied(true);
                track("assistance_share_detail", {
                  name: it.name,
                  category: it.category,
                });
                setTimeout(() => setCopied(false), 1600);
              } catch (e) {
                // eslint-disable-next-line no-console
                console.log("Share copy failed", e);
              }
            }}
          >
            {copied ? "Copied" : "Share"}
          </button>
          {it.contact?.website && (
            <button
              type="button"
              className="btn rd-btn-primary"
              onClick={() => setConfirmLeave(true)}
            >
              Apply on official site
            </button>
          )}
          {/* Keep users on-site by not linking out by default; we can add an explicit leave-site flow later. */}
        </div>

        <div className="rd-back">
          <Link
            to={`/assistance?open=${encodeURIComponent(it.category)}`}
            className="rd-inline-link"
            onClick={() =>
              track("assistance_back_to_category", { category: it.category })
            }
          >
            ← Back to Assistance
          </Link>
        </div>

        {confirmLeave && (
          <dialog
            className="rd-leave-backdrop"
            open
            onClose={() => setConfirmLeave(false)}
          >
            <div className="rd-leave-modal">
              <h3 className="rd-h3">You’re leaving WellnessCafe</h3>
              <p className="rd-text">
                We’ll open the official site in a new tab so you can complete
                the application. You can return here anytime.
              </p>
              <div className="rd-leave-actions">
                <button
                  className="btn rd-btn"
                  onClick={() => setConfirmLeave(false)}
                >
                  Stay here
                </button>
                <button className="btn rd-btn-primary" onClick={goToOfficial}>
                  Proceed
                </button>
              </div>
            </div>
          </dialog>
        )}
      </div>
    </section>
  );
};

export default ResourceDetail;
