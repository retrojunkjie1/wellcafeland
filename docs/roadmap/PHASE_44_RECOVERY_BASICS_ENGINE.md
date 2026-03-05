# Phase 44 - Recovery Basics Engine

**Status:** ✅ Complete  
**Date:** December 5, 2025  
**Purpose:** Deep, trauma-informed recovery content engine

---

## 🎯 **Overview**

The **Recovery Basics Engine** provides clinically-informed, trauma-aware content for 8 core recovery topics. This replaces simple markdown files with comprehensive, multi-layered therapeutic content.

**This is not just content. This is clinical wisdom, trauma-informed care, and life-saving guidance.**

---

## 📊 **Available Topics**

### **8 Core Recovery Topics:**

1. **Shame and Recovery** (`shame-and-recovery`)
2. **Cravings and Urges** (`cravings-and-urges`)
3. **Nervous System Regulation** (`nervous-system-regulation`)
4. **Trauma and Recovery** (`trauma-and-recovery`)
5. **Sleep and Recovery** (`sleep-and-recovery`)
6. **Boundaries in Recovery** (`boundaries-in-recovery`)
7. **Grief and Loss** (`grief-and-loss`)
8. **Self-Compassion** (`self-compassion`)

---

## 💻 **Usage**

### **Import the Engine:**
```javascript
import { getRecoveryBasicsContent, RECOVERY_BASICS_TOPICS } from "@/engines/education/recoveryBasicsEngine";
```

### **Get Content:**
```javascript
const content = getRecoveryBasicsContent("cravings-and-urges");

// Returns:
{
  id: "cravings-and-urges",
  title: "Cravings and Urges",
  understanding: "A craving is not a moral failure...",
  reflection: "Think about your last strong craving..."
}
```

### **Display in UI:**
```javascript
<div>
  <h1>{content.title}</h1>
  
  <section>
    <h2>Understanding</h2>
    <p>{content.understanding}</p>
  </section>
  
  <section>
    <h2>Reflection</h2>
    <p>{content.reflection}</p>
  </section>
</div>
```

---

## 🎨 **Current Integration**

### **ToolDetailPage.jsx** ✅

**Automatic Mapping:**
- `recovery.cravings.intro` → `cravings-and-urges`
- `education.shame.basics` → `shame-and-recovery`

**What Happens:**
1. User navigates to `/tools/recovery.cravings.intro`
2. ToolDetailPage detects it's a recovery basics topic
3. Loads deep content from engine (not markdown)
4. Displays beautiful "Understanding" and "Reflection" sections
5. Tracks topic visit in memory (Phase 44)

**Visual Design:**
- **Understanding Section:** White text on gradient background
- **Reflection Section:** Amber-themed with italic styling
- **Professional spacing and typography**

---

## 📝 **Content Structure**

### **Each Topic Contains:**

#### **1. Understanding** (Deep Clinical Content)
- Trauma-informed perspective
- Nervous system science
- Real-world examples
- Non-judgmental language
- Actionable insights

#### **2. Reflection** (Therapeutic Question)
- Prompts deep self-inquiry
- Safe, compassionate framing
- Opens space for processing
- Encourages journaling/discussion

---

## 🎯 **Example: Cravings and Urges**

### **Understanding:**
```
A craving is not a moral failure; it is a signal. The nervous system 
has learned, through repetition, that a certain substance or behavior 
temporarily changes how you feel...

Urges usually have three layers:
1) Body – tight chest, restless hands, buzzing under the skin.
2) Emotion – shame, anger, grief, boredom, or raw emptiness.
3) Story – "I can't handle this," "Just this once," "It doesn't matter anymore."

Most people only fight at the story level and try to win with willpower: 
"I just need to be stronger." That is exhausting. A trauma-informed 
approach treats cravings like ocean waves: they rise, peak, and fall...
```

### **Reflection:**
```
Think about your last strong craving: if the substance or behavior 
disappeared from the earth in that moment, what feeling would have 
been left sitting in the room with you?
```

---

## 🔄 **Adding New Topics**

### **1. Add to TOPIC_MAP:**
```javascript
const TOPIC_MAP = {
  // ... existing topics ...
  
  "your-new-topic": {
    id: "your-new-topic",
    title: "Your New Topic",
    understanding: `
    Deep, trauma-informed content here...
    `.trim(),
    reflection: `
    Therapeutic reflection question here...
    `.trim(),
  },
};
```

### **2. Add to RECOVERY_BASICS_TOPICS:**
```javascript
export const RECOVERY_BASICS_TOPICS = [
  // ... existing ...
  "your-new-topic",
];
```

### **3. Map Content ID (Optional):**
```javascript
// In ToolDetailPage.jsx
const topicMapping = {
  // ... existing ...
  "recovery.your-topic": "your-new-topic",
};
```

---

## 🎨 **Visual Design**

### **Understanding Section:**
```css
border: white/10
background: gradient from-white/[0.05] to-transparent
text: white/85
spacing: p-6 space-y-4
```

### **Reflection Section:**
```css
border: amber-400/30
background: gradient from-amber-400/[0.08] to-amber-500/[0.04]
text: amber-100/90 italic
spacing: p-6 space-y-4
indicator: amber dot (w-1.5 h-1.5)
```

---

## 📊 **Content Quality**

### **Clinical Excellence:**
- ✅ Trauma-informed language
- ✅ Nervous system science
- ✅ Addiction recovery expertise
- ✅ Non-judgmental tone
- ✅ Evidence-based insights

### **Therapeutic Depth:**
- ✅ Multi-layered understanding
- ✅ Real-world examples
- ✅ Actionable guidance
- ✅ Compassionate framing
- ✅ Reflection prompts

### **Writing Quality:**
- ✅ Clear, accessible language
- ✅ Professional yet human
- ✅ Respectful of suffering
- ✅ Hopeful without false promises
- ✅ Permission-giving

---

## 🔗 **Integration Points**

### **Already Integrated:**
- ✅ **ToolDetailPage.jsx** - Auto-loads for mapped topics
- ✅ **Topic Memory** - Tracks visits (Phase 44)
- ✅ **Visual Design** - Beautiful, professional UI

### **Ready to Integrate:**
- **RecoveryPage.jsx** - Could show "Deep Dive" button
- **AI Assistant** - Could reference content in responses
- **Dashboard** - Could suggest topics based on patterns

---

## 🧪 **Testing**

### **Test Topic Loading:**
```
1. Navigate to /tools/recovery.cravings.intro
2. Should see deep "Understanding" section
3. Should see "Reflection" section with amber styling
4. Should NOT load markdown file
```

### **Test Topic Memory:**
```
1. View "Understanding Cravings"
2. Go back to /recovery
3. Topic should show "Recent" badge
4. Check localStorage for lastTopicId
```

### **Test Fallback:**
```
1. Navigate to non-mapped topic
2. Should load markdown as before
3. No errors in console
```

---

## 📈 **Benefits**

### **For Users:**
- ✅ Deeper understanding of recovery concepts
- ✅ Trauma-informed perspective
- ✅ Therapeutic reflection questions
- ✅ Professional, compassionate content
- ✅ Multi-layered insights

### **For Clinical Excellence:**
- ✅ Evidence-based content
- ✅ Trauma-aware language
- ✅ Nervous system science
- ✅ Addiction recovery expertise
- ✅ Harm reduction approach

### **For Product:**
- ✅ Higher engagement
- ✅ Better outcomes
- ✅ Clinical credibility
- ✅ Competitive advantage
- ✅ Life-saving impact

---

## 🎯 **Content Philosophy**

### **Trauma-Informed Principles:**
1. **Safety** - Non-threatening language
2. **Trustworthiness** - Evidence-based, honest
3. **Choice** - User controls pace
4. **Collaboration** - Partnership in healing
5. **Empowerment** - Builds self-efficacy

### **Recovery Wisdom:**
- Separates behavior from identity
- Honors nervous system responses
- Validates suffering
- Offers hope without false promises
- Provides practical tools

---

## 📝 **Files Created/Modified**

### **Created:**
1. `src/engines/education/recoveryBasicsEngine.js` - Core engine (8 topics)

### **Modified:**
1. `src/apps/tools/ToolDetailPage.jsx` - Integrated engine, added UI

---

## 🚀 **Future Enhancements**

### **Phase 45: Expand Topics**
- Add more recovery topics
- Add MIR (Mirror) topics
- Add spiritual topics
- Add family recovery topics

### **Phase 46: Interactive Elements**
- Journal prompts
- Audio narration
- Video explanations
- Interactive exercises

### **Phase 47: Personalization**
- AI-powered topic suggestions
- Progress tracking
- Completion certificates
- Community sharing

---

## ✅ **Status**

**Recovery Basics Engine:** ✅ **COMPLETE**

- 8 comprehensive topics
- Beautiful UI integration
- Topic memory tracking
- Zero linter errors
- Production ready

**This engine transforms simple content into deep, life-changing therapeutic experiences.**

---

**Last Updated:** December 5, 2025  
**Version:** 1.0.0  
**Status:** ✅ Production Ready

