# PathFinder — Frontend

Expo React Native app for PathFinder. Built with [Expo SDK 56](https://docs.expo.dev/versions/v56.0.0/), [Expo Router](https://docs.expo.dev/router/introduction/) and [Clerk](https://clerk.com/) for authentication.

## Prerequisites

- [Node.js](https://nodejs.org/) >= 18
- [Expo Go](https://expo.dev/go) app on your phone (for physical device testing)

## Recent Updates
- **UI Overhaul:** The app has been fully updated to a Premium Light Theme using a new brand palette (`#1A202C`, `#36585E`, `#D06757`, `#FBFBF9`).
- **Stability:** Fixed infinite redirect loops in authentication and swapped `console.error` for `console.warn` to prevent disruptive LogBox popups during async failures.

## Setup

1. **Navigate to the frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Then open `.env` and fill in:
   - `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` — your Clerk publishable key from [Clerk Dashboard](https://dashboard.clerk.com)
   - `EXPO_PUBLIC_API_BASE_URL` — the backend API URL (see below)

4. **Start the dev server**
   ```bash
   npx expo start
   ```

## API URL Configuration

The `EXPO_PUBLIC_API_BASE_URL` depends on how you're running the app:

| Environment | URL |
|-------------|-----|
| Web browser | `http://localhost:5000/api` |
| Android Emulator | `http://10.0.2.2:5000/api` |
| iOS Simulator | `http://127.0.0.1:5000/api` |
| Physical device (Expo Go) | `http://<YOUR_WIFI_IP>:5000/api` |

> To find your Wi-Fi IP: run `ipconfig` (Windows) or `ifconfig` (Mac/Linux) and look for your local address (e.g. `192.168.1.5`).

## Project Structure

```
frontend/
├── app/                    # Expo Router file-based routes
│   ├── _layout.tsx         # Root layout with Clerk provider
│   ├── index.tsx           # Landing / category selection
│   ├── profile.tsx         # Onboarding profile setup
│   ├── dashboard.tsx       # Personal dashboard
│   ├── query.tsx           # Voice + text query input
│   ├── results.tsx         # Results dashboard with carousel
│   ├── full-journey.tsx    # Vertical flowchart visualization
│   ├── journey-details.tsx # Expanded journey event details
│   ├── share-journey.tsx   # Chat-based journey submission
│   ├── oauth-native-callback.tsx # Clerk OAuth redirect handler
│   └── u/[username].tsx    # Public profile (dynamic route)
├── constants/
│   └── colors.ts           # Emotion & node-type color system
├── types/
│   └── schema.ts           # TypeScript interfaces for backend data
├── utils/
│   └── helpers.ts          # Milestone extraction utilities
├── assets/                 # App icons, splash screens
├── .env.example            # Environment variable template
├── app.json                # Expo config
└── package.json
```

## Key Dependencies

| Package | Purpose |
|---------|---------|
| `expo-router` | File-based routing |
| `@clerk/clerk-expo` | Authentication |
| `expo-secure-store` | Secure token storage |
| `expo-av` | Audio recording & playback |
| `expo-file-system` | Local file storage for audio |

## API Endpoints Used

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/query` | POST | Send text query (JSON) or voice audio (FormData) |
| `/api/translate` | POST | Translate AI insights to user's preferred language |
| `/api/speech` | POST | Generate text-to-speech audio for AI summary |
