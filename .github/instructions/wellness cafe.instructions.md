### 🧩 `wellcafeland.instructions.md`

````markdown
---
applyTo: "**"
---
# WELLNESSSCAFE AI – Unified Project Instructions

## 🎯 Goal
Keep **Wellcafeland** clean, consistent, and production-ready — React frontend + Firebase backend, edited in VS Code on macOS.

---

## 🧠 Coding Style
- Always wrap arrow-function parameters in parentheses.  
  ```js
  const Hero = (props)=>{return <section>{props.children}</section>;}
````

* Minimal spaces inside braces → `{like:this}`
* Use PascalCase for components, camelCase for variables and functions.
* Prefer `const` and `let`; never `var`.
* Keep components small and modular.
* Use 2-space indentation and clean JSX formatting.

**Recommended structure**

```
src/
  components/   → reusable UI parts
  Views/        → pages (HomePage.jsx etc.)
  firebase/     → config and services
  assets/       → logos, icons, images
```

---

## ⚛️ React + Firebase

### React

* Functional components only.
* Use React Hooks (`useState`, `useEffect`).
* Keep hero section ≤ 90 vh.
* Avoid inline styles — use Tailwind or CSS modules.
* Always export default.

Example:

```js
const HeroSection = ()=>{return (
  <section className="min-h-[90vh] flex items-center justify-center">
    <h1 className="text-4xl font-bold text-center">Welcome to WellnessCafe AI</h1>
  </section>
);}
export default HeroSection;
```

### Firebase

* Config in `/src/firebase/firebaseConfig.js`
* Never commit secrets — store in `.env`

  ```
  VITE_FIREBASE_API_KEY=yourKey
  VITE_FIREBASE_AUTH_DOMAIN=yourDomain
  ```
* Use `try/catch` for async calls.

  ```js
  const getUsers = async ()=>{
    try{
      const snap = await getDocs(collection(db,'users'));
      snap.forEach((doc)=>{console.log(doc.data());});
    }catch(err){
      console.error('Error loading users:', err);
    }
  };
  ```

---

## 🧾 Commits & PR Titles

Use **Conventional Commits** format:

```
<type>: <short summary>
```

**Types:** feat | fix | style | docs | deploy

Examples:

```
feat: add AI hero section and smooth scroll
fix: resolve image import path error
```

Pull request titles:

```
[Feature] Add Mindfulness Form
```

---

## 🪄 Reusable Prompts (inside Chat)

### Create New Component

````markdown
# Create React Component
Generate a new component in `src/components/`.

- Arrow function with parentheses  
- Minimal spacing inside braces  
- Use Tailwind for responsive design  
- Export default  

```js
const WellnessCard = ()=>{return (
  <div className="p-4 rounded-2xl shadow-md bg-white/80">
    <h3 className="text-lg font-semibold">Mindful Living</h3>
    <p className="text-sm">Your daily balance starts here.</p>
  </div>
);}
export default WellnessCard;
```
````

### Generate Commit Message

````markdown
# Commit Message Prompt
Format:
```
<type>: <short summary>
```
Allowed types: feat | fix | style | docs | deploy

Example:
```
fix: adjust Firebase config import
```
````

---

## 📘 Documentation

* Write in present tense and second person (“you”).
* Use active voice and short sentences.
* Tone: calm + professional.
* Include file paths and examples:

  ```bash
  npm run dev
  ```

Commit example:

```
docs: update setup section in README
```

---

## ⚙️ GitHub / CI Notes

1. Default branch → `main`
2. Ignore: `.env`, `node_modules`, `build/`
3. Optional Firebase deploy workflow:

```yaml
name: Deploy to Firebase Hosting
on:
  push:
    branches: [main]
jobs:
  build_and_deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci && npm run build
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          projectId: 'your-firebase-project-id'
```

---

## 💡 Author

**Okara Mmadu (@retrojunkjie1)**
Building WellnessCafe AI with precision, clarity, and calm focus.

```
