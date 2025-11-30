#!/usr/bin/env node
// scripts/phase27-check.js
// Phase 27 — Final Alignment Check Script
// Checks for missing UI fields, imports, humanMode fields, emotionalHistory, and clustered data errors

const fs = require("fs");
const path = require("path");

const errors = [];
const warnings = [];

// Check if file exists and has required imports
function checkFile(filePath, requiredImports = [], requiredExports = []) {
  if (!fs.existsSync(filePath)) {
    errors.push(`Missing file: ${filePath}`);
    return;
  }

  const content = fs.readFileSync(filePath, "utf8");

  // Check imports
  requiredImports.forEach((imp) => {
    if (!content.includes(imp)) {
      warnings.push(`${filePath}: Missing import "${imp}"`);
    }
  });

  // Check exports
  requiredExports.forEach((exp) => {
    if (!content.includes(exp)) {
      warnings.push(`${filePath}: Missing export "${exp}"`);
    }
  });
}

// Check store for UI state fields
function checkStore() {
  const storePath = path.join(__dirname, "../src/stores/useOSStore.js");
  if (!fs.existsSync(storePath)) {
    errors.push("Missing store file");
    return;
  }

  const content = fs.readFileSync(storePath, "utf8");

  const requiredFields = [
    "uiState",
    "setUIVisualMode",
    "setLastHumanMode",
    "emotionalHistory",
    "appendEmotionalSnapshot",
  ];

  requiredFields.forEach((field) => {
    if (!content.includes(field)) {
      errors.push(`useOSStore.js: Missing field/action "${field}"`);
    }
  });
}

// Check ChatPanel for HUD components
function checkChatPanel() {
  const chatPanelPath = path.join(__dirname, "../src/components/os/ChatPanel.jsx");
  if (!fs.existsSync(chatPanelPath)) {
    errors.push("Missing ChatPanel file");
    return;
  }

  const content = fs.readFileSync(chatPanelPath, "utf8");

  const requiredImports = [
    "EmotionalChip",
    "TriggerChips",
    "RiskBadge",
    "TrajectoryTag",
    "IntelligencePulse",
  ];

  requiredImports.forEach((imp) => {
    if (!content.includes(imp)) {
      warnings.push(`ChatPanel.jsx: Missing import "${imp}"`);
    }
  });

  // Check for setLastHumanMode calls
  if (!content.includes("setLastHumanMode")) {
    warnings.push("ChatPanel.jsx: Missing setLastHumanMode call");
  }
}

// Check OSLayout for dynamic classnames
function checkOSLayout() {
  const layoutPath = path.join(__dirname, "../src/layouts/OSLayout.jsx");
  if (!fs.existsSync(layoutPath)) {
    errors.push("Missing OSLayout file");
    return;
  }

  const content = fs.readFileSync(layoutPath, "utf8");

  if (!content.includes("lastHumanMode") && !content.includes("uiState")) {
    warnings.push("OSLayout.jsx: Missing humanMode/uiState integration");
  }
}

// Check architecture files
function checkArchitecture() {
  const archPath = path.join(__dirname, "../src/core/architecture/osAlignment.js");
  if (!fs.existsSync(archPath)) {
    errors.push("Missing osAlignment.js file");
    return;
  }

  const content = fs.readFileSync(archPath, "utf8");

  const requiredExports = [
    "detectUIState",
    "computeLayoutMode",
    "harmonizeTheme",
    "getPriorityVisualState",
    "produceUIIntent",
  ];

  requiredExports.forEach((exp) => {
    if (!content.includes(exp)) {
      errors.push(`osAlignment.js: Missing export "${exp}"`);
    }
  });
}

// Check HUD components
function checkHUDComponents() {
  const components = [
    "EmotionalChip",
    "TriggerChip",
    "RiskBadge",
    "TrajectoryTag",
    "IntelligencePulse",
  ];

  components.forEach((comp) => {
    const compPath = path.join(
      __dirname,
      `../src/components/${comp === "IntelligencePulse" ? "hud" : "analysis"}/${comp}.jsx`
    );
    if (!fs.existsSync(compPath)) {
      errors.push(`Missing component: ${comp}.jsx`);
    }
  });
}

// Check safety utilities
function checkSafety() {
  const safetyPath = path.join(__dirname, "../src/utils/safety.js");
  if (!fs.existsSync(safetyPath)) {
    errors.push("Missing safety.js file");
    return;
  }

  const content = fs.readFileSync(safetyPath, "utf8");

  const requiredExports = ["safeCall", "safeJSON", "safeComponent"];

  requiredExports.forEach((exp) => {
    if (!content.includes(exp)) {
      errors.push(`safety.js: Missing export "${exp}"`);
    }
  });
}

// Run all checks
console.log("Phase 27 Alignment Check\n");

checkStore();
checkChatPanel();
checkOSLayout();
checkArchitecture();
checkHUDComponents();
checkSafety();

// Report results
if (errors.length > 0) {
  console.error("❌ ERRORS:");
  errors.forEach((err) => console.error(`  - ${err}`));
  process.exit(1);
}

if (warnings.length > 0) {
  console.warn("⚠️  WARNINGS:");
  warnings.forEach((warn) => console.warn(`  - ${warn}`));
}

if (errors.length === 0 && warnings.length === 0) {
  console.log("✅ All Phase 27 checks passed!");
  process.exit(0);
}

process.exit(warnings.length > 0 ? 0 : 1);

