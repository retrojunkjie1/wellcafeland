import React,{useState,useEffect} from "react";

export default function LuxuryBreathing(){
  const [phase,setPhase]=useState("inhale");

  useEffect(()=>{
    const id=setInterval(()=>{
      setPhase((p)=>(p==="inhale"?"exhale":"inhale"));
    },4000);
    return ()=>clearInterval(id);
  },[]);

  return (
    <div className="flex items-center justify-center py-12">
      <div className={`relative flex items-center justify-center rounded-full transition-all duration-[4000ms] ease-in-out
        ${phase==="inhale"?"scale-110":"scale-90"}
        w-48 h-48 bg-gradient-to-br from-teal-400/20 to-blue-500/20 border border-white/10 backdrop-blur-xl`}>
        <span className="text-sm text-slate-200">
          {phase==="inhale"?"Breathe in slowly":"Release gently"}
        </span>
      </div>
    </div>
  );
}
