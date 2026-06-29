# PathFinder

PathFinder is an AI-powered life and career trajectory mapping application. It allows users to record or type their professional experiences and visually map them out as an interactive flowchart, categorizing events into Education, Jobs, Achievements, Decisions, Startups, and Failures.

## Project Structure

This is a full-stack monorepo containing:
- **`frontend/`**: React Native application built with Expo SDK 56, Expo Router, and Clerk Auth.
- **`backend/`**: Python Flask backend providing API endpoints for LLM insights, text-to-speech, and translation.

## Recent Updates & Enhancements
- **UI/UX Overhaul**: Transitioned from a basic dark theme to a stunning Premium Light Theme (`#FBFBF9` Cream, `#1A202C` Navy, `#D06757` Rust/Terracotta, `#36585E` Teal). All screens, including the timeline, dashboard, and public profile, were upgraded to match the new brand identity.
- **Bug Fixes**: 
  - Resolved infinite redirect loops in Clerk authentication flows (`index.tsx` and `profile.tsx`).
  - Swapped `console.error` with `console.warn` for non-critical async/network failures to prevent disruptive Expo LogBox popups.
  - Corrected API endpoint routing logic to ensure seamless data flow.

## Setup Instructions

### Backend Setup
1. Navigate to `backend/`
2. Create a virtual environment: `python -m venv venv`
3. Activate the virtual environment.
4. Install dependencies: `pip install -r requirements.txt`
5. Run the server: `python app.py`

### Frontend Setup
1. Navigate to `frontend/`
2. Install dependencies: `npm install`
3. Configure environment variables (copy `.env.example` to `.env` and fill in Clerk keys and API URLs).
4. Run the app: `npx expo start` or `npm run web` for the web version.

## Key Features
- **Voice/Text Input**: Share your journey via text or by recording voice memos.
- **Visual Flowchart**: See your path as a node-based timeline with edges showing causality.
- **Deep Dives**: Click on any node to expand details about context, challenges, outcomes, and emotional states.
- **Public Profiles**: Share your generated Life Graph securely with others.
