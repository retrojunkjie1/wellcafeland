# Real Help Workspace - Quick Start Guide

## 🚀 Getting Started (2 Minutes)

### Step 1: Seed Sample Data (Admin Only)
```
1. Navigate to: http://localhost:5173/admin/seed
2. Click "Seed Real Help Data"
3. Wait for success message
```

### Step 2: Visit the Workspace
```
Navigate to: http://localhost:5173/workspace/real-help
```

### Step 3: Explore Features
```
✅ Read "Start Here" section
✅ Click tabs: Housing → Funding → Programs → Circles
✅ Try searching: "sober living California"
✅ Click "Visit Site" on any resource
✅ Click "Details" to see full info
✅ Click ♥ to save favorites
```

---

## 📍 Key URLs

| Page | URL | Purpose |
|------|-----|---------|
| **Real Help Workspace** | `/workspace/real-help` | Main resource discovery |
| **Assistance Hub** | `/assistance` | Entry point to Real Help |
| **Admin Seed Page** | `/admin/seed` | Populate sample data |
| **Directory** | `/directory` | Browse all resources |

---

## 🔍 Example Searches

Try these searches to test functionality:

```
Search: "sober living"
Region: "California"
→ Shows housing providers in CA

Search: "treatment funding"
Region: (leave blank)
→ Shows grants nationwide

Search: "emergency shelter"
Region: "Los Angeles"
→ Shows emergency resources in LA

Search: "recovery support"
Region: (leave blank)
→ Shows programs and circles
```

---

## 🎨 UI Components

### Crisis Banner
```
⚠️ If you are in danger, call 988 or local emergency services immediately.
```

### Start Here Section
```
📋 Start Here
Where Do I Even Start?
1. Am I safe right now?
2. Do I have a place to sleep tonight?
3. Do I have someone I can tell the truth to?
```

### Resource Tabs
```
[Housing] [Funding] [Programs] [Circles]
```

### Search Bar
```
[Search housing.....................] [Region: California]
```

### Resource Card
```
┌─────────────────────────────────┐
│ Serenity House Recovery    ✅   │
│                                 │
│ A peaceful sober living...      │
│                                 │
│ 📍 California                   │
│ ✅ Currently Open               │
│                                 │
│ [Visit Site] [Details] [♥ Save] │
└─────────────────────────────────┘
```

---

## 🛠️ Troubleshooting

### No Resources Showing?
```
1. Check if data is seeded: /admin/seed
2. Verify Firebase connection
3. Check browser console for errors
```

### Search Not Working?
```
1. Check network connection
2. Verify Firebase Functions are deployed
3. Check console for API errors
```

### Styling Issues?
```
1. Clear browser cache
2. Verify Tailwind CSS is compiling
3. Check for CSS conflicts
```

---

## 📊 Data Schema Quick Reference

### Housing Provider
```javascript
{
  name: "Serenity House",
  type: "sober_home",
  region: "California",
  cost_range: "$800-1200/month",
  capacity_status: "open",
  website: "https://...",
  description: "...",
  curated: true
}
```

### Grant
```javascript
{
  name: "SAMHSA Treatment Grant",
  region: "Nationwide",
  description: "...",
  website: "https://...",
  curated: true
}
```

### Support Program
```javascript
{
  category: "treatment",
  name: "Phoenix Recovery Center",
  region: "California",
  website: "https://...",
  description: "..."
}
```

### Recovery Circle
```javascript
{
  theme: "early_recovery",
  description: "...",
  cadence: "daily",
  prompts: ["What are you grateful for?", ...]
}
```

---

## 🎯 Testing Checklist

### Visual Tests
- [ ] Desktop view (1920x1080)
- [ ] Tablet view (768x1024)
- [ ] Mobile view (375x667)
- [ ] Dark mode (default)

### Functional Tests
- [ ] Tab switching
- [ ] Search with query
- [ ] Search with region
- [ ] Click "Visit Site"
- [ ] Click "Details"
- [ ] Click "Save"

### Edge Cases
- [ ] Empty search
- [ ] No results
- [ ] Network error
- [ ] Long resource names
- [ ] Missing data fields

---

## 💡 Pro Tips

1. **Use Specific Regions**: "California" works better than "CA"
2. **Try Multiple Keywords**: "sober living" vs "recovery housing"
3. **Check Curated Badge**: Verified resources have ✅ badge
4. **Save Favorites Early**: Use ♥ to bookmark resources
5. **Read Start Here First**: Helps orient if overwhelmed

---

## 🆘 Emergency Resources

Always displayed in crisis banner:

```
988 - Suicide & Crisis Lifeline
911 - Emergency Services
SAMHSA - 1-800-662-4357
```

---

## 📞 Support

### Technical Issues
- Check browser console (F12)
- Verify Firebase connection
- Review error messages

### Content Issues
- Edit markdown files in `/src/content/assistance/`
- Update seed data in `/src/utils/seedRealHelpData.js`

### Feature Requests
- Document in project roadmap
- Create GitHub issue
- Discuss with team

---

## ✅ Success Indicators

You'll know it's working when:

1. ✅ "Start Here" section loads with content
2. ✅ Tabs switch smoothly
3. ✅ Resources appear in each category
4. ✅ Search returns results
5. ✅ Cards display correctly
6. ✅ Links open in new tabs
7. ✅ No console errors

---

**Last Updated:** December 5, 2025  
**Version:** 1.0.0  
**Status:** ✅ Production Ready

