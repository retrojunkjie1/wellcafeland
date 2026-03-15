import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..");

const todayPath = path.join(root, "docs", "runtime", "TODAY.json");
const outPath = path.join(root, "docs", "runtime", "CURRENT_PHASE.md");

const readJson = () => {
  const raw = fs.readFileSync(todayPath, "utf8");
  return JSON.parse(raw);
};

const bullet = (items = []) => items.map((x) => `- ${x}`).join("\n");
const section = (title, body) => `# ${title}\n\n${body}\n`;

try {
  const data = readJson();

  const header = [
    "# WELLNESSCAFE — CURRENT PHASE",
    "",
    "Status: Active Development  ",
    `Current Phase: **${data.phase} — ${data.title}**  `,
    `Day: **${data.day || "—"}**`,
    "",
    "--------------------------------------------------",
    "",
    "## Today's focus",
    bullet(data.focus || []),
    "",
    "--------------------------------------------------",
    "",
    "## Verification",
    bullet(data.verify || []),
    "",
    "--------------------------------------------------",
    "",
    "## Manual UI checklist",
    bullet(data.manualTests || []),
    "",
    "--------------------------------------------------",
    "",
    "## Notes",
    bullet(data.notes || []),
    "",
    "END OF FILE",
    "",
  ].join("\n");

  fs.writeFileSync(outPath, header, "utf8");
  process.stdout.write(`Wrote ${path.relative(root, outPath)} from ${path.relative(root, todayPath)}\n`);
  process.exit(0);
} catch (e) {
  console.error("currentPhase.generate failed:", e?.message || e);
  process.exit(1);
}
