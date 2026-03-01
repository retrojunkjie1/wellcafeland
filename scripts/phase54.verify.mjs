import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const sleep=(ms)=>new Promise((r)=>setTimeout(r,ms));

const withTimeout=async (ms,fn) => {
  const ac=new AbortController();
  const t=setTimeout(()=>ac.abort(),ms);
  try{
    return await fn(ac.signal);
  }finally{
    clearTimeout(t);
  }
};

const fetchGet=async (url,ms=4000) => {
  try{
    const res=await withTimeout(ms,(signal)=>fetch(url,{method:"GET",signal,headers:{"accept":"text/html,*/*"}}));
    return {ok:true,status:res.status};
  }catch(e){
    return {ok:false,status:"ERR",error:{name:e?.name||"Error",message:e?.message||String(e)}};
  }
};

const parsePorts=() => {
  const raw=process.env.VITE_PORT||"5173,5174,5175,4173,3000";
  return raw.split(",").map((s)=>String(s).trim()).filter(Boolean);
};

const probeBase=async (base) => {
  const root=await fetchGet(`${base}/`,2500);
  const client=await fetchGet(`${base}/@vite/client`,2500);
  return {ok:root.ok&&root.status===200&&client.ok&&client.status===200,root,client};
};

const resolveBase=async () => {
  const forced=process.env.PHASE54_BASE_URL||process.env.PHASE53_BASE_URL;
  if(forced){
    const p=await probeBase(forced);
    return {chosenBase:forced,baseProbes:{[forced]:{ok:p.ok,root:{status:p.root.status||"ERR"},client:{status:p.client.status||"ERR"}}}};
  }
  const  orts=parsePorts();
  const ports=parsePorts();
  const ports=parsePorts();
  const baseProbes={};
  for(const port of ports){
    const base=`http://127.0.0.1:${port}`;
    const p=await probeBase(base);
    baseProbes[base]={ok:p.ok,root:{status:p.root.status||"ERR"},client:{status:p.client.status||"ERR"}};
    if(p.ok){
      return {chosenBase:base,baseProbes,ports};
    }
    await sleep(120);
  }
  return {chosenBase:null,baseProbes,ports};
};

const readIndex=() => {
  const p=path.resolve(process.cwd(),"index.html");
  if(!fs.existsSync(p)){
    return {ok:false,error:"index.html missing"};
  }
  const html=fs.readFileSync(p,"utf8");
  const hasApp=html.includes('data-wc-app="1"')||html.includes("data-wc-app='1'");
  const hasEntry=html.includes('data-wc-entry="1"')||html.includes("data-wc-entry='1'");
  return {ok:true,hasApp,hasEntry};
};

const main=async () => {
  const {chosenBase,baseProbes,ports}=await resolveBase();
  const index=readIndex();

  const report={
    chosenBase:chosenBase||"NONE",
    baseProbes,
    ports,
    index,
    routes:{}
  };

  let pass=true;

  if(!chosenBase){
    pass=false;
  }

  if(!index.ok || !index.hasApp){
    pass=false;
  }
  // Phase54 requires entry marker in index.html (added when Phase54A lands)
  if(!index.ok || !index.hasEntry){
    pass=false;
  }

  if(chosenBase){
    const routes=["/","/chat","/tools","/home"];
    for(const r of routes){
      const res=await fetchGet(`${chosenBase}${r}`,4000);
      report.routes[r]=res.ok?{status:res.status}:{status:"ERR",error:res.error};
      if(!res.ok||res.status!==200){
        pass=false;
      }
    }
  }

  console.log("PHASE54_VERIFY");
  console.log(JSON.stringify(report,null,2));
  console.log(pass?"PASS":"FAIL");
  process.exit(pass?0:1);
};

main();
