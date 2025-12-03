# Content Studio - Quick Start Guide
**WellnessCafe OS - AI Content Generation**

---

## 🚀 Quick Access

**URL**: `/admin/content`  
**Required**: Admin authentication

---

## 📋 5-Minute Setup

### 1. Access the Studio
```bash
# Navigate in your browser
https://your-domain.com/admin/content

# Or locally
http://localhost:5173/admin/content
```

### 2. Configure Parameters

| Parameter | Options | Purpose |
|-----------|---------|---------|
| **Section** | Tools, Recovery, Education, Assistance | Target area |
| **Subtype** | breathing, grounding, cravings, shame, etc. | Content type |
| **Audience** | General, Early Recovery, High Distress | Who it's for |
| **Intensity** | Low, Medium, High | Depth level |
| **Tone** | Calm, Clinical, Compassionate, Firm | Voice style |

### 3. Describe What You Want

**Format**: Natural language description

**Good Examples**:
```
✅ "5-minute breathing exercise for panic attacks during early recovery"
✅ "Shame resilience script for someone who relapsed yesterday"
✅ "Body scan tool for high-distress grief processing"
✅ "Grounding technique for PTSD flashbacks in safe environment"
```

**Bad Examples**:
```
❌ "breathing thing" (too vague)
❌ "make a tool" (no context)
❌ "help" (not specific)
```

### 4. Generate & Review

1. Click **"Generate & Save Module"**
2. Wait for AI processing (~10-30 seconds)
3. Review generated content
4. Check metadata:
   - ✅ Title
   - ✅ Emotional themes
   - ✅ Risk level
   - ✅ Firestore ID

### 5. Content Saved!

Content is automatically saved to Firestore as **draft**.

**Next Steps**:
- Review in Firestore console
- Edit if needed
- Approve for production use
- Surface in appropriate section of OS

---

## 💡 Pro Tips

### Content Quality
- **Be Specific**: More detail = better output
- **Include Context**: Mention the user's state, situation, needs
- **Set Tone Carefully**: Match tone to content intensity
- **Target Audience**: Specify experience level for better calibration

### Parameter Combinations

**For Crisis Content**:
```
Section: Tools
Subtype: grounding
Audience: high_distress
Intensity: low
Tone: calm
```

**For Deep Work**:
```
Section: Recovery
Subtype: shame
Audience: early_recovery
Intensity: medium
Tone: compassionate
```

**For Education**:
```
Section: Education
Subtype: anxiety
Audience: general
Intensity: low
Tone: clinical
```

### Best Practices
1. **Start Simple**: Generate basic content first, iterate
2. **Review Carefully**: All content starts as draft for a reason
3. **Check Themes**: Verify emotional themes match content
4. **Validate Risk**: Ensure risk level is appropriate
5. **Test Before Deploying**: Generate test versions first

---

## 🎯 Content by Use Case

### Crisis Intervention Tools
```yaml
Section: tools
Subtype: grounding / breathing
Audience: high_distress
Intensity: low
Tone: calm
Topic: "Immediate grounding for [specific crisis]"
```

### Recovery Processing
```yaml
Section: recovery
Subtype: shame / cravings / grief
Audience: early_recovery
Intensity: medium
Tone: compassionate
Topic: "Processing [emotion] after [trigger]"
```

### Educational Content
```yaml
Section: education
Subtype: anxiety / trauma
Audience: general
Intensity: low
Tone: clinical
Topic: "Understanding [concept] for [audience]"
```

### Real-World Support
```yaml
Section: assistance
Subtype: housing / grants
Audience: high_distress
Intensity: low
Tone: firm
Topic: "Navigating [resource] when [situation]"
```

---

## 🔍 Understanding Output

### Generated Metadata

**Title**: AI-generated, describes content
**Body**: Markdown-formatted content
**Tags**: Keywords for searchability
**Emotional Themes**: Detected emotions (anxiety, shame, grief, etc.)
**Risk Level**: Safety rating (low/moderate/high)
**Status**: Always "draft" on creation

### Risk Levels Explained

| Level | Meaning | Example Content |
|-------|---------|-----------------|
| **Low** | General wellness, no triggers | Basic breathing exercise |
| **Moderate** | Processing emotions, some sensitivity | Shame resilience work |
| **High** | Heavy material, requires support | PTSD trauma processing |

---

## 🛡️ Safety Features

### Automatic Analysis
Every piece of content is analyzed for:
- ✅ Emotional themes
- ✅ Trigger domains
- ✅ Risk level
- ✅ Safety concerns

### Quality Control
- ✅ Content starts as draft
- ✅ Manual review required
- ✅ Admin approval needed
- ✅ No direct-to-production

### Access Control
- ✅ Admin-only feature
- ✅ Triple authentication layer
- ✅ Protected Firestore writes
- ✅ Audit trail preserved

---

## 🐛 Troubleshooting

### "Please describe what you want to create"
**Cause**: Topic field is empty  
**Fix**: Enter a description

### "Something went wrong while generating content"
**Cause**: Backend API error or network issue  
**Fix**: Check browser console, verify backend is running

### Content doesn't appear in Firestore
**Cause**: Firestore rules or Firebase config issue  
**Fix**: Verify Firebase connection, check Firestore rules

### Access denied to Content Studio
**Cause**: Not logged in as admin  
**Fix**: Log in with admin credentials

---

## 📞 Need Help?

### Resources
- **Full Documentation**: `PHASE_35A_AI_CONTENT_SYSTEM.md`
- **Implementation Details**: `PHASE_35A_IMPLEMENTATION_SUMMARY.md`
- **Code**: `src/apps/admin/ContentStudioPage.jsx`

### Common Questions

**Q: How long does generation take?**  
A: 10-30 seconds depending on content complexity

**Q: Can I edit generated content?**  
A: Yes, edit in Firestore console or build editing UI

**Q: How do I approve content?**  
A: Change status from "draft" to "approved" in Firestore

**Q: Can users see draft content?**  
A: No, only approved content is visible to non-admins

**Q: How many modules can I generate?**  
A: No hard limit, but recommend reviewing each one

---

## 🎓 Examples Library

### Example 1: Panic Attack Tool
```
Section: Tools
Subtype: breathing
Audience: high_distress
Intensity: low
Tone: calm
Topic: 3-minute emergency breathing technique for panic attacks in public spaces
```

### Example 2: Relapse Processing
```
Section: Recovery
Subtype: shame
Audience: early_recovery
Intensity: medium
Tone: compassionate
Topic: Processing shame and guilt after a relapse scare without spiraling into despair
```

### Example 3: Grief Support
```
Section: Recovery
Subtype: grief
Audience: general
Intensity: medium
Tone: compassionate
Topic: Navigating anticipatory grief when a loved one is in active addiction
```

### Example 4: Housing Navigation
```
Section: Assistance
Subtype: housing
Audience: high_distress
Intensity: low
Tone: firm
Topic: Step-by-step guide to applying for emergency housing when recently released from treatment
```

---

## ✨ Remember

**Every module you generate has the power to help someone heal.**

Generate with intention.  
Review with care.  
Deploy with compassion.

---

*WellnessCafe OS - Content Studio*  
*Built to heal at scale* 🏛️✨

