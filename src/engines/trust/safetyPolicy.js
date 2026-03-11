export const assessRisk = ({text,telemetry}) => {
  const t=(text||"").toLowerCase();
  const hits=[];
  const crisisTerms=["suicide","kill myself","end my life","hurt myself","self harm","self-harm","overdose","i want to die"];
  const crisis=crisisTerms.some((k)=>(t.includes(k)));
  if(crisis) hits.push("crisis screening");

  // light heuristic
  const panicTerms=["panic","can't breathe","heart racing","freaking out","overwhelmed","dissociate","dissociation"];
  const medium=panicTerms.some((k)=>(t.includes(k)));

  const risk=crisis ? "high" : (medium ? "medium" : "low");

  const checks=[
    "intent understanding",
    "scope limits",
    ...(crisis ? ["crisis routing"] : []),
    ...(medium ? ["nervous system activation check"] : [])
  ];

  return {risk,crisis,checks};
};
