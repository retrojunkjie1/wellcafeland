// src/services/aiSessionClient.js
// Single entrypoint for all /api/aiSession requests. Waits for auth before calling.

import {onAuthStateChanged} from "firebase/auth"
import {getAnonymousUserId} from "@/lib/userId"

export const waitForUser=(auth,timeoutMs=8000)=>(
  new Promise((resolve)=>{
    if (!auth) return resolve(null)
    if (auth.currentUser) return resolve(auth.currentUser)

    let done=false
    const timer=setTimeout(()=>{
      if (done) return
      done=true
      try{unsub()}catch{}
      return resolve(null)
    },timeoutMs)

    const unsub=onAuthStateChanged(auth,(u)=>{
      if (done) return
      done=true
      clearTimeout(timer)
      try{unsub()}catch{}
      return resolve(u||null)
    })
  })
)

export const callAiSession=async(payload={},options={})=>{
  const {auth}=await import("@/firebase")
  const signal=options?.signal
  const user=await waitForUser(auth)

  if (!user){
    const e=new Error("AUTH_REQUIRED")
    e.code="AUTH_REQUIRED"
    throw e
  }

  const idToken=await user.getIdToken()
  let body={userId:getAnonymousUserId(),...(payload||{})}
  if (options?.contextMessages && Array.isArray(options.contextMessages) && options.contextMessages.length>0){
    const lastN=(options.contextMessagesLimit||12)
    const ctx=options.contextMessages.slice(-lastN).map(m=>({role:m.role||"user",text:(m.text||m.content||"").slice(0,8000)}))
    body={...body,contextMessages:ctx}
  }
  const res=await fetch("/api/aiSession",{
    method:"POST",
    headers:{
      "Content-Type":"application/json",
      "Authorization":`Bearer ${idToken}`,
    },
    body:JSON.stringify(body),
    signal,
  })

  const json=await res.json().catch(()=>null)

  if (!res.ok){
    const code=json?.code||`HTTP_${res.status}`
    const msg=json?.message||json?.error||"Request failed"
    const e=new Error(msg)
    e.code=code
    e.status=res.status
    e.data=json
    throw e
  }

  return json
}
