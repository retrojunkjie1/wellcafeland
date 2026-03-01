// scripts/phase54c2.verify.mjs
// Phase 54C2: Global safe-area shell + bottom nav lift + voice in-app verification

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

const checks = {
  indexCssSafeArea: {
    path: path.join(ROOT, "src/index.css"),
    mustContain: "env(safe-area-inset-bottom)",
  },
  indexCssNavVar: {
    path: path.join(ROOT, "src/index.css"),
    mustContain: "--wc-bottom-nav-h",
  },
  osLayoutShellPad: {
    path: path.join(ROOT, "src/layouts/OSLayout.jsx"),
    mustContain: "wc-shell-pad-bottom",
  },
  osLayoutFixedNav: {
    path: path.join(ROOT, "src/layouts/OSLayout.jsx"),
    mustContain: "wc-fixed-bottom-nav",
  },
  voiceCheckInNoTargetBlank: {
    path: path.join(ROOT, "src/apps/tools/VoiceCheckIn.jsx"),
    mustNotContain: 'target="_blank"',
  },
  voiceCheckInNoWindowOpen: {
    path: path.join(ROOT, "src/apps/tools/VoiceCheckIn.jsx"),
    mustNotContain: "window.open(",
  },
  voiceCheckInNoAlert: {
    path: path.join(ROOT, "src/apps/tools/VoiceCheckIn.jsx"),
    mustNotContain: "alert(",
  },
};

const main = () => {
  const report = {};
  let pass = true;

  for (const [name, cfg] of Object.entries(checks)) {
    const result = { path: cfg.path, ok: false, reason: "" };
    if (!fs.existsSync(cfg.path)) {
      result.reason = "file not found";
      pass = false;
    } else {
      const content = fs.readFileSync(cfg.path, "utf8");
      if (cfg.mustContain && !content.includes(cfg.mustContain)) {
        result.reason = "missing: " + cfg.mustContain;
        pass = false;
      } else if (cfg.mustNotContain && content.includes(cfg.mustNotContain)) {
        result.reason = "must not contain: " + cfg.mustNotContain;
        pass = false;
      } else {
        result.ok = true;
      }
    }
    report[name] = result;
  }

  console.log("PHASE54C2_VERIFY");
  console.log(JSON.stringify(report, null, 2));
  console.log(pass ? "PASS" : "FAIL");
  process.exit(pass ? 0 : 1);
};

main();
