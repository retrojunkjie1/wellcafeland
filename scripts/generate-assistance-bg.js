/*
  Generates /public/assets/images/assistance-bg-dark.jpg from the SVG source using sharp.
  Usage: node scripts/generate-assistance-bg.js
*/

const fs = require("node:fs");
const path = require("node:path");
const sharp = require("sharp");

const svgPath = path.resolve(
  __dirname,
  "../public/assets/images/assistance-bg-dark.svg"
);
const outDir = path.resolve(__dirname, "../public/assets/images");
const outPath = path.join(outDir, "assistance-bg-dark.jpg");

async function main() {
  if (!fs.existsSync(svgPath)) {
    console.error("SVG not found at", svgPath);
    process.exit(1);
  }
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }
  // Render larger then downscale for smoothness
  const width = 2560; // 2.5K
  const height = 1440;
  const quality = 88;

  const svgBuffer = fs.readFileSync(svgPath);
  const jpegBuffer = await sharp(svgBuffer, { density: 240 })
    .resize(width, height, { fit: "cover" })
    // Subtle blur and vignette-like softness
    .modulate({ saturation: 0.95, brightness: 0.98 })
    .jpeg({ quality, chromaSubsampling: "4:4:4", progressive: true })
    .toBuffer();

  fs.writeFileSync(outPath, jpegBuffer);
  console.log("Generated", outPath);
}

main().catch((err) => {
  console.error(
    "Failed to generate JPG:",
    err && err.message ? err.message : err
  );
  process.exit(1);
});
