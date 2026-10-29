// Environment misconfiguration screen for production deployments.

import React from "react";

export function EnvErrorScreen({ errors }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        backgroundColor: "#0f172a",
        color: "#f1f5f9",
        padding: "2rem",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "600px",
          backgroundColor: "#1e293b",
          border: "1px solid #334155",
          borderRadius: "0.5rem",
          padding: "2rem",
        }}
      >
        <h1
          style={{
            fontSize: "1.5rem",
            fontWeight: "600",
            marginBottom: "1rem",
            color: "#fbbf24",
          }}
        >
          Deployment Misconfigured
        </h1>
        <p style={{ marginBottom: "1.5rem", color: "#cbd5e1" }}>
          The application cannot start because environment variables are missing or incorrect.
        </p>
        <div
          style={{
            backgroundColor: "#0f172a",
            border: "1px solid #334155",
            borderRadius: "0.25rem",
            padding: "1rem",
            marginBottom: "1.5rem",
          }}
        >
          <h2
            style={{
              fontSize: "1rem",
              fontWeight: "600",
              marginBottom: "0.75rem",
              color: "#f87171",
            }}
          >
            Errors:
          </h2>
          <ul style={{ listStyle: "disc", paddingLeft: "1.5rem", color: "#cbd5e1" }}>
            {errors.map((error, idx) => (
              <li key={idx} style={{ marginBottom: "0.5rem" }}>
                {error}
              </li>
            ))}
          </ul>
        </div>
        <p style={{ fontSize: "0.875rem", color: "#94a3b8" }}>
          Please contact the development team to fix the deployment configuration.
        </p>
      </div>
    </div>
  );
}

