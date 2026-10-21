const REQUIRED_PROJECT_ID = "wellnesscafelanding";

const REQUIRED_ENV_VARS = [
  "VITE_FIREBASE_API_KEY",
  "VITE_FIREBASE_AUTH_DOMAIN",
  "VITE_FIREBASE_PROJECT_ID",
  "VITE_FIREBASE_STORAGE_BUCKET",
  "VITE_FIREBASE_MESSAGING_SENDER_ID",
  "VITE_FIREBASE_APP_ID",
  "VITE_FIREBASE_FUNCTIONS_URL",
];

export function validateEnv() {
  const isProduction = import.meta.env.PROD;
  const isDev = import.meta.env.DEV;
  const errors = [];
  const warnings = [];
  for (const varName of REQUIRED_ENV_VARS) {
    const value = import.meta.env[varName];
    if (!value || value.trim() === "") errors.push(`Missing required environment variable: ${varName}`);
  }

  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
  if (projectId && projectId !== REQUIRED_PROJECT_ID) {
    if (isProduction) {
      errors.push(`Invalid Firebase project ID: "${projectId}". Expected: "${REQUIRED_PROJECT_ID}". Deployment is misconfigured and will connect to the wrong Firebase project.`);
    } else {
      warnings.push(`[DEV] Firebase project ID mismatch: "${projectId}" (expected: "${REQUIRED_PROJECT_ID}")`);
    }
  }

  if (isProduction && errors.length > 0) return { valid: false, errors, warnings, blocking: true };
  if (isDev && (errors.length > 0 || warnings.length > 0)) {
    console.warn("[envGuard] Environment validation issues:", { errors, warnings });
    return { valid: errors.length === 0, errors, warnings, blocking: false };
  }
  return { valid: true, errors: [], warnings: [], blocking: false };
}
