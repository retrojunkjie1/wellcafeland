const admin = require("firebase-admin");

if (!admin.apps.length) admin.initializeApp();

async function verifyHttpAppCheck(req, res, dependencies = {}) {
  if (process.env.FUNCTIONS_EMULATOR === "true") return true;

  const token = req?.headers?.["x-firebase-appcheck"]
    || req?.get?.("X-Firebase-AppCheck")
    || "";
  if (!token) {
    res.status(401).json({ ok: false, code: "APP_CHECK_REQUIRED", error: "App verification is required." });
    return false;
  }

  try {
    const verifyToken = dependencies.verifyToken
      || ((value) => admin.appCheck().verifyToken(value));
    await verifyToken(token);
    return true;
  } catch {
    res.status(401).json({ ok: false, code: "APP_CHECK_INVALID", error: "App verification could not be confirmed." });
    return false;
  }
}

module.exports = { verifyHttpAppCheck };
