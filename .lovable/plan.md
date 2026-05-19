# Chronotype timing + no-repeat + Didi guidance

Three additive changes to the existing Day Card flow. No visual redesign of the card, timer, or practice library.

## 1. Chronotype timing engine

New file: `src/lib/chronotype.ts`

- `CHRONOTYPE_WINDOWS` map for `lion | bear | wolf | dolphin` → `{ peak: [h,h], second: [h,h], windDown: [h,h] }` per the spec.
- `getChronotypeWindow(chronotype)` — defaults to `bear` when missing.
- `getCurrentWindow(chronotype, date=new Date())` → `"peak" | "between" | "second" | "windDown" | "off"`. Rounds boundary times in user's favour.
- `formatPeakWindow(chronotype)` → "6am – 10am (Lion)" string.
- `BANNER_COPY` per window state.
- `PRACTICE_TIMING_TAGS: Record<practiceId, "morning" | "anytime" | "evening">` per the spec lists. Practices not listed default to `"anytime"`.
- `getTimingMismatchNote(practice, chronotype)` → returns "This works best in your morning window — but doing it now still counts." or `null`.

Practice timing does NOT swap the assignment — mood/dosha picks still win.

## 2. No-repeat practice rule

Edit `src/lib/dayProgression.ts`:

- Persist `restart_practices_used` as `{ neuro: string[], ayurveda: string[] }` in localStorage.
- New helpers:
  - `getUsedPractices()` / `markPracticeUsed(category, id)`
  - `pickUnusedFromPool(pool, usedIds, lastShownId)` — returns first unused; if pool exhausted, reset only that category's used list but exclude `lastShownId` so no back-to-back repeat.
- Update `getNeuroPractice(mood, level)` and `getAyurvedaPractice(dosha, day)`:
  - Compute the spec's first choice as today.
  - If already in used list, walk the rest of that mood row (neuro) or dosha pool (ayurveda) for an unused id; on full exhaustion, reset that category and exclude the previous day's id.
  - Mark the final pick used inside `getPracticesForDay` (single call site, so we don't double-mark).
- `lastShownId` tracked via `restart_last_practice_{category}` to enforce no back-to-back.

## 3. Day Card UI additions

Edit `src/components/journey/DayCard.tsx` (presentation only):

- Read `profile.chronotype` (default `"bear"`).
- Under the "DAY X" heading, render timing line:
  - In peak window: gold `✦ You're in your peak window right now`
  - Otherwise: muted grey `⏱ Best time for your practices: {window} ({Chronotype})`
- One banner above the practice list driven by `getCurrentWindow`:
  - peak / second / windDown → spec copy (use profile name)
  - between → no banner
- Per practice card, if `PRACTICE_TIMING_TAGS[practice.id]` doesn't match current window state, show small muted note under the card: "This works best in your morning/evening window — but doing it now still counts."

## 4. Didi guided overlay

New file: `src/components/journey/DidiGuidance.tsx`

- Props: `practice, open, onClose`.
- Reads script from `src/data/didiScripts.ts`.
- Bottom sheet overlay (above existing timer). Shows one line at a time with Before → During[] → After phases.
- Auto-advances during DURING phase pacing the practice's `durationSec` evenly across `during` lines; tap-to-advance also works. BEFORE shown until user taps "Begin", AFTER shown after timer completes (or user taps next on last DURING line).
- Does not replace or modify existing timer/start UI — overlays on top.

New file: `src/data/didiScripts.ts`

- `DIDI_SCRIPTS: Record<practiceId, { before: string; during: string[]; after: string }>` populated with all 35 scripts from the spec.
- `getDidiScript(practiceId)` returns script or `null` (no overlay if missing).

Wire into `DayCard`:

- When user taps "Start" on a practice card and a script exists, mount `<DidiGuidance>` for that practice. Keep existing Start flow intact — overlay is purely additive.

## Files touched

- new `src/lib/chronotype.ts`
- new `src/data/didiScripts.ts`
- new `src/components/journey/DidiGuidance.tsx`
- edit `src/lib/dayProgression.ts` (no-repeat rule + mark used)
- edit `src/components/journey/DayCard.tsx` (timing line, banner, mismatch note, mount DidiGuidance)

## Out of scope (flagged for follow-up)

- Push notifications (LION 6am etc.) — this app has no notification infrastructure yet. I'll add the chronotype-to-notification mapping as a constant in `chronotype.ts` but won't wire delivery. Confirm if you want me to scaffold a notifications service (web push / FCM) in a separate pass.
