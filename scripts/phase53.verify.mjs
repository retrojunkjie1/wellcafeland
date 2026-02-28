#!/usr/bin/env node
import fs from "fs";
import os from "os";

const VITE_PORT=process.env.VITE_PORT||"5173";
const PROJECT_ID=process.env.FIREBASE_PROJECT_ID||process.env.GCLOUD_PROJECT||"wellnesscafelanding";
const REGION=process.env.FUNCTIONS_REGION||"us-central1";

const functionsBase=`http://127.0.0.1:5001/${PROJECT_ID}/${REGION}`;
const authToken=process.env.PHASE53_AUTH_TOKEN||"";
const overrideBase=process.env.PHASE53_BASE_URL||"";

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

async function tryGet(url){
  try{
    const r=await fetch(url,{method:"GET"});
    return r.status;
  }catch{
    return "ERR";
  }
}

async function postJson(url,body){
  try{
    const headers={"Content-Type":"application/json"};
    if(authToken){
      headers.Authorization=`Bearer ${authToken}`;
    }
    const r=await fetch(url,{
      method:"POST",
      headers,
      body:JSON.stringify(body)
    });
    return r.status;
  }catch{
    return "ERR";
  }
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

async function resolveBase(){
  if(overrideBase){
    return overrideBase.replace(/\/$/,"");
  }

  const lanIp=getLanIp();
  const candidates=[
    `http://127.0.0.1:${VITE_PORT}`,
    `http://localhost:${VITE_PORT}`
  ];

  if(lanIp){
    candidates.push(`http://${lanIp}:${VITE_PORT}`);
  }

  for(const base of candidates){
    const s=await tryGet(`${base}/`);
    if(s!=="ERR"){
      return base;
    }
  }

  return `http://127.0.0.1:${VITE_PORT}`;
}

async function run(){
  const base=await resolveBase();

  const aiSessionPayload={mode:"telemetry",event:{}};
  const globalSearchPayload={query:"test",domain:"",limit:1};

  const proxyAi=await postJson(`${base}/api/aiSession`,aiSessionPayload);
  const proxySearch=await postJson(`${base}/api/globalResourceSearch`,globalSearchPayload);

  const report={
    chosenBase:base,
    projectId:PROJECT_ID,
    region:REGION,
    vitePort:VITE_PORT,
    breathingExists:fs.existsSync("src/features/breathing/LuxuryBreathing.jsx"),
    direct:{
      aiSession:await tryGet(`${functionsBase}/aiSession`),
      globalResourceSearch:await tryGet(`${functionsBase}/globalResourceSearch`)
    },
    proxy:{
      aiSession:proxyAi,
      globalResourceSearch:proxySearch
    }
  };

  const hardBad=[report.proxy.aiSession,report.proxy.globalResourceSearch].some((s)=>(s===404 || s==="ERR"));
  if(hardBad){
    return fail(report);
  }

  const ok=
    report.breathingExists===true &&
    report.proxy.globalResourceSearch===200 &&
    (report.proxy.aiSession===200 || report.proxy.aiSession===401);

  if(!ok){
    return fail(report);
  }

  print(report);
  console.log("PASS");
}

run().catch((e)=>{console.error(e);process.exit(1);});
