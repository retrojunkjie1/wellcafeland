import { normalizeRequestedRole, roleToDisclaimers } from "./rolePolicy.js";
import { assessRisk } from "./safetyPolicy.js";

const inferDepth = (text) => {
  const t=(text||"").toLowerCase();
  if(t.includes("two lines")||t.includes("2 lines")||t.includes("short")||t.includes("quick")) return "brief";
  if(t.includes("analyze deeply")||t.includes("deep analysis")||t.includes("detailed")||t.includes("in depth")||t.includes("in-depth")) return "deep";
  return "standard";
};

export const planResponse = async ({userText,telemetry,requestedDepth,requestedRole}) => {
  const start=performance.now();
  const role=(requestedRole && requestedRole!=="default") ? requestedRole : normalizeRequestedRole(userText);
  const depth=requestedDepth || inferDepth(userText);
  const safety=assessRisk({text:userText,telemetry});

  const disclaimers=[
    ...roleToDisclaimers(role),
    ...(safety.crisis ? ["If you might hurt yourself or someone else, call your local emergency number now. In the U.S., you can call or text 988."] : [])
  ].filter(Boolean);

  const summary=[
    "Clarify what you need and what outcome matters right now",
    "Check urgency and emotional risk before responding",
    "Choose the smallest effective next step",
    "Offer one clear action and one optional deeper path"
  ];

  const latencyMs=Math.round(performance.now()-start);

  return {
    reply:{id:"pending",text:"",mode:"chat"},
    reasoning:{
      role,
      depth,
      safety:{risk:safety.risk,crisis:safety.crisis,disclaimers},
      checks:safety.checks,
      summary,
      confidence:3,
      latencyMs
    }
  };
};
