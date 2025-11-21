// src/hooks/useDynamicThemeEngine.js

import {useEffect,useState,useCallback} from "react";
import {doc,onSnapshot} from "firebase/firestore";
import {db} from "../firebase";

const THEME_DOC_PATH={collection:"themeControl",docId:"global"};

const THEME_KEY="wc_theme_v1";

const THEME_CLASSES=[
  "theme-light",
  "theme-dark",
  "theme-obsidian",
  "theme-ceremony",
  "theme-healing",
];

const normalizeTheme=(value)=>{
  const allowed=["light","dark","obsidian","ceremony","healing"];
  if(!value||!allowed.includes(value)){return "dark";}
  return value;
};

const applyThemeToDom=(theme)=>{
  if(typeof document==="undefined"){return;}
  const root=document.documentElement;
  THEME_CLASSES.forEach((cls)=>{
    root.classList.remove(cls);
  });
  const activeClass=`theme-${theme}`;
  root.classList.add(activeClass);
  root.setAttribute("data-theme",theme);
};

export const useDynamicThemeEngine=()=>{
  const [userTheme,setUserTheme]=useState("dark");
  const [adminMode,setAdminMode]=useState(null); // {mode,override}
  const [effectiveTheme,setEffectiveTheme]=useState("dark");
  const [adminActive,setAdminActive]=useState(false);

  // load from localStorage once
  useEffect(()=>{
    if(typeof window==="undefined"){return;}
    try{
      const stored=window.localStorage.getItem(THEME_KEY);
      if(stored){
        const parsed=normalizeTheme(stored);
        setUserTheme(parsed);
        setEffectiveTheme(parsed);
        applyThemeToDom(parsed);
      }else{
        setUserTheme("dark");
        setEffectiveTheme("dark");
        applyThemeToDom("dark");
      }
    }catch{
      setUserTheme("dark");
      setEffectiveTheme("dark");
      applyThemeToDom("dark");
    }
  },[]);

  // listen for admin override in Firestore
  useEffect(()=>{
    // Only connect to Firebase if db is available
    if(!db){
      console.warn("Firebase not initialized - theme override disabled");
      return;
    }
    const ref=doc(db,THEME_DOC_PATH.collection,THEME_DOC_PATH.docId);
    const unsub=onSnapshot(ref,(snap)=>{
      if(!snap.exists()){
        setAdminMode(null);
        setAdminActive(false);
        setEffectiveTheme((prev)=>normalizeTheme(prev));
        applyThemeToDom(effectiveTheme||"dark");
        return;
      }
      const data=snap.data();
      const override=!!data.override;
      const mode=normalizeTheme(data.mode);
      const payload={mode,override};
      setAdminMode(payload);
      setAdminActive(override);
      if(override){
        setEffectiveTheme(mode);
        applyThemeToDom(mode);
      }else{
        setEffectiveTheme((prev)=>{
          const next=normalizeTheme(userTheme||prev);
          applyThemeToDom(next);
          return next;
        });
      }
    },(error)=>{
      console.error("Theme override listener error",error);
    });
    return ()=>unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[userTheme]);

  // recompute effective theme when user changes theme and no admin override
  useEffect(()=>{
    if(adminActive){return;}
    const next=normalizeTheme(userTheme);
    setEffectiveTheme(next);
    applyThemeToDom(next);
  },[userTheme,adminActive]);

  const updateUserTheme=useCallback((nextTheme)=>{
    const normalized=normalizeTheme(nextTheme);
    setUserTheme(normalized);
    if(typeof window!=="undefined"){
      try{
        window.localStorage.setItem(THEME_KEY,normalized);
      }catch{
        // localStorage may be unavailable in some contexts
      }
    }
    if(!adminActive){
      setEffectiveTheme(normalized);
      applyThemeToDom(normalized);
    }
  },[adminActive]);

  return{
    theme:effectiveTheme,
    userTheme,
    adminMode,
    adminActive,
    setUserTheme:updateUserTheme,
    availableThemes:["light","dark","obsidian","ceremony","healing"],
  };
};

