// src/apps/resources/ResourcesDetailPage.jsx
// Firestore resource detail view

import React,{useState,useEffect} from "react"
import {useParams,useNavigate} from "react-router-dom"
import {getResource} from "@/data/resources"
import {ensureDevAuth} from "@/dev/ensureAuth"
import Loading from "@/components/Loading"
import PageHeader from "@/components/navigation/PageHeader"
import {ArrowLeft,ExternalLink,MapPin,Phone,Mail,CheckCircle} from "lucide-react"
import { normalizeExternalUrl } from "@/utils/normalizeUrl";
import OpenInAppButton from "@/components/OpenInAppButton";

const NEED_DEV_AUTH = import.meta.env.DEV && import.meta.env.VITE_USE_EMULATORS === "true"

const ResourcesDetailPage = () => {
  const {id} = useParams()
  const navigate = useNavigate()
  const [item,setItem] = useState(null)
  const [loading,setLoading] = useState(true)
  const [error,setError] = useState(null)
  const [authReady,setAuthReady] = useState(!NEED_DEV_AUTH)

  useEffect(() => {
    if (!NEED_DEV_AUTH) return
    ensureDevAuth().then((ok) => setAuthReady(ok))
  },[])

  useEffect(() => {
    if (!id) {
      setLoading(false)
      setError("Invalid resource")
      return
    }
    if (!authReady) return
    setLoading(true)
    setError(null)
    getResource(id)
      .then((r) => {
        setItem(r);
        setError(r ? null : "Not found");
      })
      .catch((err) => {
        setError(err.message || "Failed to load");
      })
      .finally(() => setLoading(false))
  },[id,authReady])

  if (!authReady) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <p className="text-amber-200 text-sm">
          Auth emulator not ready. Start auth emulator or disable VITE_USE_EMULATORS.
        </p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loading message="Loading…" />
      </div>
    )
  }

  if (error || !item) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6">
        <p className="text-white/60 mb-4">{error || "Resource not found"}</p>
        <button
          type="button"
          onClick={() => navigate("/resources")}
          className="flex items-center gap-2 rounded-lg border border-white/20 px-4 py-2 text-sm hover:bg-white/10"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to resources
        </button>
      </div>
    );
  }

  const url = item.contact?.url || item.url;

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <PageHeader
        title={item.title}
        subtitle={item.type || "Resource"}
        showBack
        backTo="/resources"
      />
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 max-w-3xl mx-auto w-full">
        {item.verified && (
          <span className="inline-flex items-center gap-1 text-xs text-amber-400 mb-4">
            <CheckCircle className="h-4 w-4" />
            Verified
          </span>
        )}
        {item.location?.region && (
          <div className="flex items-center gap-2 text-sm text-white/70 mb-4">
            <MapPin className="h-4 w-4" />
            {item.location.region}
          </div>
        )}
        {item.contact?.phone && (
          <a
            href={`tel:${item.contact.phone}`}
            className="flex items-center gap-2 text-sm text-white/80 hover:text-white mb-2"
          >
            <Phone className="h-4 w-4" />
            {item.contact.phone}
          </a>
        )}
        {item.contact?.email && (
          <a
            href={`mailto:${item.contact.email}`}
            className="flex items-center gap-2 text-sm text-white/80 hover:text-white mb-4"
          >
            <Mail className="h-4 w-4" />
            {item.contact.email}
          </a>
        )}
        {url && normalizeExternalUrl(url) && (
          <OpenInAppButton url={normalizeExternalUrl(url)} title={item.title} />
        )}
        {Array.isArray(item.tags) && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-6">
            {item.tags.map((t) => (
              <span
                key={t}
                className="px-2 py-1 rounded bg-white/5 text-xs text-white/70 border border-white/10"
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResourcesDetailPage;
