import React from "react";

export default function NotReady({title="Preparing your experience...",subtitle="This space is being carefully prepared."}){
  return (
    <div className="wc-notready">
      <div className="wc-notready-card">
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
    </div>
  );
}
