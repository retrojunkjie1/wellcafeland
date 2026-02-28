#!/usr/bin/env node
import fs from "fs";

const VITE_PORT=process.env.VITE_PORT||"5173";
const PROJECT_ID=process.env.FIREBASE_PROJECT_ID||process.env.GCLOUD_PROJECT||"wellnesscafelanding";
const REGION=process.env.FUNCTIONS_REGION||"us-central1";

const functionsBase=`http://127.0.0.1:5001/${PROJECT_ID}/${REGION}`;
const viteBase=`http://127.0.0.1:${VITE_PORT}`;

async function check(url){
  try{
    const r=await fetch(url,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({})});
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
  const report={
    projectId:PROJECT_ID,
    region:REGION,
    vitePort:VITE_PORT,
    breathingExists:fs.existsSync("src/features/breathing/LuxuryBreathing.jsx"),
    direct:{
      aiSession:await check(`${functionsBase}/aiSession`),
      globalResourceSearch:await check(`${functionsBase}/globalResourceSearch`)
    },
    proxy:{
      aiSession:await check(`${viteBase}/api/aiSession`),
      globalResourceSearch:await check(`${viteBase}/api/globalResourceSearch`)
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
