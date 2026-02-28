#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";

const __dirname=path.dirname(fileURLToPath(import.meta.url));
const root=path.join(__dirname,"..");

async function check(url){
  try{
    const r=await fetch(url,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({})});
    return r.status;
  }catch(e){
    return "ERR";
  }
}

async function run(){
  const ai=await check("http://127.0.0.1:5001/wellnesscafelanding/us-central1/aiSession");
  const search=await check("http://127.0.0.1:5001/wellnesscafelanding/us-central1/globalResourceSearch");

  const appPath=path.join(root,"src","App.jsx");
  const appContent=fs.existsSync(appPath)?fs.readFileSync(appPath,"utf8"):"";
  const routeOk=/path\s*=\s*["']\*["']/.test(appContent)||/<Route\s+path=["']\*["']/.test(appContent);

  const breathingExists=fs.existsSync(path.join(root,"src","features","breathing","LuxuryBreathing.jsx"));

  console.log("PHASE53_VERIFY");
  console.log(JSON.stringify({aiSession:ai,globalSearch:search,routeCatchAll:routeOk,breathingExists},null,2));
  if(!routeOk){console.error("FAIL: No catch-all route");process.exit(1);}
  if(!breathingExists){console.error("FAIL: LuxuryBreathing missing");process.exit(1);}
  console.log("PASS");
}
run().catch((e)=>{console.error(e);process.exit(1);});
