# Personalise Today's Practices by Chronotype + Path

Make `getPracticesForState` aware of the user's onboarding `path` ("ambitious" / "stressed") and `chronotype` ("lion" / "bear" / "wolf" / "dolphin"), surface that personalisation in the UI, and remove the dead Supabase fetch.

## 1. Extend `getPracticesForState` signature

File: `src/lib/getPracticesForState.ts`

Change the third argument from `onboardingAnswers` to a richer profile object:

```ts
interface PersonalProfile {
  chronotype?: "lion" | "bear" | "wolf" | "dolphin" | string | null;
  path?: "ambitious" | "stressed" | string | null;
  onboardingAnswers?: Record<string, string>;
}

export function getPracticesForState(
  emotionalState: string,
  day: number = 1,
  profile: PersonalProfile = {},
): PracticeTriad
```

Keep the existing rotation + `support_needed` / `blocker` refinements (read from `profile.onboardingAnswers`) so nothing regresses, then layer two new rules on top:

**Path-based reframing (controls which practice leads):**
- `path === "ambitious"` → ensure the lead/featured slot is the Neuroscience pick (already true; keep but tag it). Prefer Neuro IDs known as performance tools when there's a tie: `n1` (Friction Sprint), `n6` (Cold Exposure), `n7` (Identity Statement).
- `path === "stressed"` → swap so Breathwork or Ayurveda becomes the lead. Implementation: when path is "stressed", reorder the returned triad so the breathwork pick is what `PracticesScreen` passes as the `featured` (currently it uses `items[0]` which is `triad.neuro`). Easiest fix: introduce an optional `lead: "neuro" | "breathwork" | "ayurveda"` field on the returned triad and have `PracticesScreen` use it to pick `featured`.

**Chronotype-based time-of-day swap:**
Read the current hour (passed in or computed in helper) and map it to a slot:
- morning (5–11), midday (12–16), evening (17–21), night (22–4)

Rules:
- Morning types (`lion`, `bear`) → in the **morning** slot, prefer high-energy Neuro: `n6` (Cold Exposure) or `n1` (Friction Sprint).
- Evening types (`wolf`, `dolphin`) → in the **midday** slot, prefer those same high-energy picks; in the **evening/night** slot, prefer wind-down: breathwork `b3` (4-7-8) and ayurveda `a4` (Tulsi Ginger Tea) or `a1` (Haldi Doodh).

Apply these as overrides only when the rotation hasn't already picked a matching ID, so the day-to-day variety still works.

Add a small pure helper inside the file:

```ts
function slotFromHour(h: number): "morning" | "midday" | "evening" | "night"
function isMorningType(c?: string | null): boolean   // lion, bear
function isEveningType(c?: string | null): boolean   // wolf, dolphin
```

## 2. Update `getPracticesForStateWithHistory`

Same signature change — accept the new `profile` object and forward it to `getPracticesForState`.

## 3. Update `PracticesScreen.tsx`

File: `src/pages/PracticesScreen.tsx`

- Import `useApp` from `@/context/AppContext` and read `path` (fallback to `profile?.path` from `useProfile`, since context is empty after refresh).
- Read `chronotype` from `profile?.chronotype` (already in scope) with `useApp` chronotype as fallback.
- **Remove the dead query** at line 52 (`supabase.from("practices").select("*").eq("state", ci.detected_state).limit(3)`) and the now-unused `today` state. Use `ci.detected_state` directly as the mood input to `getPracticesForState`, replacing the `localStorage.getItem("restart_checkin_state")` lookup. Keep localStorage as a fallback only when `ci?.detected_state` is missing.
- Pass the new profile object to `getPracticesForState(state, day, { chronotype, path, onboardingAnswers: profile?.onboarding_answers })`.
- Use the new `triad.lead` (or path) to choose the `featured` card instead of always `items[0]`.
- Add a personalisation label under the "Today's Practices" tab, above the first card:

```
Personalised for your {CHRONOTYPE_LABEL[chronotype]} rhythm
```

Small muted text (`text-[12px] text-rs-cream/70`), only shown when `chronotype` is known.

## 4. Notes / non-goals

- No DB schema changes; reads `profiles.chronotype`, `profiles.path`, `profiles.onboarding_answers` which already exist.
- `JourneyScreen.tsx` also calls `getPracticesForState(state, d.day)` — the signature change is backwards-compatible (third arg defaults to `{}`), so it keeps working untouched.
- Library tab logic untouched.

## Files touched

- `src/lib/getPracticesForState.ts` — signature change + chronotype/path rules + `lead` field on triad
- `src/pages/PracticesScreen.tsx` — import `useApp`, drop dead fetch, use `ci.detected_state`, pass profile, render personalisation label, use `lead` for featured card
