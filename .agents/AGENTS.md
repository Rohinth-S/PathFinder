# PathFinder Workspace Rules

The following rules apply when working in the PathFinder workspace. Always adhere to these instructions.

## Git Operations: Pull Before Push
- **`upstream`**: The main team repository (`mithulcrafts/PathFinder`).
- **`origin`**: The personal fork (`Rohinth-S/PathFinder`).

To avoid recurring Git conflicts, **you MUST ALWAYS pull from the `upstream` remote's `main` branch BEFORE pushing any changes.**
- Run: `git pull upstream main`
- If you encounter merge conflicts, resolve them carefully, ensuring both frontend and backend configurations remain intact.
- After successfully pulling and merging, push your branch using `git push upstream frontend` (or `git push origin frontend` if testing on the personal fork).
- Never force push unless explicitly instructed by the user.

## Monorepo Context
- The `frontend` folder is an Expo React Native application.
- The `backend` folder is an Express.js application using Clerk for authentication.
- Any new features involving API requests must pass the user's Clerk token for authentication using `useAuth().getToken()`.
