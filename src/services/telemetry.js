// src/services/telemetry.js

import { getAnonymousUserId } from "../lib/userId";

const TELEMETRY_ENDPOINT = "/aiSession";

// in-memory buffer so Admin can see something even before backend wiring
const telemetryBuffer = [];

const basePayload = ()=>({
  source:"wellnesscafe-os",
  userId: getAnonymousUserId(),
  ts:new Date().toISOString()
});

const safeFetch = async (body)=>{
  try{
    await fetch(TELEMETRY_ENDPOINT,{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify(body)
    });
  }catch(err){
    // don't ever crash the UI because telemetry failed
    console.error("Telemetry error",err);
  }
};

export const trackEvent = async (event)=>{
  const payload={...basePayload(),type:"event",event};
  telemetryBuffer.push(payload);
  if(telemetryBuffer.length>200){
    telemetryBuffer.shift();
  }
  await safeFetch({mode:"telemetry",event:payload});
};

export const trackPageView = async (path)=>{
  await trackEvent({kind:"page_view",path});
};

export const trackAction = async (actionId,meta)=>{
  await trackEvent({kind:"action",actionId,meta});
};

export const trackError = async (where,message)=>{
  await trackEvent({kind:"error",where,message});
};

// simple snapshot so Admin console can read live counts
export const getTelemetrySnapshot = ()=>{
  const total=telemetryBuffer.length;
  const byKind={};
  telemetryBuffer.forEach((e)=>{
    const k=e.event?.kind||"unknown";
    byKind[k]=(byKind[k]||0)+1;
  });
  return{
    totalEvents:total,
    byKind,
    lastEvent:telemetryBuffer[total-1]||null
  };
};

