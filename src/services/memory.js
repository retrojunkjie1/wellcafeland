// src/services/memory.js

// Legacy AI – restricted scope: Memory service only
// Thin front-end helper that talks to aiSession (legacy endpoint), which then talks to Pinecone.
// NOT for primary conversational AI (use guideEngine() or sendChatMultimodal() instead)

const MEMORY_ENDPOINT = "/aiSession";

const safeFetchJson = async (body)=>{
  try{
    const res=await fetch(MEMORY_ENDPOINT,{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify(body)
    });
    if(!res.ok){
      console.error("Memory API error",res.status);
      return null;
    }
    return await res.json();
  }catch(err){
    console.error("Memory API failed",err);
    return null;
  }
};

// store a memory fragment (e.g. "client prefers evening sessions")
export const storeMemory = async (scope,content,meta)=>{
  return await safeFetchJson({
    mode:"memory_store",
    scope,
    content,
    meta
  });
};

// retrieve context for a question (e.g. "what patterns matter for relapse?")
export const retrieveMemory = async (scope,query)=>{
  return await safeFetchJson({
    mode:"memory_retrieve",
    scope,
    query
  });
};

