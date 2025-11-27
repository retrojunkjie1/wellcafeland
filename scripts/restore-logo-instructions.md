# LogoWC.png Restoration Instructions

The LogoWC.png file appears to be corrupted (file size is too small: ~1.1KB).

## To Restore:

1. **If you have a backup:**
   - Copy the original LogoWC.png file to `src/assets/LogoWC.png`
   - The file should be a PNG with the gold "WC" logo on black background

2. **If you need to recreate it:**
   - The logo should have:
     - Gold "WC" initials in serif font
     - Gold decorative elements (sparkles, arcs)
     - Black background
     - Size: 1024x1024 or similar high resolution

3. **After restoring, to remove black background:**
   ```bash
   # Make sure sharp is installed
   npm install --save-dev sharp
   
   # Run the fix script (with better threshold)
   node scripts/fix-logo-background.mjs
   ```

## Current Issue:
The image processing removed all pixels, making the entire image transparent. The original file needs to be restored before processing.

