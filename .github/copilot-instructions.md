# WellnessCafe AI - Developer Instructions

## 🎯 Project Overview

**Wellcafeland** is an AI-powered wellness platform combining addiction recovery, mindfulness therapy, yoga, acuwellness, and spiritual counseling services. Built with React 19 + Firebase, focused on holistic health and behavioral wellness with provider networks and client check-ins.

## 🏗️ Architecture

### Core Application Structure

```
src/
  ├── Views/              # Page-level components (HomePage, ProductPage, etc.)
  ├── components/         # Reusable UI (Header, Navbar, Dashboard, CheckIn)
  ├── features/           # Feature modules (auth/, providers/)
  ├── utils/              # Contexts (ThemeContext, AuthContext)
  ├── schemas/            # Firestore data models (providerSchema, eventSchema)
  ├── styles/             # Shared CSS (providers.css)
  └── assets/images/      # Static assets (panoramic images, logos)
```

### Provider Nesting

- Three-tier provider system: `/providers`, `/features/providers`, `/components/ProviderDirectory`
- **Use `/features/providers`** for new provider-related features (signup, benefits, testimonials)
- Component-level providers live in `/components` (directory view, UI elements)

### Key Design Patterns

**1. Context Providers (Nested Wrappers)**

```javascript
<AuthProvider>
  <ThemeProvider>
    <Router>
      <Navbar />
      <Routes>...</Routes>
    </Router>
  </ThemeProvider>
</AuthProvider>
```

Both `AuthProvider` and `ThemeProvider` are **always required** at app root.

**2. Protected Routes**

```javascript
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>
```

Use `ProtectedRoute` wrapper for authenticated-only pages. It auto-redirects to `/login` with return URL.

**3. Theme Toggle Pattern**

```javascript
const { toggleTheme, isDark } = useTheme();
// In render:
<button className="theme-toggle" onClick={toggleTheme}>
  {isDark ? "☀️" : "🌙"}
</button>;
```

**All provider pages** (AboutPage, ContactPage, ProviderSignup, etc.) include this button in their header.

**4. Firebase Graceful Degradation**

```javascript
// Check if db/auth exists before operations
if (db) {
  const snapshot = await getDocs(collection(db, "events"));
  // ... process data
}
```

Firebase is **temporarily disabled** (see `src/firebase.js`). Always wrap Firestore calls in `if (db)` checks.

## 🔥 Firebase Configuration

### Current State: DISABLED

```javascript
// src/firebase.js
let auth = null;
let db = null;
// Initialization commented out to prevent runtime errors
```

**Why?** Project runs in development/CI without credentials. Re-enable when `.env.local` has valid Firebase config.

### Re-enabling Firebase

1. Copy `.env.local` (already configured) to project root
2. Uncomment initialization in `src/firebase.js`
3. Restart dev server: `npm start`

### Firestore Collections

- **`providers`**: Schema in `src/schemas/providerSchema.js` - credentials, location, specialties, availability
- **`events`**: Schema in `src/schemas/eventSchema.js` - workshops, support groups, sessions
- **`users`**: User profiles, check-in history (created on Google sign-in via `AuthContext`)

## 🎨 Styling Conventions

### CSS Organization

1. **Component-scoped**: `ComponentName.css` next to `.js` file
2. **Feature-scoped**: `src/styles/providers.css` for all provider features
3. **Page-scoped**: `Views/Page.css` for shared page layouts

### Theme Variables

```css
/* Light theme (default) */
:root {
  --pv-bg: rgba(255, 255, 255, 0.9);
  --pv-text: #4a4a4a;
  --pv-button-bg: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* Dark theme */
[data-theme="dark"] {
  --pv-bg: rgba(20, 20, 30, 0.95);
  --pv-text: #e8e8e8;
  /* ... */
}
```

Use CSS custom properties for all colors. Theme toggled via `data-theme` attribute on `<html>`.

### Glassmorphism Icons

```css
.feature-icon-large {
  /* 3rem, used in feature cards */
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.15));
}
.wellness-icon-hero {
  /* Circular glass background with backdrop-filter blur */
}
```

Unified icon system in `PageTemplate.css` - always use predefined classes.

### Panoramic Images

```javascript
import PanoramicHero from "../components/PanoramicHero";
// In component:
<PanoramicHero />;
```

Displays `wellnesscafe-HomePage-header-v1.png`. Add to pages needing hero imagery (see `EventsPage.js`, `SpiritualPage.js`).

## 🧩 Component Patterns

### Page Template

```javascript
const MyPage = () => (
  <div className="page">
    <Header />
    <main className="container">
      <PanoramicHero />
      <div className="page-hero">
        <h1>Page Title</h1>
        <p>Description</p>
      </div>
      <section className="section">...</section>
    </main>
  </div>
);
```

Standard structure: Header → PanoramicHero → page-hero → sections.

### Provider Feature Pages

```javascript
const FeaturePage = () => {
  const { toggleTheme, isDark } = useTheme();
  return (
    <section className="pv-wrap">
      <div className="pv-header">
        <div>
          <h1 className="pv-title">Title</h1>
          <p className="pv-sub">Subtitle</p>
        </div>
        <button className="theme-toggle" onClick={toggleTheme}>
          {isDark ? "☀️" : "🌙"}
        </button>
      </div>
      {/* Content */}
    </section>
  );
};
```

All `/features/providers` pages follow this pattern (BenefitsDetail, ExpectationsDetail, etc.).

### Check-In Flow

```javascript
// Dashboard shows check-in card
<CheckIn
  onComplete={(data) => {
    setLastCheckIn(data);
    setCurrentView("dashboard");
  }}
/>
```

Check-in submits to Firestore `check-ins` collection with mood, energy, stress, sleep, gratitude, journal.

## 🚀 Development Workflow

### Running Locally

```bash
npm install
npm start  # Dev server on http://localhost:3000
```

### Testing

```bash
npm test   # Jest + React Testing Library
```

Two test files: `App.test.js` (smoke test), `debug.test.js` (basic validation).

### Building for Production

```bash
npm run build  # Creates optimized /build
```

Firebase deployment configuration in `firebase.json` (uses `/build` directory).

### Common Issues

**"Firebase app not initialized"**: Expected - Firebase disabled for dev. Wrap calls with `if (db)`.
**"Module not found"**: Check import paths - Views use `../components`, components use `./` or `../`.

## 📐 Routing Structure

```
/                      → HomePage (TopFold hero)
/login, /signup        → Auth flow
/dashboard             → Protected (CheckIn, Progress)
/providers             → Directory (ProviderDirectory component)
/providers/apply       → Signup form (ProviderSignup)
/providers/benefits    → Benefits detail page
/recovery, /yoga       → Service pages
/events                → EventCalendar component
/about                 → AboutPage with theme toggle
/about/leadership      → Leadership profiles
/about/contact         → Contact form
```

## 🔐 Authentication

### Hook Usage

```javascript
const { user, login, loginWithGoogle, logout, loading } = useAuth();

// Login
await login(email, password);

// Google OAuth
await loginWithGoogle(); // Creates user doc if first time

// Logout
await logout();
```

### User Document Structure

```javascript
{
  uid: "firebase_auth_uid",
  email: "user@example.com",
  displayName: "John Doe",
  photoURL: "https://...",
  createdAt: Timestamp,
  lastCheckIn: Timestamp
}
```

## 📝 Commit Conventions

Use **Conventional Commits** format:

```
feat: add panoramic hero to spiritual page
fix: resolve Firebase initialization error
style: update dark theme colors for provider cards
docs: clarify Firebase re-enable steps
```

Types: `feat | fix | style | docs | refactor | test | chore`

## 🎭 Code Style

### React

- **Functional components only** with hooks
- Arrow functions with parentheses: `const Component = () => {...}`
- Minimal spacing in objects: `{like: this, not: 'spaced'}`
- Export default at end of file

### JavaScript

- `const` and `let` only (no `var`)
- 2-space indentation
- Async/await preferred over `.then()`
- Destructure imports: `import {useState, useEffect} from 'react'`

### File Naming

- Components: PascalCase (`HomePage.js`, `CheckIn.js`)
- Utilities/contexts: camelCase (`userRoles.js`, `firebase.js`)
- Styles match component: `Dashboard.css` → `Dashboard.js`

## 🌟 Key Features to Understand

1. **Provider Network**: Multi-role system (Therapist, Yogist, Acuwellness, Sponsor). Signup form with HIPAA/CFR42 compliance notices.
2. **Event Calendar**: Filter by category, location, price. Virtual/venue/hybrid support.
3. **Check-In System**: Mood tracking (emoji selection), energy/stress/sleep ratings (1-10), gratitude + journal entries.
4. **Theme System**: Persistent via localStorage, `data-theme` attribute controls CSS variables globally.
5. **Glassmorphism UI**: Backdrop-filter blur + transparency throughout (cards, icons, buttons).

## 📚 Additional Resources

- Existing instructions: `.github/instructions/wellness cafe.instructions.md` (original style guide)
- PANORAMIC_INTEGRATION.md: Hero image implementation plan
- README.md: Firebase setup steps
