// src/admin/ThemeControlPanel.jsx

import React,{useState} from "react";
import {doc,setDoc,serverTimestamp} from "firebase/firestore";
import {db} from "../firebase";
import {useDynamicThemeEngine} from "../hooks/useDynamicThemeEngine";

const ThemeControlPanel=()=>{
  const {theme,adminActive,adminMode}=useDynamicThemeEngine();
  const [saving,setSaving]=useState(false);
  const [error,setError]=useState("");

  const setGlobalTheme=async(mode,override)=>{
    if(!db){
      setError("Firebase not configured. Add Firebase config to .env to enable theme overrides.");
      return;
    }
    setSaving(true);
    setError("");
    try{
      const ref=doc(db,"themeControl","global");
      await setDoc(ref,{
        mode,
        override,
        updatedAt:serverTimestamp(),
      },{merge:true});
    }catch(e){
      console.error(e);
      setError("Failed to update theme override.");
    }finally{
      setSaving(false);
    }
  };

  const clearOverride=()=>{
    setGlobalTheme(theme||"dark",false);
  };

  const ThemeButton=({mode,label})=>{
    const active=adminActive&&adminMode?.mode===mode;
    return(
      <button
        type="button"
        onClick={async()=>{await setGlobalTheme(mode,true);}}
        className={`px-3 py-2 rounded-xl text-sm md:text-base border text-left ${
          active
            ? "bg-wcgold text-wcdeep border-wcgold"
            : "bg-wcdeep text-wcsand border-wcsand/40 hover:border-wcgold/70"
        } transition-all duration-200`}
      >
        <div className="font-semibold uppercase tracking-wide">{label}</div>
        <div className="text-[11px] md:text-xs opacity-80 mt-1">
          {active?"ACTIVE (broadcast to all users)":"Click to broadcast globally"}
        </div>
      </button>
    );
  };

  return(
    <div className="min-h-screen bg-wcdeep text-wcsand px-4 py-8 md:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <header className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Wellnesscafe Theme Control
          </h1>
          <p className="text-sm md:text-base opacity-80">
            Real-time global theme overrides with admin authority and user-level intelligence.
          </p>
          <div className="text-xs md:text-sm opacity-75">
            Current effective theme: <span className="font-semibold">{theme}</span> · Admin override:{" "}
            <span className="font-semibold">{adminActive?"ON":"OFF"}</span>{" "}
            {adminActive&&adminMode?.mode?`· Mode: ${adminMode.mode}`:null}
          </div>
        </header>
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ThemeButton mode="light" label="Light · Sand & Gold"/>
          <ThemeButton mode="dark" label="Dark · Deep & Gold"/>
          <ThemeButton mode="obsidian" label="Obsidian · Cinematic"/>
          <ThemeButton mode="healing" label="Healing · Calm Palette"/>
          <ThemeButton mode="ceremony" label="Ceremony · Ritual Gold"/>
        </section>
        <section className="space-y-3">
          <button
            type="button"
            onClick={clearOverride}
            className="px-4 py-2 rounded-xl border border-wcsand/40 text-sm md:text-base bg-transparent hover:bg-wcsand hover:text-wcdeep transition-all duration-200"
          >
            Disable Admin Override · Return To User Themes
          </button>
          {saving&&(
            <div className="text-xs md:text-sm opacity-80">
              Saving changes to Firestore…
            </div>
          )}
          {error&&(
            <div className="text-xs md:text-sm text-red-400">
              {error}
            </div>
          )}
        </section>
        <section className="text-[11px] md:text-xs opacity-60 pt-2 border-t border-wcsand/20">
          Changes are synced in real-time via Firestore. When override is ON, all clients display the
          admin-selected mode while still preserving their personal theme preference locally for when override is OFF.
        </section>
      </div>
    </div>
  );
};

export default ThemeControlPanel;

