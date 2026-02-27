// src/services/memory.js

// Legacy AI – restricted scope: Memory service only
// Thin front-end helper that talks to aiSession (legacy endpoint), which then talks to Pinecone.
// NOT for primary conversational AI (use guideEngine() or sendChatMultimodal() instead)

import { callAiSession } from "@/services/aiSessionClient";

const safeFetchJson = async (body)=>{
  try{
    return await callAiSession(body);
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

