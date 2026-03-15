// scripts/phase54b.verify.mjs
// Phase 54B: Luxury chat composer — source marker verification

import fs from "node:fs";
import path from "node:path";

const COMPOSER_PATH = path.resolve(process.cwd(), "src/components/system/ChatComposerBar.jsx");
const MARKER = 'data-wc-composer="1"';

const main = () => {
  const report = {
    fileExists: false,
    hasMarker: false,
  };

  if (fs.existsSync(COMPOSER_PATH)) {
    report.fileExists = true;
    const content = fs.readFileSync(COMPOSER_PATH, "utf8");
    report.hasMarker = content.includes(MARKER);
  }

  const pass = report.fileExists && report.hasMarker;
  console.log("PHASE54B_COMPOSER_VERIFY");
  console.log(JSON.stringify(report, null, 2));
  console.log(pass ? "PASS" : "FAIL");
  process.exit(pass ? 0 : 1);
};

main();
