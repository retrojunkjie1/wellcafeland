#!/usr/bin/env node
import fs from "fs";
import os from "os";

const VITE_PORT=process.env.VITE_PORT||"5173";
const PROJECT_ID=process.env.FIREBASE_PROJECT_ID||process.env.GCLOUD_PROJECT||"wellnesscafelanding";
const REGION=process.env.FUNCTIONS_REGION||"us-central1";

const overrideBase=(process.env.PHASE53_BASE_URL||"").replace(/\/$/,"");
const authToken=process.env.PHASE53_AUTH_TOKEN||"";

const getLanIp=()=>{
  const ifaces=os.networkInterfaces();
  for(const name of Object.keys(ifaces)){
    for(const net of ifaces[name]||[]){
      if(net && net.family==="IPv4" && !net.internal){
        return net.address;
      }
    }
  }
  return "";
};

const withTimeout=(signalMs)=>{
  const controller=new AbortController();
  const id=setTimeout(()=>controller.abort(),signalMs);
  return {signal:controller.signal,done:()=>clearTimeout(id)};
};

async function probeBase(base){
  const t=withTimeout(1200);
  try{
    const r=await fetch(`${base}/`,{method:"GET",signal:t.signal});
    t.done();
    return {ok:true,status:r.status};
  }catch(e){
    t.done();
    return {ok:false,error:{name:e.name,message:e.message,code:e.code||null}};
  }
}

async function postJson(url,body){
  const t=withTimeout(2000);
  try{
    const headers={"Content-Type":"application/json"};
    if(authToken){
      headers.Authorization=`Bearer ${authToken}`;
    }
    const r=await fetch(url,{
      method:"POST",
      headers,
      body:JSON.stringify(body),
      signal:t.signal
    });
    t.done();
    return {status:r.status};
  }catch(e){
    t.done();
    return {status:"ERR",error:{name:e.name,message:e.message,code:e.code||null}};
  }
}

async function resolveBase(){
  if(overrideBase){
    return {chosen:overrideBase,probes:{[overrideBase]:await probeBase(overrideBase)}};
  }

  const lanIp=getLanIp();
  const candidates=[
    `http://127.0.0.1:${VITE_PORT}`,
    `http://localhost:${VITE_PORT}`
  ];
  if(lanIp){
    candidates.push(`http://${lanIp}:${VITE_PORT}`);
  }

  const probes={};
  for(const base of candidates){
    probes[base]=await probeBase(base);
    if(probes[base].ok){
      return {chosen:base,probes};
    }
  }
  return {chosen:candidates[0],probes};
}

function print(report){
  console.log("PHASE53_VERIFY");
  console.log(JSON.stringify(report,null,2));
}

function fail(report){
  print(report);
  console.error("FAIL");
  process.exit(1);
}

async function run(){
  const {chosen,probes}=await resolveBase();

  const aiSessionPayload={mode:"telemetry",event:{}};
  const globalSearchPayload={query:"test",domain:"",limit:1};

  const ai=await postJson(`${chosen}/api/aiSession`,aiSessionPayload);
  const search=await postJson(`${chosen}/api/globalResourceSearch`,globalSearchPayload);

  const report={
    chosenBase:chosen,
    baseProbes:probes,
    projectId:PROJECT_ID,
    region:REGION,
    vitePort:VITE_PORT,
    breathingExists:fs.existsSync("src/features/breathing/LuxuryBreathing.jsx"),
    proxy:{
      aiSession:ai,
      globalResourceSearch:search
    }
  };

  const hardBad=(x)=>(x.status===404 || x.status==="ERR");
  if(hardBad(report.proxy.aiSession) || hardBad(report.proxy.globalResourceSearch)){
    return fail(report);
  }

  const okStatus=(s)=>(s===200 || s===401);

  const ok=
    report.breathingExists===true &&
    okStatus(report.proxy.aiSession.status) &&
    okStatus(report.proxy.globalResourceSearch.status);

  if(!ok){
    return fail(report);
  }

  print(report);
  console.log("PASS");
}

run().catch((e)=>{console.error(e);process.exit(1);});
