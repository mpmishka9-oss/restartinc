# 3-Day Reset Restructure + Day 3 Completion + Google Sheets Feedback

## Scope (one consolidated pass)

### 1. Text color sweep (dark surfaces only)
Targeted files: `JourneyScreen.tsx`, `DayCard.tsx`, `DidiGuidance.tsx` (the only places using inline rgba/white text on the dark journey surfaces).

Rules applied:
- `color: "white"` / `rgba(255,255,255,0.9+)` on **titles/practice names/quote/start button/lock bar text** → `#fdfcb8`
- `rgba(255,255,255,0.4–0.7)` and grey-ish (#6a7090, #8a90a8) used for **descriptions, metadata, timestamps, best-time labels** → `#ffffff`
- Preserved as-is: category tag color (`rgba(245,225,160,0.85)`), "Mark done" button styling, "DAY X OF Y" label, all icons, navy/cream gradient backgrounds.

I will NOT touch global tokens in `index.css` (would bleed into onboarding/home which user said don't touch).

### 2. Restructure 21 → 3 days
- `src/lib/dayProgression.ts`: `TOTAL_DAYS = 3`. Remove `dayRequiresPro` paywall gating from Day 4+ (no longer relevant since whole journey is 3 days and paywall now sits BEFORE Day 1). `getPracticesForDay` already calls into existing personalisation engine — leave that logic intact (dosha + mood + chronotype mapping unchanged).
- `src/pages/JourneyScreen.tsx`: 3 milestone nodes (Regulate / Reframe / Restart) evenly spaced on the existing path. Header "Your 3-Day Reset", subtitle "Day X of 3 — keep climbing". Keep mountain SVG, path, peak star untouched.
- `DayCard.tsx`: pill tracker shows D1/D2/D3. Theme titles per day:
  - Day 1 → "Regulate"
  - Day 2 → "Reframe"
  - Day 3 → "Restart"
- Add motivational quote block per day (rendered above practices, butter-yellow text):
  - D1: "You showed up. That's already the hardest part done."
  - D2: "Something shifted yesterday. Today it goes deeper."
  - D3: "Three days. Real change. This is just where it begins."
- Day 3 "Continue" button becomes "See your reset →" → routes to new completion screen instead of Day 4.

### 3. Razorpay ₹79 gate BEFORE Day 1
- New route `/paywall` rendering existing Razorpay checkout (`src/lib/razorpay.ts`) at ₹79 (amount = 7900 paise).
- `Gate` in `App.tsx`: after onboarding_completed, if `localStorage.restartPaid !== "true"` AND target route is `/journey` or `/home`, redirect to `/paywall`. (Allow `/profile` etc through.)
- On payment success: `localStorage.setItem("restartPaid","true")` → navigate `/journey`.
- Bypass for demo users (existing demo flag).

### 4. Day 3 completion flow (2 screens + thank you)
New file `src/pages/CompletionScreen.tsx` handling 3 internal steps via local state:

**Step A — Completion**
- "DAY 3 COMPLETE" label
- "You restarted." headline (navy)
- White subtext
- Mood arc: 3 bars from `localStorage.restart_mood_d1/d2/d3` (collapsed from existing 1–10 intensity to 1–5). D3 always #fdfcb8 + tallest, D1/D2 muted navy.
- Didi card with italic butter-yellow quote
- Cream CTA → step B

**Step B — Feedback form**
- 5 questions exactly as specified (Q1 radio, Q2 text, Q3 radio, Q4 radio, Q5 textarea)
- Submit → save to Supabase + call edge function for Sheets → step C
- Inline error if fails (preserves responses)

**Step C — Thank you**
- Navy headline "Thank you.", white subtext, muted small text. No CTA.

Routing: `Day 3 complete + tasks done` → "See your reset" button navigates to `/completion`.

### 5. Database
New migration:
- `restart_feedback` table: id, user_id, q1, q2, q3, q4, q5, mood_d1, mood_d2, mood_d3, created_at + RLS (user can insert/select own).

### 6. Google Sheets edge function
New `supabase/functions/sheets-feedback/index.ts`:
- Accepts POST with user name, dosha, chronotype, mood scores, 5 answers
- Authenticates with Google service account (JWT → access token, no SDK needed — pure fetch with `jose` via npm: specifier for signing).
- Appends row to spreadsheet via Sheets API `values:append`.
- Requires secrets: `GOOGLE_SHEET_ID`, `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`.
- I will request these via add_secret AFTER you approve the plan.
- `verify_jwt = true` (user is authenticated when submitting).

Client calls `supabase.functions.invoke("sheets-feedback", { body: {...} })`. On error, still persists to `restart_feedback` table so data isn't lost, and surfaces inline retry message.

### 7. Mood capture
To populate D1/D2/D3 bars and Sheet columns E/F/G: in `CheckInScreen.tsx`, when a check-in is saved, also write `restart_mood_d{currentDay}` = intensity (1–5 normalised) to localStorage. (Minimal addition, no flow change.)

## Files touched
- `src/App.tsx` (gate + /paywall + /completion routes)
- `src/pages/JourneyScreen.tsx`
- `src/components/journey/DayCard.tsx`
- `src/components/journey/DidiGuidance.tsx` (color sweep only)
- `src/lib/dayProgression.ts` (TOTAL_DAYS=3, remove paywall)
- `src/pages/CheckInScreen.tsx` (1 line: persist mood for day)
- **new** `src/pages/PaywallScreen.tsx`
- **new** `src/pages/CompletionScreen.tsx`
- **new** `supabase/functions/sheets-feedback/index.ts`
- **new** migration for `restart_feedback`

## NOT touched
Onboarding, Didi chat/scripts, check-in flow logic, personalisation engine (`getPracticesForState`, dosha/chronotype/mood mapping), mountain visuals, navigation, fonts, sources, source links, home screen.

## Secrets needed after approval
`GOOGLE_SHEET_ID`, `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY` — I'll prompt via add_secret once you approve.
