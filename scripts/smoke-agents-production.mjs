#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const PRODUCTION_ENDPOINT = "https://wellnesscafe.app/api/aiSession";
const PREFIX = "WELLNESSCAFE_SMOKE_";

const cases = [
  { agent: "overseer", role: "admin", payload: { goal: "agent-health", state: { snapshotAgeSeconds: 30, agentExecutions: 25, errorRatePercent: 0, avgResponseTimeMs: 400, enabledHandlers: 25, implementedHandlers: 25, riskSignals: { state: "available", warningCount: 0, criticalCount: 0, totalEvents: 0 }, reviewQueues: { practitioner: 0, communityGivers: 0, meetingSources: 0 } } }, fields: ["summary", "steps", "evidenceLimit"], arrays: { steps: 1 } },
  { agent: "sentinel", role: "client", payload: { supportNeed: "unsure" }, fields: ["summary", "invitation", "nextStep", "route"] },
  { agent: "seer", role: "admin", payload: { telemetry: { snapshotAgeSeconds: 30, agentExecutions: 25, errorRatePercent: 0, avgResponseTimeMs: 400, activeUsers24h: 1, checkinsLast7Days: 1, riskSignals: { state: "available", warningCount: 0, criticalCount: 0, totalEvents: 0, dailyCounts: [] } } }, fields: ["summary", "insights", "nextCheck"], arrays: { insights: 0 } },
  { agent: "oracle", role: "client", payload: { question: "Offer one gentle, optional next step for a busy day." }, fields: ["summary", "wisdom"] },
  { agent: "cherubim", role: "client", payload: { content: "I would like to ask my peer group for support." }, fields: ["safe", "category"] },
  { agent: "healer_spiritual", role: "client", payload: { concern: "shame" }, fields: ["summary", "phrases"], arrays: { phrases: 4 } },
  { agent: "towncrier", role: "admin", payload: { updateType: "maintenance", audience: "clients" }, fields: ["title", "message", "reviewNote"] },
  { agent: "scribe", role: "client", payload: { question: "Offer a gentle optional prompt about noticing one thing I handled today." }, fields: ["summary", "prompt"] },
  { agent: "cartographer", role: "client", payload: { situations: ["uncertainty"], helps: ["one_step"], avoid: [] }, fields: ["overview", "helpfulSupports"], arrays: { helpfulSupports: 1 } },
  { agent: "bridge", role: "client", payload: { category: "programs", contactMethod: "website" }, fields: ["summary", "openingLine", "questions", "nextStep"], arrays: { questions: 0 } },
  { agent: "mirror", role: "client", payload: { content: "Synthetic smoke check: today felt busy, and I chose to pause before replying." }, fields: ["summary", "reflection", "question"] },
  { agent: "anchor", role: "client", payload: { question: "Offer one optional grounding cue for a busy moment." }, fields: ["summary", "invitation", "nextStep"] },
  { agent: "breathkeeper", role: "client", payload: { question: "Offer an optional cue before a breathing practice, with natural breathing as an option." }, fields: ["summary", "invitation", "nextStep"] },
  { agent: "shepherd", role: "client", payload: { preference: "browse_first" }, fields: ["summary", "invitation", "nextStep"] },
  { agent: "gatekeeper", role: "practitioner", payload: { pathway: "primary-care" }, fields: ["openingQuestion", "nextStep", "preferenceCheck"] },
  { agent: "rhythm", role: "client", payload: { question: "Suggest one optional, very small reset that takes about one minute." }, fields: ["summary", "invitation", "nextStep"] },
  { agent: "lantern", role: "client", payload: { question: "Explain in plain language why a pause can help someone choose their next step." }, fields: ["summary", "takeaway", "nextStep"] },
  { agent: "witness", role: "practitioner", payload: {}, fields: ["available"] , requiresWitnessData: true },
  { agent: "pulse", role: "admin", payload: { metrics: { systemHealth: "healthy", agentExecutions: 25, errorRate: 0, avgResponseTime: 400 }, snapshotAgeSeconds: 30 }, fields: ["summary", "healthStatus", "nextCheck"] },
  { agent: "steward", role: "client", payload: { topicId: "sharing" }, fields: ["answer"] },
  { agent: "compass", role: "client", payload: { values: ["Rest"], selectedMove: "hands-busy" }, fields: ["summary", "value", "choice", "nextStep"] },
  { agent: "gardener", role: "client", payload: { question: "Reflect on this synthetic moment: I chose to pause before replying." }, fields: ["summary", "win", "reinforcement", "nextStep"] },
  { agent: "translator", role: "client", payload: { topicId: "cravings-and-urges", language: "es" }, fields: ["translation"] },
  { agent: "hearth", role: "client", payload: { choice: "quiet-company" }, fields: ["summary", "invitation", "nextStep"] },
  { agent: "lighthouse", role: "client", payload: { cue: "urge-building" }, fields: ["reflection", "option", "supportStep"] },
];

const requirements = [
  "CLIENT_ID_TOKEN", "CLIENT_UID", "CLIENT_EMAIL", "ADMIN_ID_TOKEN", "ADMIN_UID", "ADMIN_EMAIL",
  "PRACTITIONER_ID_TOKEN", "PRACTITIONER_UID", "PRACTITIONER_EMAIL", "APPCHECK_TOKEN",
];

function loadExplicitEnvFile(args) {
  // Avoid Node's built-in --env-file flag, which is parsed before this script runs.
  const arg = args.find((item) => item.startsWith("--smoke-env-file="));
  if (!arg) return;
  const requested = arg.slice("--smoke-env-file=".length);
  if (path.basename(requested) !== ".env.production.smoke" || path.resolve(requested) !== path.join(process.cwd(), ".env.production.smoke")) {
    throw new Error("Only the workspace-root .env.production.smoke file may be loaded.");
  }
  if (!fs.existsSync(requested)) return;
  for (const line of fs.readFileSync(requested, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (!match || match[1] in process.env) continue;
    const value = match[2].replace(/^(?:(["'])(.*)\1)$/, "$2");
    process.env[match[1]] = value;
  }
}

function decodeClaims(token) {
  try {
    const segment = token.split(".")[1];
    const claims = JSON.parse(Buffer.from(segment, "base64url").toString("utf8"));
    if (typeof claims.exp !== "number" || claims.exp <= Math.floor(Date.now() / 1000)) return null;
    return { uid: claims.user_id || claims.sub || null, email: claims.email || null };
  } catch {
    return null;
  }
}

function requiredValue(name) {
  const value = process.env[`${PREFIX}${name}`]?.trim();
  return value || null;
}

function validateConfiguration(args) {
  const missing = requirements.filter((name) => !requiredValue(name));
  if (missing.length) return { error: `Missing values: ${missing.map((name) => `${PREFIX}${name}`).join(", ")}` };
  const roles = ["CLIENT", "ADMIN", "PRACTITIONER"];
  for (const role of roles) {
    const token = requiredValue(`${role}_ID_TOKEN`);
    const expectedUid = requiredValue(`${role}_UID`);
    const expectedEmail = requiredValue(`${role}_EMAIL`);
    const claims = decodeClaims(token);
    if (claims?.uid !== expectedUid || claims?.email?.toLowerCase() !== expectedEmail.toLowerCase()) {
      return { error: `${PREFIX}${role}_ID_TOKEN is expired or does not match the configured UID/email.` };
    }
    if (!expectedEmail.toLowerCase().includes("+wc-smoke@")) {
      return { error: `${PREFIX}${role}_EMAIL must be a dedicated test account email containing +wc-smoke@.` };
    }
  }
  const roleUids = roles.map((role) => requiredValue(`${role}_UID`));
  if (new Set(roleUids).size !== roleUids.length) return { error: "Client, admin, and practitioner test identities must be three distinct accounts." };
  if (args.includes("--confirm-live-smoke") !== true) {
    return { error: "No requests were sent. Re-run with --confirm-live-smoke to authorize 25 live requests, model charges, and operational telemetry writes." };
  }
  return { ok: true };
}

function reportConfigurationError(message) {
  console.error(`Production smoke stopped before networking. ${message}`);
  process.exitCode = 2;
}

loadExplicitEnvFile(process.argv.slice(2));
const configuration = validateConfiguration(process.argv.slice(2));
if (!configuration.ok) {
  reportConfigurationError(configuration.error);
} else {
  const results = [];
  for (const testCase of cases) {
    const role = testCase.role.toUpperCase();
    const payload = {
      mode: "agent",
      agent: testCase.agent,
      ...testCase.payload,
      ...(testCase.requiresWitnessData ? { clientId: requiredValue("CLIENT_UID") } : {}),
    };
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${requiredValue(`${role}_ID_TOKEN`)}`,
      "X-Firebase-AppCheck": requiredValue("APPCHECK_TOKEN"),
    };
    const startedAt = Date.now();
    try {
      const response = await fetch(PRODUCTION_ENDPOINT, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
        cache: "no-store",
        signal: AbortSignal.timeout(35_000),
      });
      const data = await response.json().catch(() => null);
      const result = data?.result;
      const shapeOk = response.ok
        && data?.success === true
        && result && typeof result === "object"
        && testCase.fields.every((field) => Object.hasOwn(result, field)
          && (typeof result[field] !== "string" || result[field].trim().length > 0)
          && (!testCase.arrays?.[field] && testCase.arrays?.[field] !== 0
            || (Array.isArray(result[field])
              && result[field].length >= testCase.arrays[field]
              && result[field].every((item) => typeof item === "string" && item.trim().length > 0))))
        && (!testCase.requiresWitnessData || result.available === true);
      results.push({ agent: testCase.agent, ok: !!shapeOk, status: response.status, durationMs: Date.now() - startedAt, code: data?.error?.code || data?.code || null });
      console.log(`${shapeOk ? "PASS" : "FAIL"} ${testCase.agent} (${response.status}, ${Date.now() - startedAt}ms)${!shapeOk && (data?.error?.code || data?.code) ? ` code=${data.error?.code || data.code}` : ""}`);
      if ([401, 403].includes(response.status)) {
        console.error("Shared auth, App Check, or role authorization failed. Stopping to avoid repeated rejected production requests.");
        break;
      }
      if (response.status === 429) {
        console.error("Production quota/rate limit reached. Stopping; do not retry until the Retry-After window has elapsed.");
        break;
      }
    } catch (error) {
      results.push({ agent: testCase.agent, ok: false, status: null, durationMs: Date.now() - startedAt, code: error?.name === "TimeoutError" ? "TIMEOUT" : "NETWORK_ERROR" });
      console.log(`FAIL ${testCase.agent} (${error?.name === "TimeoutError" ? "timeout" : "network error"})`);
      break;
    }
  }
  const passed = results.filter((result) => result.ok).length;
  console.log(`\nProduction smoke: ${passed}/${cases.length} workflows passed; ${cases.length - results.length} not run.`);
  console.log("Response content, tokens, account IDs, and prompt data were not printed or saved.");
  if (passed !== cases.length) process.exitCode = 1;
}
