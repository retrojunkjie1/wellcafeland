// src/apps/resources/ResourcesListPage.jsx
// Firestore-backed resource directory: list + filters + pagination (indexed mode)

import React,{useState,useEffect,useCallback} from "react"
import {useNavigate,useSearchParams} from "react-router-dom"
import {listResources,getResourceFilters} from "@/data/resources"
import {ensureDevAuth} from "@/dev/ensureAuth"
import Loading from "@/components/Loading"
import PageHeader from "@/components/navigation/PageHeader"
import {ExternalLink,MapPin,CheckCircle} from "lucide-react"
import { normalizeExternalUrl } from "@/utils/normalizeUrl";
import OpenInAppButton from "@/components/OpenInAppButton";

const NEED_DEV_AUTH = import.meta.env.DEV && import.meta.env.VITE_USE_EMULATORS === "true"

const ResourcesListPage=() => {
  const navigate=useNavigate()
  const [searchParams]=useSearchParams()

  const [items,setItems]=useState([])
  const [loading,setLoading]=useState(true)
  const [loadingMore,setLoadingMore]=useState(false)
  const [error,setError]=useState(null)
  const [nextDoc,setNextDoc]=useState(null)
  const [authReady,setAuthReady]=useState(!NEED_DEV_AUTH)

  const [filters,setFilters]=useState({types:[],tags:[]})

  const [typeFilter,setTypeFilter]=useState(searchParams.get("type")||"")
  const [tagFilter,setTagFilter]=useState(searchParams.get("tag")||"")
  const [verifiedOnly,setVerifiedOnly]=useState(searchParams.get("verified")==="true")

  const verifiedParam=verifiedOnly ? true : null

  useEffect(() => {
    if (!NEED_DEV_AUTH) return
    ensureDevAuth().then((ok) => setAuthReady(ok))
  },[])

  const load=useCallback(async (append=false,startAfterDoc=null) => {
    if(append) setLoadingMore(true)
    else setLoading(true)

    setError(null)

    try{
      const {items:data,nextDoc:next,error:err}=await listResources({
        type:typeFilter||undefined,
        verified:verifiedParam,
        tag:tagFilter||undefined,
        startAfterDoc,
        mode:"indexed"
      })

      if(err){
        setError(err)
        if(!append) setItems([])
        return
      }

      setItems((prev) => (append ? [...prev,...data] : data))
      setNextDoc(next)
    }catch(err){
      setError(err?.message||"Failed to load")
      if(!append) setItems([])
    }finally{
      setLoading(false)
      setLoadingMore(false)
    }
  },[typeFilter,tagFilter,verifiedParam])

  useEffect(() => {
    if (!authReady) return
    load(false,null)
  },[load,authReady])

  useEffect(() => {
    if (!authReady) return
    getResourceFilters().then((f) => setFilters(f)).catch(() => {})
  },[authReady])

  const loadMore=() => {
    if(!nextDoc || loadingMore) return
    load(true,nextDoc)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <PageHeader title="Resources" subtitle="Verified recovery and wellness resources" />

      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-white/20 focus:outline-none"
          >
            <option value="">All types</option>
            {(filters.types||[]).map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          <select
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-white/20 focus:outline-none"
          >
            <option value="">All tags</option>
            {(filters.tags||[]).map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          <label className="flex items-center gap-2 text-sm text-white/70">
            <input
              type="checkbox"
              checked={verifiedOnly}
              onChange={(e) => setVerifiedOnly(e.target.checked)}
              className="rounded border-white/20"
            />
            Verified only
          </label>
        </div>

        {!authReady ? (
          <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            Auth emulator not ready. Start auth emulator or disable VITE_USE_EMULATORS.
          </div>
        ) : loading ? (
          <Loading message="Loading resources…" />
        ) : error ? (
          <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            {error}
          </div>
        ) : items.length===0 ? (
          <div className="text-center py-12 text-white/50">
            No resources match filters.
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {items.map((r) => (
                <div
                  key={r.id}
                  onClick={() => navigate(`/resources/${r.id}`)}
                  className="rounded-lg border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition cursor-pointer"
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-white">{r.title}</h3>

                      {r.type && (
                        <span className="text-xs text-white/50">{r.type}</span>
                      )}

                      {r.location?.region && (
                        <div className="flex items-center gap-1 mt-1 text-xs text-white/50">
                          <MapPin className="h-3 w-3" />
                          {r.location.region}
                        </div>
                      )}

                      {r.verified && (
                        <span className="inline-flex items-center gap-1 mt-1 text-xs text-amber-400">
                          <CheckCircle className="h-3 w-3" />
                          Verified
                        </span>
                      )}
                    </div>

                    {r.contact?.url && normalizeExternalUrl(r.contact.url) && (
                      <OpenInAppButton
                        url={normalizeExternalUrl(r.contact.url)}
                        title={r.title}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </OpenInAppButton>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {nextDoc && (
              <div className="mt-6 flex justify-center">
                <button
                  type="button"
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="px-4 py-2 rounded-lg border border-white/20 bg-white/5 text-sm text-white hover:bg-white/10 disabled:opacity-50"
                >
                  {loadingMore ? "Loading…" : "Load more"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default ResourcesListPage