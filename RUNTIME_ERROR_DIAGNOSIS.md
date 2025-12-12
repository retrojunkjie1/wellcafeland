# Runtime Error Diagnosis - "Something went wrong"

**Date:** December 11, 2025  
**Error:** ErrorBoundary triggered - "Something went wrong"  
**URL:** `http://localhost:5180/dashboard / WellnessCafe`

---

## 🔍 Error Analysis

The error page indicates a **React ErrorBoundary** has caught a runtime error. This means a component is throwing an exception during render or execution.

---

## 🎯 Most Likely Causes

### **1. Import/Module Resolution Issues**

**Potential Issues:**
- `toolResolver.ts` importing from `toolsBridge.ts` 
- `toolsBridge.ts` importing from `healerRegistry.ts` or `ritualSequences.ts`
- TypeScript/JavaScript module resolution conflicts
- Missing file extensions in imports

**Files to Check:**
- `src/tools/toolResolver.ts` - Imports `dailyPracticeTools` from `toolsBridge`
- `src/tools/toolsBridge.ts` - Imports `healerRegistry` and `ritualSequences`
- `src/apps/explore/ExplorePage.tsx` - Imports `allTools` from `toolResolver`

### **2. TypeScript/JavaScript Interop Issues**

**Potential Issues:**
- `.ts` files importing from `.tsx` files
- `.jsx` files importing TypeScript types
- Missing type definitions
- Runtime type errors

**Files to Check:**
- `ExplorePage.tsx` (TypeScript) importing from `toolResolver.ts` (TypeScript) ✅ Should work
- `ToolsPageCinematic.jsx` (JavaScript) importing from TypeScript files ⚠️ May have issues

### **3. Undefined/Null Access**

**Potential Issues:**
- `allTools` being undefined
- `dailyPracticeTools` being undefined
- `healerRegistry` or `ritualSequences` not exporting correctly
- Array methods called on undefined

**Files to Check:**
- `toolResolver.ts` - `allTools` array construction
- `toolsBridge.ts` - `dailyPracticeTools` export
- `healerRegistry.ts` - Export structure

### **4. Component Props Mismatch**

**Potential Issues:**
- `ToolCard` receiving invalid `DailyPracticeTool` structure
- Missing required properties in tool objects
- Type mismatches between expected and actual props

**Files to Check:**
- `ToolCard.tsx` - Props interface
- `toolsTypes.ts` - `DailyPracticeTool` interface
- Tool data structure from `toolResolver`

---

## 🔧 Diagnostic Steps

### **Step 1: Check Console Errors**
Open browser DevTools Console and look for:
- Import errors
- Type errors
- Runtime exceptions
- Undefined property access

### **Step 2: Verify Module Exports**
```javascript
// Check if exports are correct
import { allTools } from '@/tools/toolResolver';
console.log('allTools:', allTools); // Should be an array
```

### **Step 3: Check Tool Structure**
```javascript
// Verify tool structure matches DailyPracticeTool
if (allTools.length > 0) {
  console.log('First tool:', allTools[0]);
  console.log('Has id:', !!allTools[0].id);
  console.log('Has title:', !!allTools[0].title);
  console.log('Has steps:', !!allTools[0].steps);
}
```

### **Step 4: Test Component Isolation**
Temporarily comment out problematic imports to isolate the error.

---

## 🚨 Immediate Fixes to Try

### **Fix 1: Add Error Handling to ExplorePage**
```typescript
export const ExplorePage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>('All Tools');
  
  // Add safety check
  const allToolsSafe = useMemo(() => {
    try {
      return allTools || [];
    } catch (error) {
      console.error('Error loading tools:', error);
      return [];
    }
  }, []);

  const toolsForCategory = useMemo(() => {
    if (!allToolsSafe || allToolsSafe.length === 0) return [];
    if (selectedCategory === 'All Tools') return allToolsSafe;
    return allToolsSafe.filter((t) => t.category === selectedCategory);
  }, [selectedCategory, allToolsSafe]);
  
  // ... rest of component
};
```

### **Fix 2: Verify toolResolver Exports**
Ensure `toolResolver.ts` properly exports:
```typescript
export const allTools = [
  ...dailyPracticeTools,
  ...(legacyTools ?? [])
];
```

### **Fix 3: Check Import Paths**
Verify all imports use correct paths:
- `./toolsBridge` (relative)
- `@/tools/toolResolver` (alias)
- File extensions may be needed

---

## 📋 Checklist

- [ ] Check browser console for specific error message
- [ ] Verify `healerRegistry.ts` exports correctly
- [ ] Verify `ritualSequences.ts` exports correctly
- [ ] Verify `toolsBridge.ts` exports `dailyPracticeTools`
- [ ] Verify `toolResolver.ts` exports `allTools`
- [ ] Check if `allTools` is undefined at runtime
- [ ] Verify tool objects have required properties
- [ ] Check for circular import dependencies
- [ ] Verify TypeScript compilation is successful

---

## 🎯 Next Steps

1. **Check Browser Console** - Get the exact error message
2. **Add Error Boundaries** - Wrap ExplorePage in error boundary with detailed logging
3. **Add Defensive Checks** - Null/undefined checks for `allTools`
4. **Test Module Imports** - Verify each import chain works independently

---

**Status:** ⚠️ **INVESTIGATION NEEDED**  
**Priority:** High - Blocking page load

