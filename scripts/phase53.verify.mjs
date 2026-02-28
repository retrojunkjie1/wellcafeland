#!/usr/bin/env node
import fs from "fs";
import os from "os";

const portStr=process.env.VITE_PORT||"5173";
const portsFromEnv=portStr.split(",").map((p)=>p.trim()).filter(Boolean);
const defaultPorts=["5173","5174","5175","4173","3000"];
const PORTS=[...new Set([...portsFromEnv,...defaultPorts])];

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

const sleep=(ms)=>new Promise((r)=>setTimeout(r,ms));

const withTimeout=(signalMs)=>{
  const controller=new AbortController();
  const id=setTimeout(()=>controller.abort(),signalMs);
  return {signal:controller.signal,done:()=>clearTimeout(id)};
};

async function getText(url){
  const t=withTimeout(900);
  try{
    const r=await fetch(url,{method:"GET",signal:t.signal});
    const text=await r.text();
    t.done();
    return {ok:true,status:r.status,text};
  }catch(e){
    t.done();
    return {ok:false,status:"ERR",error:{name:e.name,message:e.message,code:e.code||null}};
  }
}

async function probe(url){
  const t=withTimeout(900);
  try{
    const r=await fetch(url,{method:"GET",signal:t.signal});
    t.done();
    return {ok:true,status:r.status};
  }catch(e){
    t.done();
    return {ok:false,status:"ERR",error:{name:e.name,message:e.message,code:e.code||null}};
  }
}

async function looksLikeVite(base){
  const root=await getText(`${base}/`);
  if(!root.ok || root.status!==200){
    return {ok:false,root};
  }
  const hasClient=root.text.includes("/@vite/client");
  if(!hasClient){
    return {ok:false,root};
  }
  const client=await probe(`${base}/@vite/client`);
  if(!client.ok || client.status!==200){
    return {ok:false,root,client};
  }
  return {ok:true,root:{status:root.status},client};
}

async function postJson(url,body){
  const t=withTimeout(6000);
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

async function postJsonRetry(url,body,attempts=3){
  let last=null;
  for(let i=0;i<attempts;i++){
    const res=await postJson(url,body);
    if(res.status!=="ERR"){
      return res;
    }
    last=res;
    await sleep(250*(i+1));
  }
  return last||{status:"ERR"};
}

async function waitForProxy(base){
  const deadline=Date.now()+12000;
  const payload={q:"test",limit:1};
  while(Date.now()<deadline){
    const res=await postJsonRetry(`${base}/api/globalResourceSearch`,payload,1);
    if(res && res.status!=="ERR"){
      return {ready:true,status:res.status};
    }
    await sleep(300);
  }
  return {ready:false};
}

async function resolveBase(){
  if(overrideBase){
    const viteProbe=await looksLikeVite(overrideBase);
    return {chosen:overrideBase,probes:{[overrideBase]:viteProbe}};
  }

  const lanIp=getLanIp();
  const hosts=["127.0.0.1","localhost"];
  if(lanIp){hosts.push(lanIp);}

  const candidates=[];
  for(const port of PORTS){
    for(const host of hosts){
      candidates.push(`http://${host}:${port}`);
    }
  }

  const probes={};
  for(const base of candidates){
    probes[base]=await looksLikeVite(base);
    if(probes[base].ok){
      return {chosen:base,probes};
    }
  }
  return {chosen:candidates[0]||`http://127.0.0.1:5173`,probes};
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

  const readiness=await waitForProxy(chosen);
  if(!readiness.ready){
    return fail({
      chosenBase:chosen,
      baseProbes:probes,
      readiness,
      message:"Proxy not ready (timeouts). Ensure Vite + emulators are running."
    });
  }

  const aiSessionPayload={mode:"telemetry",event:{}};
  const globalSearchPayload={query:"test",domain:"",limit:1};

  const ai=await postJsonRetry(`${chosen}/api/aiSession`,aiSessionPayload,3);
  const search=await postJsonRetry(`${chosen}/api/globalResourceSearch`,globalSearchPayload,3);

  const report={
    chosenBase:chosen,
    baseProbes:probes,
    readiness,
    projectId:PROJECT_ID,
    region:REGION,
    ports:PORTS,
    breathingExists:fs.existsSync("src/features/breathing/LuxuryBreathingShell.jsx"),
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
