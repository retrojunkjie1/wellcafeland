// scripts/ensureSecretsDir.cjs
const fs = require("fs");
const path = require("path");

const secretsDir = path.join(process.cwd(), ".secrets");

if (!fs.existsSync(secretsDir)) {
  fs.mkdirSync(secretsDir, { recursive: true });
  console.log("✅ Created .secrets directory");
} else {
  console.log("✅ .secrets directory exists");
}

