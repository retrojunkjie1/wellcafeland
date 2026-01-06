// functions/corsHelper.js
// CORS helper for legacy onRequest functions

/**
 * Set CORS headers for authenticated browser requests
 * @param {import('express').Response} res - Express response object
 */
function setCorsHeaders(res) {
  res.set("Access-Control-Allow-Origin", "*"); // Allow all origins (adjust for production if needed)
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
    setCorsHeaders(res);
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
    setCorsHeaders(res);

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
  handleCorsPreflight,
  withCors,
};

