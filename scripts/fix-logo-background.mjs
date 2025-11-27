// Fix LogoWC.png - Remove black background properly
import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputPath = path.join(__dirname, '../src/assets/LogoWC.png');

async function fixLogoBackground() {
  try {
    console.log('Processing LogoWC.png...');
    
    // Load image and get raw pixel data
    const { data, info } = await sharp(inputPath)
      .ensureAlpha() // Ensure alpha channel exists
      .raw()
      .toBuffer({ resolveWithObject: true });
    
    console.log(`Image dimensions: ${info.width}x${info.height}`);
    console.log(`Channels: ${info.channels}`);
    
    // Process pixels: make black/near-black pixels transparent
    const pixels = new Uint8Array(data);
    let transparentCount = 0;
    
    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      const a = pixels[i + 3];
      
      // Only remove pure black or very dark pixels (threshold: RGB < 25)
      // This preserves the gold logo elements
      const isBlack = r < 25 && g < 25 && b < 25;
      
      if (isBlack) {
        pixels[i + 3] = 0; // Set alpha to 0 (transparent)
        transparentCount++;
      }
    }
    
    console.log(`Made ${transparentCount} pixels transparent`);
    
    // Save processed image
    await sharp(pixels, {
      raw: {
        width: info.width,
        height: info.height,
        channels: 4
      }
    })
    .png({ compressionLevel: 9, quality: 100 })
    .toFile(inputPath);
    
    console.log('✓ Successfully processed LogoWC.png');
    console.log('  Black background removed, logo preserved');
  } catch (error) {
    console.error('❌ Error processing image:', error.message);
    console.log('\nThe original image may need to be restored manually.');
    console.log('Please restore LogoWC.png from a backup or recreate it.');
  }
}

fixLogoBackground();

