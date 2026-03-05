WellnessCafe OS Review Snapshot

What this system is
- A luxury, responsive React application built with Vite and Tailwind CSS.
- Client-side routing via React Router.
- State management via Zustand.
- Firebase is used for backend services.

How to run safely (review-only)
- Use the existing scripts in package.json: `npm run dev`, `npm run build`, `npm run preview`.
- Do not run deployment or admin grant scripts in review mode: `npm run deploy`, `npm run grant:admin*`.
- Use non-production configuration and credentials when running locally.

What not to touch
- Production Firebase projects, credentials, or hosting.
- Admin grant scripts and deploy scripts.
- Any data outside this repository or environment variables not explicitly provided for review.
