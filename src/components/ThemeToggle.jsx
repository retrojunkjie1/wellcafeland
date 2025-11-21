// src/components/ThemeToggle.jsx

import React from "react";
import {useDynamicThemeEngine} from "../hooks/useDynamicThemeEngine";

const ThemeToggle=()=>{
  const {theme,userTheme,adminActive,adminMode,setUserTheme,availableThemes}=useDynamicThemeEngine();

  const cycleTheme=()=>{
    const order=["light","dark","obsidian","healing","ceremony"];
    const current=userTheme||"dark";
    const index=order.indexOf(current);
    const next=order[(index+1)%order.length];
    setUserTheme(next);
  };

  const label=adminActive
    ? `Admin: ${adminMode?.mode||"ceremony"}`
    : `Theme: ${theme}`;

  return(
    <button
      type="button"
      onClick={cycleTheme}
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-wcgold/50 bg-wcdeep/70 text-wcsand text-xs md:text-sm shadow-sm hover:bg-wcdeep hover:border-wcgold transition-all duration-200"
      title={adminActive?"Admin override active":`Click to cycle theme (${availableThemes.join(", ")})`}
    >
      <span className="text-base">
        {adminActive?"🛡️":"✨"}
      </span>
      <span className="uppercase tracking-wide">
        {label}
      </span>
    </button>
  );
};

export default ThemeToggle;

