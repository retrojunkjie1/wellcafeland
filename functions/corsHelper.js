// functions/corsHelper.js
// CORS helper for onRequest functions
//
// Env: ALLOWED_ORIGINS — comma-separated origins (e.g. https://wellnesscafe.net,https://wellnesscafelanding.web.app)
// In dev/emulator, localhost origins used by Vite are always allowed.
// If unset in production, no origins are allowed (CORS will block).

const VITE_LOCALHOST_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5180",
  "http://localhost:5182",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  "http://127.0.0.1:5180",
  "http://127.0.0.1:5182",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

function getAllowedOrigins() {
  const fromEnv = (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);
  const isEmulator = process.env.FUNCTIONS_EMULATOR === "true" || !process.env.GCLOUD_PROJECT;
  return isEmulator ? [...new Set([...VITE_LOCALHOST_ORIGINS, ...fromEnv])] : fromEnv;
}

function getCorsOrigin(req) {
  const origin = req.headers?.origin;
  if (!origin) return null;
  const allowed = getAllowedOrigins();
  return allowed.includes(origin) ? origin : null;
}

/**
 * Set CORS headers. Access-Control-Allow-Origin is set only when request origin is in allowlist.
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 */
function setCorsHeaders(req, res) {
  const allowedOrigin = getCorsOrigin(req);
  if (allowedOrigin) res.set("Access-Control-Allow-Origin", allowedOrigin);
  res.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.set("Access-Control-Max-Age", "3600");
}

/**
 * Handle CORS preflight requests
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {boolean} - true if request was handled, false otherwise
 */
function handleCorsPreflight(req, res) {
  if (req.method === "OPTIONS") {
    setCorsHeaders(req, res);
    res.status(204).send("");
    return true;
  }
  return false;
}

/**
 * Wrap an onRequest handler with CORS support
 * @param {Function} handler - The request handler function
 * @returns {Function} - Wrapped handler with CORS support
 */
function withCors(handler) {
  return async (req, res) => {
    // Handle preflight
    if (handleCorsPreflight(req, res)) {
      return;
    }

    // Set CORS headers for actual request
    setCorsHeaders(req, res);

    // Call the original handler
    try {
      await handler(req, res);
    } catch (error) {
      console.error("[CORS Helper] Handler error:", error);
      if (!res.headersSent) {
        res.status(500).json({
          error: "Internal server error",
          message: error.message,
        });
      }
    }
  };
}

module.exports = {
  setCorsHeaders,
  getCorsOrigin,
  getAllowedOrigins,
  handleCorsPreflight,
  withCors,
};

