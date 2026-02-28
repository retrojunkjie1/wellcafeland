#!/usr/bin/env node
import fs from "fs";
import os from "os";

const portStr=process.env.VITE_PORT||"5173";
const portsFromEnv=portStr.split(",").map((p)=>p.trim()).filter(Boolean);
const defaultPorts=["5173","5174","5175","4173","3000"];
const PORTS=[...new Set([...portsFromEnv,...defaultPorts])];
const overrideBase=(process.env.PHASE53_BASE_URL||process.env.PHASE53C_BASE_URL||"").replace(/\/$/,"");

const ROUTES=["/","/chat","/tools","/profile","/admin"];
const REQUIRED_FILES=[
  "src/apps/admin/AdminHubPage.jsx",
  "src/components/system/PageHeader.jsx",
  "src/components/system/BackButton.jsx",
  "src/components/system/NotReadyCard.jsx",
];

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

async function getText(url){
  const t=withTimeout(3000);
  try{
    const r=await fetch(url,{method:"GET",signal:t.signal});
    const text=await r.text();
    t.done();
    return {ok:true,status:r.status,text};
  }catch(e){
    t.done();
    return {ok:false,status:"ERR",error:e?.message||String(e)};
  }
}

async function looksLikeVite(base){
  const root=await getText(`${base}/`);
  if(!root.ok || root.status!==200){ return {ok:false,root}; }
  const hasClient=root.text.includes("/@vite/client");
  if(!hasClient){ return {ok:false,root}; }
  return {ok:true,root:{status:root.status}};
}

async function resolveBase(){
  if(overrideBase){
    const probe=await looksLikeVite(overrideBase);
    return {chosen:overrideBase,probes:{[overrideBase]:probe}};
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
  return {chosen:candidates[0]||"http://127.0.0.1:5173",probes};
}

function print(report){
  console.log("PHASE53C_VERIFY");
  console.log(JSON.stringify(report,null,2));
}

function fail(report){
  print(report);
  console.error("FAIL");
  process.exit(1);
}

async function run(){
  const {chosen,probes}=await resolveBase();
  const baseProbe=probes[chosen];
  if(!baseProbe?.ok){
    return fail({chosenBase:chosen,baseProbes:probes,message:"No Vite base found"});
  }

  const routeResults={};
  for(const path of ROUTES){
    const res=await getText(`${chosen}${path}`);
    routeResults[path]=res.status;
  }

  const filesExist={};
  for(const f of REQUIRED_FILES){
    filesExist[f]=fs.existsSync(f);
  }

  const report={
    chosenBase:chosen,
    baseProbes:probes,
    routeResults,
    filesExist,
  };

  const allRoutesOk=ROUTES.every((r)=>routeResults[r]===200);
  const allFilesOk=REQUIRED_FILES.every((f)=>filesExist[f]);

  if(!allRoutesOk || !allFilesOk){
    return fail(report);
  }

  print(report);
  console.log("PASS");
}

run().catch((e)=>{console.error(e);process.exit(1);});
