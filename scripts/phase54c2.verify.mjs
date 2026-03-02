// scripts/phase54c2.verify.mjs
// Phase 54C2: Global safe-area shell + bottom nav lift + voice in-app verification

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

const checks = {
  indexCssSafeArea: {
    path: path.join(ROOT, "src/index.css"),
    mustContain: "env(safe-area-inset-bottom)",
    mustNotContain: null,
  },
  indexCssNavH: {
    path: path.join(ROOT, "src/index.css"),
    mustContain: "--wc-bottom-nav-h",
    mustNotContain: null,
  },
  osLayout: {
    path: path.join(ROOT, "src/layouts/OSLayout.jsx"),
    mustContain: "wc-shell-pad-bottom",
    mustNotContain: null,
  },
  bottomNav: {
    path: path.join(ROOT, "src/layouts/OSLayout.jsx"),
    mustContain: "wc-fixed-bottom-nav",
    mustNotContain: null,
  },
  voiceCheckIn: {
    path: path.join(ROOT, "src/apps/tools/VoiceCheckIn.jsx"),
    mustContain: "isSecureContext",
    mustNotContain: ['target="_blank"', "window.open(", "alert("],
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
      if (!content.includes(cfg.mustContain)) {
        result.reason = "missing required: " + JSON.stringify(cfg.mustContain);
        pass = false;
      } else if (cfg.mustNotContain) {
        const found = cfg.mustNotContain.filter((s) => content.includes(s));
        if (found.length > 0) {
          result.reason = "must not contain: " + found.join(", ");
          pass = false;
        } else {
          result.ok = true;
        }
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
