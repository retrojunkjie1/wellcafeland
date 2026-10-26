import { execFileSync } from "node:child_process";

const baseSha = process.env.PR_BASE_SHA;
const headSha = process.env.PR_HEAD_SHA;
const labels = JSON.parse(process.env.PR_LABELS || "[]");
const approvalLabel = "approved-behavior-change";

if (!baseSha || !headSha) {
  console.error("PR_BASE_SHA and PR_HEAD_SHA are required.");
  process.exit(1);
}

const protectedPaths = [
  "src/",
  "functions/",
  "public/",
  ".cursor/rules/",
  ".github/workflows/",
  "AGENTS.md",
  "firestore.rules",
  "storage.rules",
  "firebase.json",
  "vite.config.js",
  "package.json",
  "package-lock.json",
];

const changedPaths = execFileSync("git", ["diff", "--name-only", "-z", `${baseSha}...${headSha}`], { encoding: "utf8" })
  .split("\0")
  .filter(Boolean);
const existingProductPaths = changedPaths.filter((path) => {
  const isProtected = protectedPaths.some((prefix) => path === prefix || path.startsWith(prefix));
  if (!isProtected) return false;
  try {
    execFileSync("git", ["cat-file", "-e", `${baseSha}:${path}`], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
});

if (existingProductPaths.length && !labels.includes(approvalLabel)) {
  console.error(`Existing product files changed without the required PR label "${approvalLabel}":`);
  for (const path of existingProductPaths) console.error(`  - ${path}`);
  console.error("Review the behavior change with the product owner, then apply the label to authorize this diff for review.");
  process.exit(1);
}

console.log(existingProductPaths.length
  ? `Approved behavior-change label found for ${existingProductPaths.length} existing product file(s).`
  : "No existing product files changed; approved behavior remains protected.");
