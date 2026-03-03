// scripts/phase54c3.verify.mjs
// Phase 54C3: Emulator eyesore removed — quiet status pill, no red banner in layout

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

const BANNER_TEXTS = [
  "Running in emulator mode. Do not use with production credentials.",
  "Running in emulator mode",
];

const checks = {
  pillExists: {
    path: path.join(ROOT, "src/components/system/EmulatorStatusPill.jsx"),
    mustExist: true,
  },
  osLayoutUsesPill: {
    path: path.join(ROOT, "src/layouts/OSLayout.jsx"),
    mustContain: "EmulatorStatusPill",
    mustNotContain: "EmulatorBanner",
  },
  layoutNoBannerText: {
    dir: path.join(ROOT, "src/layouts"),
    mustNotContain: BANNER_TEXTS,
  },
};

const main = () => {
  const report = {};
  let pass = true;

  // pillExists
  const pillPath = checks.pillExists.path;
  if (!fs.existsSync(pillPath)) {
    report.pillExists = { ok: false, reason: "EmulatorStatusPill.jsx not found" };
    pass = false;
  } else {
    report.pillExists = { ok: true, path: pillPath };
  }

  // osLayoutUsesPill
  const layoutPath = checks.osLayoutUsesPill.path;
  if (!fs.existsSync(layoutPath)) {
    report.osLayoutUsesPill = { ok: false, reason: "OSLayout.jsx not found" };
    pass = false;
  } else {
    const content = fs.readFileSync(layoutPath, "utf8");
    const hasPill = content.includes(checks.osLayoutUsesPill.mustContain);
    const hasBanner = content.includes(checks.osLayoutUsesPill.mustNotContain);
    if (!hasPill || hasBanner) {
      report.osLayoutUsesPill = {
        ok: false,
        reason: hasBanner ? "still uses EmulatorBanner" : "missing EmulatorStatusPill",
      };
      pass = false;
    } else {
      report.osLayoutUsesPill = { ok: true };
    }
  }

  // layoutNoBannerText
  const layoutDir = checks.layoutNoBannerText.dir;
  if (!fs.existsSync(layoutDir)) {
    report.layoutNoBannerText = { ok: true, reason: "no layouts dir" };
  } else {
    const files = fs.readdirSync(layoutDir);
    let found = null;
    for (const f of files) {
      const fp = path.join(layoutDir, f);
      if (!fs.statSync(fp).isFile()) continue;
      const content = fs.readFileSync(fp, "utf8");
      const hit = BANNER_TEXTS.find((t) => content.includes(t));
      if (hit) {
        found = { file: f, text: hit };
        break;
      }
    }
    if (found) {
      report.layoutNoBannerText = {
        ok: false,
        reason: `banner text in ${found.file}`,
      };
      pass = false;
    } else {
      report.layoutNoBannerText = { ok: true };
    }
  }

  console.log("PHASE54C3_VERIFY");
  console.log(JSON.stringify(report, null, 2));
  console.log(pass ? "PASS" : "FAIL");
  process.exit(pass ? 0 : 1);
};

main();
