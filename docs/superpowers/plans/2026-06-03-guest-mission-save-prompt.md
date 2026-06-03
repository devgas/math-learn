# Guest Mission Save Prompt Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let guests play missions immediately, then show a save prompt at mission end; authenticated players should write both attempt history and best-score leaderboard updates.

**Architecture:** Keep gameplay available in the main game panel for everyone. Move account actions into a separate auth surface, and add a mission summary state that appears when a run ends. On authenticated completion, the client submits one attempt record plus a leaderboard upsert so history and best score both persist.

**Tech Stack:** Next.js App Router, React, Zustand persist store, Supabase route handlers, Playwright MCP verification, TypeScript.

---

### Task 1: Add mission-end state and guest save prompt in the game shell

**Files:**
- Modify: `components/AppShell.tsx`
- Modify: `locales/en.json`
- Modify: `locales/uk.json`
- Modify: `locales/cs.json`

- [ ] **Step 1: Capture the failing flow**

Reproduce in Playwright with a seeded guest session and confirm there is no mission-end prompt after a completed run. The current behavior is that the game keeps advancing rounds without a clear completion state, so guests never see a save CTA.

- [ ] **Step 2: Add the mission summary state**

Introduce a bounded mission length in `AppShell` and a `missionComplete` state that is set after the final solved round. Render a summary panel/modal that shows:

```tsx
<div className="rounded-3xl bg-ink p-6 text-white shadow-soft">
  <p className="text-sm font-bold text-mango">{t("missionComplete")}</p>
  <h2 className="mt-2 text-3xl font-black">{t("missionCompleteTitle")}</h2>
  <p className="mt-3 max-w-md text-sm font-bold text-white/75">
    {isAuthenticated ? t("missionSavedHint") : t("missionSavePrompt")}
  </p>
</div>
```

Guests continue to be able to solve missions, but once the mission ends the prompt should explain that saving requires login or registration.

- [ ] **Step 3: Add localized copy for the summary state**

Add these keys to all three locale files with matching meaning:

```json
{
  "missionComplete": "Mission complete",
  "missionCompleteTitle": "Great run",
  "missionSavePrompt": "Want to keep your rating and progress? Register or log in.",
  "missionSavedHint": "Your result will be stored in your rating history and best score.",
  "saveRating": "Save rating",
  "loginToSave": "Log in to save",
  "continueAsGuest": "Continue as guest"
}
```

- [ ] **Step 4: Verify the guest and authenticated variants**

Run Playwright against the running dev server:

```bash
npm run dev -- --hostname 127.0.0.1 --port 3000
```

Then verify:
- guest run reaches the mission-end summary and shows the save prompt
- authenticated run reaches the same summary and shows the stored-result message instead of the guest warning
- the game still accepts answers for guests before the mission ends

---

### Task 2: Move login and registration out of the main game column

**Files:**
- Modify: `components/AppShell.tsx`
- Create: `components/AuthPanel.tsx`
- Modify: `styles/globals.css`

- [ ] **Step 1: Extract the current auth form into a dedicated panel**

Move the parent login/register form into a reusable auth panel component so the main game area no longer has a large inline form in the middle of the page.

```tsx
type AuthPanelProps = {
  email: string;
  password: string;
  loading: boolean;
  message: string;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: () => void;
};
```

- [ ] **Step 2: Render the auth panel as a sidebar on desktop and a drawer on mobile**

Keep the game itself in the main column. The auth surface should be reachable from a visible button and from the mission-end save prompt. On desktop, render it as a right-side panel. On mobile, keep it collapsible so the game remains primary.

- [ ] **Step 3: Keep guest gameplay unblocked**

Do not gate `setMode`, `setDifficulty`, `solveChallenge`, or the answer input behind auth. Only the save path and leaderboard submission should require a logged-in parent.

- [ ] **Step 4: Verify responsive layout**

Use Playwright at desktop and `390x844` to confirm there is no horizontal overflow, no clipped controls, and no overlap between the auth surface and the game panel.

---

### Task 3: Persist attempt history and best score for authenticated runs

**Files:**
- Modify: `app/api/leaderboard/route.ts`
- Modify: `database.sql`
- Modify: `types/app.ts`
- Modify: `README.md`

- [ ] **Step 1: Define the payload the client sends after a finished authenticated mission**

Use one submission that contains both the attempt details and the leaderboard summary:

```ts
type MissionResultPayload = {
  child_id: string;
  child_name: string;
  avatar: string;
  topic: string;
  difficulty: string;
  game_mode: string;
  score: number;
  accuracy: number;
  fastest_time: number;
};
```

- [ ] **Step 2: Update the route handler to write history and best score**

Change `POST /api/leaderboard` so it:
- inserts a row into `lesson_attempts` for every authenticated finished mission
- upserts `leaderboard_entries` for the same child so the leaderboard keeps the best score
- uses the service-role client when available, because the current anonymous client cannot write to the protected tables reliably

Expected behavior:
- a new mission creates a new history row every time
- the leaderboard row for that child is updated only if the submitted result is better or simply refreshed with the latest best-score view

- [ ] **Step 3: Keep demo mode harmless**

When Supabase env vars are missing, the endpoint should stay in demo mode and return a JSON payload without attempting real writes. Guest runs should never hit the write path.

- [ ] **Step 4: Document the new flow**

Update the README API section so it explains:
- guests can play without saving
- authenticated runs create history rows
- the leaderboard stores the best score for the child while also keeping attempt history in `lesson_attempts`

- [ ] **Step 5: Verify backend and app health**

Run:

```bash
npm run typecheck
npm run build
```

Then verify in Playwright:
- authenticated completion triggers the save path
- `/api/leaderboard` still returns the public leaderboard list
- a guest run does not create a saved leaderboard write

