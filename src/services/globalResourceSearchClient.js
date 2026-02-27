// src/services/globalResourceSearchClient.js
// Single entrypoint for global resource search (calls /api/globalResourceSearch or /api/searchLiveResources)

export const globalResourceSearch=async(body={},options={})=>{
  const signal=options?.signal
  const res=await fetch("/api/globalResourceSearch",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(body||{}),
    signal,
  })
  const json=await res.json().catch(()=>null)
  if (!res.ok){
    const e=new Error(json?.message||json?.error||"Search failed")
    e.code=json?.code||`HTTP_${res.status}`
    e.status=res.status
    e.data=json
    throw e
  }
  return json
}
