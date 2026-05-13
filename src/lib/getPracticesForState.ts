/**
 * Compatibility shim around the new recommendPractices engine.
 *
 * Older code (CheckInScreen) consumed a {neuro, ayurveda, breathwork} triad.
 * We now return 1 neuro + 1 dosha-matched ayurveda + 1 breathwork practice
 * (drawn from any category where isBreathwork=true). Behaviour is preserved
 * but the underlying selection uses the new mood-vocabulary engine.
 */
import { PRACTICES, PRACTICE_BY_ID, type Practice, type Mood, type Dosha } from "@/data/practices";
import { supabase } from "@/integrations/supabase/client";
import {
  getDailyPractices,
  timeOfDayFromHour,
  type RecommendProfile,
} from "./recommendPractices";

export interface PracticeTriad {
  neuro: Practice;
  ayurveda: Practice;
  breathwork: Practice;
  lead: "neuro" | "ayurveda" | "breathwork";
}

export interface PersonalProfile {
  id?: string | null;
  chronotype?: string | null;
  path?: string | null;
  dosha?: Dosha | null;
  onboardingAnswers?: Record<string, string>;
  hour?: number;
}

// Map old check-in keys → new Mood vocabulary
const MOOD_MAP: Record<string, Mood> = {
  anxious: "anxious",
  worried: "anxious",
  stressed: "stressed",
  "under pressure": "stressed",
  overwhelmed: "overwhelmed",
  scattered: "scattered",
  low: "low",
  sad: "low",
  angry: "irritable",
  irritable: "irritable",
  frustrated: "irritable",
  focused: "focused",
  good: "good",
  energised: "good",
  energized: "good",
  numb: "flat",
  flat: "flat",
};

function toMood(key: string): Mood {
  return MOOD_MAP[(key ?? "").toString().trim().toLowerCase()] ?? "all";
}

function isPersonalProfile(v: any): v is PersonalProfile {
  return v && typeof v === "object" && (
    "chronotype" in v || "path" in v || "dosha" in v || "onboardingAnswers" in v || "hour" in v
  );
}

function pickBreathwork(
  pool: Practice[],
  exclude: Set<string>,
  fallback: Practice,
  dayNumber: number,
): Practice {
  const breath = pool.filter((p) => p.isBreathwork && !exclude.has(p.id));
  if (breath.length === 0) return fallback;
  const idx = ((Math.max(1, dayNumber) - 1) % breath.length + breath.length) % breath.length;
  return breath[idx];
}

export function getPracticesForState(
  emotionalState: string,
  day: number = 1,
  profile: PersonalProfile | Record<string, string> = {},
): PracticeTriad {
  const p: PersonalProfile = isPersonalProfile(profile)
    ? profile
    : { onboardingAnswers: profile as Record<string, string> };

  const hour = typeof p.hour === "number" ? p.hour : new Date().getHours();
  const mood = toMood(emotionalState);
  const recommendProfile: RecommendProfile = { id: p.id ?? null, dosha: p.dosha ?? null };

  const pick = getDailyPractices(recommendProfile, mood, day, hour);
  const neuro = pick.neuro ?? PRACTICES.find((x) => x.category === "Neuroscience")!;
  const ayurveda = pick.ayurveda
    ?? PRACTICES.find((x) => x.category === "Ayurveda" && (!p.dosha || x.dosha === p.dosha))
    ?? PRACTICES.find((x) => x.category === "Ayurveda")!;

  const breathwork = pickBreathwork(
    PRACTICES,
    new Set([neuro.id, ayurveda.id]),
    ayurveda,
    day,
  );

  return { neuro, ayurveda, breathwork, lead: "neuro" };
}

export function getWhyTodayLabel(day: number): string {
  const d = Number.isFinite(day) && day > 0 ? Math.floor(day) : 1;
  if (d === 1) return "Starting gentle — building the foundation";
  if (d === 2) return "Day 2 — your brain is already adapting";
  if (d === 3) return "Day 3 — this is where habits begin forming";
  if (d <= 7) return "Week 1 — reinforcing the neural pathway";
  if (d <= 14) return "Week 2 — deepening the practice";
  return "Week 3 — this is now part of who you are";
}

// History helpers — still consumed by CheckInScreen
export async function getUserPracticeHistory(userId: string): Promise<{
  shownAll: string[];
  shownRecent: string[];
}> {
  if (!userId) return { shownAll: [], shownRecent: [] };
  try {
    const since = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString();
    const { data } = await supabase
      .from("practice_history")
      .select("practice_id, shown_at")
      .eq("user_id", userId)
      .gte("shown_at", since)
      .order("shown_at", { ascending: false });
    const ids = (data ?? []).map((r: any) => r.practice_id).filter(Boolean);
    return { shownAll: ids, shownRecent: ids.slice(0, 10) };
  } catch {
    return { shownAll: [], shownRecent: [] };
  }
}

export function getPracticesForStateWithHistory(
  emotionalState: string,
  day: number,
  profile: PersonalProfile | Record<string, string>,
  history: { shownRecent: string[] },
): PracticeTriad {
  const p: PersonalProfile = isPersonalProfile(profile)
    ? profile
    : { onboardingAnswers: profile as Record<string, string> };
  const hour = typeof p.hour === "number" ? p.hour : new Date().getHours();
  const mood = toMood(emotionalState);
  const exclude = new Set(history.shownRecent ?? []);
  const recommendProfile: RecommendProfile = { id: p.id ?? null, dosha: p.dosha ?? null };
  const pick = getDailyPractices(recommendProfile, mood, day, hour, exclude);

  const neuro = pick.neuro ?? PRACTICES.find((x) => x.category === "Neuroscience")!;
  const ayurveda = pick.ayurveda
    ?? PRACTICES.find((x) => x.category === "Ayurveda" && (!p.dosha || x.dosha === p.dosha))
    ?? PRACTICES.find((x) => x.category === "Ayurveda")!;
  const breathwork = pickBreathwork(PRACTICES, new Set([neuro.id, ayurveda.id, ...exclude]), ayurveda, day);

  return { neuro, ayurveda, breathwork, lead: "neuro" };
}

export { PRACTICE_BY_ID };
