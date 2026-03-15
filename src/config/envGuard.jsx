// src/config/envGuard.js
// Environment variable validation guard for production deployments

import React from "react";

const REQUIRED_PROJECT_ID = "wellnesscafelanding";

const REQUIRED_ENV_VARS = [
  "VITE_FIREBASE_API_KEY",
  "VITE_FIREBASE_AUTH_DOMAIN",
  "VITE_FIREBASE_PROJECT_ID",
  "VITE_FIREBASE_STORAGE_BUCKET",
  "VITE_FIREBASE_MESSAGING_SENDER_ID",
  "VITE_FIREBASE_APP_ID",
  "VITE_FIREBASE_FUNCTIONS_URL", // Required for Cloud Functions calls
];

export function validateEnv() {
  const isProduction = import.meta.env.PROD;
  const isDev = import.meta.env.DEV;
  const errors = [];
  const warnings = [];

  // Check required env vars exist
  for (const varName of REQUIRED_ENV_VARS) {
    const value = import.meta.env[varName];
    if (!value || value.trim() === "") {
      errors.push(`Missing required environment variable: ${varName}`);
    }
  }

  // Check project ID matches expected
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
  if (projectId && projectId !== REQUIRED_PROJECT_ID) {
    if (isProduction) {
      errors.push(
        `Invalid Firebase project ID: "${projectId}". Expected: "${REQUIRED_PROJECT_ID}". ` +
        `Deployment is misconfigured and will connect to the wrong Firebase project.`
      );
    } else {
      warnings.push(
        `[DEV] Firebase project ID mismatch: "${projectId}" (expected: "${REQUIRED_PROJECT_ID}")`
      );
    }
  }

  // In production, block on errors
  if (isProduction && errors.length > 0) {
    return {
      valid: false,
      errors,
      warnings,
      blocking: true,
    };
  }

  // In dev, warn but don't block
  if (isDev && (errors.length > 0 || warnings.length > 0)) {
    console.warn("[envGuard] Environment validation issues:", {
      errors,
      warnings,
    });
    return {
      valid: errors.length === 0,
      errors,
      warnings,
      blocking: false,
    };
  }

  return {
    valid: true,
    errors: [],
    warnings: [],
    blocking: false,
  };
}

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

