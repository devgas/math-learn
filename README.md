# Math Quest Kids

A modern multilingual math-learning web app for children, built with Next.js App Router, TypeScript, React Native Web compatibility, TailwindCSS, Zustand, Framer Motion, and Supabase-ready API examples.

## Features

- Mobile-first responsive dashboard for children aged 6-14.
- Parent account and child profile flow with avatar selection.
- Difficulty levels: easy, medium, hard.
- Topics: addition, subtraction, multiplication, division, fractions, geometry, logic puzzles, timed quizzes.
- Mini-games: Math Race, Space Math, Puzzle Builder, Time Attack, Memory Math, Boss Challenge.
- XP, levels, coins, streaks, achievements, daily rewards, unlockable themes, confetti celebrations.
- Global, friends, and weekly leaderboard UI with medals, accuracy, best score, and fastest time.
- i18n files in `locales/en.json`, `locales/uk.json`, and `locales/cs.json`.
- Accessibility toggles for dyslexia-friendly font, voice support, large text, high contrast, and sound effects.
- PWA manifest and service worker.
- Supabase auth and leaderboard API examples.

## Setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Supabase

The app runs in demo mode without credentials. To enable Supabase:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Run `database.sql` in the Supabase SQL editor.
If the public Supabase client is present but the service role key is missing, mission saves stay in demo mode and do not write to the database.

## API Examples

- `POST /api/auth`
  - Body: `{ "email": "parent@example.com", "password": "secret", "childName": "Child", "avatar": "rocket" }`
- `GET /api/leaderboard`
- `POST /api/leaderboard`
  - Body: `{ "child_id": "...", "child_name": "Child", "avatar": "rocket", "topic": "addition", "difficulty": "easy", "game_mode": "race", "score": 0, "accuracy": 0, "fastest_time": 0 }`
  - Guest runs stay in demo mode and do not write to Supabase.
  - Authenticated runs insert a `lesson_attempts` row for each finished mission and upsert the child's best `leaderboard_entries` row when the submitted result improves the current best.

## Architecture

- `app/` - App Router pages and API routes.
- `components/` - reusable UI components.
- `config/` - game modes, topics, achievements, default empty leaderboard data.
- `lib/` - i18n, Supabase client, math generation, Zustand store.
- `locales/` - translation dictionaries.
- `types/` - shared TypeScript models.
- `public/` - PWA assets.

## Production Notes

- Replace demo auth UI with Supabase session-aware forms.
- Add server-side row-level policies for lesson attempts and leaderboard writes.
- Add sound files under `public/sounds` and trigger them behind the sound effects setting.
- Add real AI recommendations by sending attempt history to a recommendation service.
