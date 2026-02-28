#!/usr/bin/env node
import fs from "fs";

const VITE_PORT=process.env.VITE_PORT||"5173";
const PROJECT_ID=process.env.FIREBASE_PROJECT_ID||process.env.GCLOUD_PROJECT||"wellnesscafelanding";
const REGION=process.env.FUNCTIONS_REGION||"us-central1";

const functionsBase=`http://127.0.0.1:5001/${PROJECT_ID}/${REGION}`;
const viteBase=`http://127.0.0.1:${VITE_PORT}`;

const authToken=process.env.PHASE53_AUTH_TOKEN||"";

async function checkGet(url){
  try{
    const r=await fetch(url);
    return r.status;
  }catch{
    return "ERR";
  }
}

async function checkPost(url,body){
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

async function run(){
  // Matches frontend: ChatPanel callAI("aiSession",{...}) + aiSessionClient. mode "telemetry" = no-op ping, returns 200.
  const aiSessionPayload={
    mode:"telemetry",
    event:{}
  };

  // Matches frontend: directorySearch sends {query,domain,region,category,limit,pageToken}. query required (min 3 chars).
  const globalSearchPayload={
    query:"test",
    domain:"",
    limit:1
  };

  const report={
    projectId:PROJECT_ID,
    region:REGION,
    vitePort:VITE_PORT,
    breathingExists:fs.existsSync("src/features/breathing/LuxuryBreathing.jsx"),
    direct:{
      aiSession:await checkGet(`${functionsBase}/aiSession`),
      globalResourceSearch:await checkGet(`${functionsBase}/globalResourceSearch`)
    },
    proxy:{
      aiSession:await checkPost(`${viteBase}/api/aiSession`,aiSessionPayload),
      globalResourceSearch:await checkPost(`${viteBase}/api/globalResourceSearch`,globalSearchPayload)
    }
  };

  const requiredOk=
    report.breathingExists===true &&
    report.proxy.aiSession===200 &&
    report.proxy.globalResourceSearch===200;

  if(!requiredOk){
    return fail(report);
  }

  print(report);
  console.log("PASS");
}

run().catch((e)=>{console.error(e);process.exit(1);});
