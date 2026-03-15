# Phase 45 — Dynamic Learning Paths Engine (7-Tile Curriculum per Topic)

## Overview

Phase 45 transforms the Recovery Basics section from a static two-section layout ("Understanding / Reflection") into a **dynamic, cinematic, multi-layer learning journey** with:

- **7 discovery tiles** per topic
- **Short, potent insight cards** (~120–200 words) per tile
- **Multiple versions** per tile (designed for 8+ variants)
- **Non-repeating version selection** within a session
- **Navigation that feels like discovering knowledge**, not scrolling a lecture

## Architecture

### Core Files

1. **`src/engines/learningPaths/learningTopicsConfig.js`**
   - Defines all learning topics with their 7 tiles
   - Each tile has multiple versions (currently 1–2 per tile, designed for 8+)
   - Structure: `LEARNING_TOPICS[topicId] = { id, title, subtitle, tiles: [...] }`

2. **`src/engines/learningPaths/learningPathsEngine.js`**
   - Core engine (no React dependencies)
   - Functions:
     - `getTopic(topicId)` - Get topic by ID
     - `getTopicList()` - Get all topics for navigation
     - `pickTileVersion(topicId, tileId)` - Select non-repeating version
   - Uses `sessionStorage` to track last version per tile

3. **`src/hooks/useLearningPath.js`**
   - React hooks for learning paths
   - `useLearningTopics()` - Get list of all topics
   - `useLearningTopic(topicId)` - Manage single topic state (tiles, active tile, insight)

### UI Components

4. **`src/components/learning/LearningTopicTiles.jsx`**
   - 7-tile grid component
   - Shows tile label, mood badge, caption
   - Highlights active tile with amber glow
   - Responsive: 1 column on mobile, 2 columns on desktop

5. **`src/components/learning/LearningInsightPanel.jsx`**
   - Dynamic insight card that appears when tile is selected
   - Shows: breadcrumb, title, body text, reflection prompt
   - Actions: "Show me another angle" (refresh), "Back" (close)

6. **`src/components/learning/LearningPathView.jsx`**
   - Main integration component
   - Combines tiles grid + insight panel
   - Handles topic loading and state management

## Integration

### ToolDetailPage Integration

The learning paths system is integrated into `ToolDetailPage.jsx`:

- Maps content registry IDs to learning topic IDs
- Renders `LearningPathView` when a learning path topic is detected
- Falls back to old recovery basics engine for backward compatibility

### Content Registry

All 8 learning path topics are registered in `contentRegistry.js`:

- `recovery.shame-and-recovery`
- `recovery.cravings-and-urges`
- `recovery.nervous-system-regulation`
- `recovery.trauma-and-recovery`
- `recovery.sleep-and-recovery`
- `recovery.boundaries-in-recovery`
- `recovery.grief-and-loss`
- `recovery.self-compassion`

## Topics & Tiles

Each topic has exactly 7 tiles:

### Example: "Shame and Recovery"

1. **What Shame Really Is** - Foundation
2. **Where Shame Learned Its Script** - The roots
3. **The Difference Between 'I Am Bad' and 'I Did Something Bad'** - Essential distinction
4. **How Shame Lives in the Body** - Somatic awareness
5. **How Shame Sabotages Connection** - Impact on connection
6. **The Shame → Escape → Regret Loop** - Breaking cycles
7. **What Healing With Shame Looks Like** - The path forward

## Version Selection Strategy

- If tile has only 1 version → return that
- If multiple versions:
  - Avoid repeating the same version twice in a row for this tile in this session
  - Random pick among remaining versions
  - Track last version per tile in `sessionStorage`

## Content Structure

Each version includes:

```javascript
{
  versionId: "v1",
  depthLevel: 1, // 1-5, indicates depth
  title: "Shame as a Survival Strategy",
  body: "120–200 words of deep, trauma-informed content...",
  reflectionPrompt: "When you notice shame show up, what does it seem to be trying to protect you from?",
}
```

## Future Expansion

The system is designed to easily add:

- **More versions per tile**: Just add to the `versions` array in `learningTopicsConfig.js`
- **New topics**: Add to `LEARNING_TOPICS` object
- **New tiles**: Add to a topic's `tiles` array (must maintain 7 tiles per topic)

## Usage Example

```jsx
import { LearningPathView } from "@/components/learning/LearningPathView";

// In ToolDetailPage or similar:
<LearningPathView
  topicId="shame-and-recovery"
  onBack={() => navigate(-1)}
/>
```

## Design Principles

1. **Separation of Concerns**
   - Engine: Pure JS, no React
   - Hook: React adapter
   - Components: UI only

2. **Scalability**
   - Support 8+ variants per tile
   - Easy to add new topics
   - Non-fragile (text in config, not components)

3. **User Experience**
   - Feels like discovery, not lecture
   - Non-repeating versions keep content fresh
   - Cinematic, luxury visual design

## Testing

To test the learning paths:

1. Navigate to `/tools/recovery.shame-and-recovery` (or any learning path topic)
2. You should see the 7-tile grid
3. Click a tile to see the insight panel
4. Click "Show me another angle" to see a different version (if available)
5. Click "Back" to return to tiles

## Notes

- Currently, most tiles have 1–2 versions. The system is ready for 8+ variants.
- Content is placeholder-level but structurally complete.
- The old recovery basics engine is still available for backward compatibility.
- All topics are trauma-informed, clinically precise, and non-patronizing.

