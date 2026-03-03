// scripts/phase55.verify.mjs
// Phase 55: Experience unification verification

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

const checks = {
  noEmulatorBannerText: {
    dir: path.join(ROOT, "src"),
    mustNotContain: "Running in emulator mode",
  },
  noTargetBlank: {
    dir: path.join(ROOT, "src"),
    mustNotContain: 'target="_blank"',
  },
  experienceShellExists: {
    path: path.join(ROOT, "src/system/ExperienceShell.jsx"),
    mustExist: true,
  },
  bottomNavFixed: {
    path: path.join(ROOT, "src/system/ExperienceShell.jsx"),
    mustContain: "position: fixed",
    orContain: "fixed",
  },
  composerDockExists: {
    path: path.join(ROOT, "src/system/ExperienceShell.jsx"),
    mustContain: "wc-composer-dock",
  },
};

const scanDir = (dir, mustNotContain) => {
  if (!fs.existsSync(dir)) return { ok: true };
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const f of files) {
    const fp = path.join(dir, f.name);
    if (f.isDirectory()) {
      const r = scanDir(fp, mustNotContain);
      if (!r.ok) return r;
    } else if (f.isFile() && /\.(jsx?|tsx?)$/.test(f.name)) {
      const content = fs.readFileSync(fp, "utf8");
      if (content.includes(mustNotContain)) {
        return { ok: false, file: fp, found: mustNotContain };
      }
    }
  }
  return { ok: true };
};

const main = () => {
  const report = {};
  let pass = true;

  const r1 = scanDir(checks.noEmulatorBannerText.dir, checks.noEmulatorBannerText.mustNotContain);
  report.noEmulatorBannerText = r1.ok ? { ok: true } : { ok: false, reason: `Found in ${r1.file}` };
  if (!r1.ok) pass = false;

  const r2 = scanDir(checks.noTargetBlank.dir, checks.noTargetBlank.mustNotContain);
  report.noTargetBlank = r2.ok ? { ok: true } : { ok: false, reason: `Found in ${r2.file}` };
  if (!r2.ok) pass = false;

  report.experienceShellExists = fs.existsSync(checks.experienceShellExists.path)
    ? { ok: true }
    : { ok: false, reason: "ExperienceShell.jsx not found" };
  if (!report.experienceShellExists.ok) pass = false;

  const shellPath = path.join(ROOT, "src/system/ExperienceShell.jsx");
  if (fs.existsSync(shellPath)) {
    const content = fs.readFileSync(shellPath, "utf8");
    report.bottomNavFixed = content.includes("fixed") ? { ok: true } : { ok: false, reason: "BottomNav not fixed" };
    report.composerDockExists = content.includes("wc-composer-dock") ? { ok: true } : { ok: false, reason: "ComposerDock missing" };
    if (!report.bottomNavFixed.ok || !report.composerDockExists.ok) pass = false;
  }

  console.log("PHASE55_VERIFY");
  console.log(JSON.stringify(report, null, 2));
  console.log(pass ? "PASS" : "FAIL");
  process.exit(pass ? 0 : 1);
};

main();
