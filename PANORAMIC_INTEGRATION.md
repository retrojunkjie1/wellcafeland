# WellnessCafe Panoramic Visual Integration

## 🎨 Style Confirmed

**Custom Mix**: Nature-Tech Luxury + Luxury Cafe & Wellness Lounge

- Primary: 🌿 Nature-Tech Luxury (lush landscapes + soft holographic UI overlays, gold/emerald palette)
- Secondary: ☕ Luxury Cafe & Wellness Lounge (marble counters, herbal drinks, plants, warm lighting)

## 🖼️ Images to Generate (1920×1080 HQ PNGs)

### Priority 1: Hero Banner

- **File**: `src/assets/images/hero-panorama.png`
- **Usage**: Main site hero section background
- **Style**: Nature-Tech Luxury with Wellness Cafe elements

### Priority 2: Wellness Lounge Interior

- **File**: `src/assets/images/wellness-lounge-panorama.png`
- **Usage**: Feature sections or about page
- **Style**: Luxury Cafe & Wellness Lounge

### Priority 3: Meditation/Zen Landscape

- **File**: `src/assets/images/meditation-landscape-panorama.png`
- **Usage**: Mindfulness/zen sections
- **Style**: Nature-Tech Luxury

## 🔧 Integration Steps

Once images are generated:

1. **Add image files** to `src/assets/images/` folder
2. **Uncomment imports** in `src/components/TopFold.js`:

   ```js
   import heroPanorama from "../assets/images/hero-panorama.png";
   import loungePanorama from "../assets/images/wellness-lounge-panorama.png";
   import zenLandscapePanorama from "../assets/images/meditation-landscape-panorama.png";
   ```

3. **Uncomment image element** in TopFold component:

   ```jsx
   <img
     src={heroPanorama}
     alt="WellnessCafe Hero Panorama"
     className="hero-panorama-image"
   />
   ```

4. **Test build**: `npm run build`

## 🎯 Expected Result

- Hero section displays panoramic background with subtle hover effects
- Images are optimized for web (consider WebP format for better performance)
- Responsive design maintains aspect ratio across devices
- Dark overlay ensures text readability

## 📝 Notes

- Images are styled with `brightness(0.4)` and `contrast(1.1)` for optimal text contrast
- Hover effect adds subtle scale transformation
- Z-index layering ensures proper element stacking
