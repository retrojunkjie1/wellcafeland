import React,{useState,useEffect,useRef} from "react";

const INHALE_MS = 4000;
const EXHALE_MS = 6000;

export default function LuxuryBreathing(){
  const [phase,setPhase]=useState("inhale");
  const timeoutRef=useRef(null);

  useEffect(()=>{
    const run=()=>{
      const ms=phase==="inhale"?INHALE_MS:EXHALE_MS;
      timeoutRef.current=setTimeout(()=>{
        setPhase((p)=>(p==="inhale"?"exhale":"inhale"));
        run();
      },ms);
    };
    run();
    return ()=>{if(timeoutRef.current)clearTimeout(timeoutRef.current);};
  },[phase]);

  return (
    <div className="wc-breathing">
      <div className={`wc-breath-circle ${phase}`}>
        <span>{phase==="inhale"?"Breathe in slowly":"Release gently"}</span>
      </div>
    </div>
  );
}
