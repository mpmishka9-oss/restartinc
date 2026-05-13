import { supabase } from "@/integrations/supabase/client";
import { PRACTICES, PRACTICE_BY_ID, type Practice, type Dosha, type Mood, type TimeOfDay } from "@/data/practices";

export interface RecommendProfile {
  id?: string | null;
  dosha?: Dosha | null;
}

export function timeOfDayFromHour(hour: number): TimeOfDay {
  if (hour >= 5 && hour < 11) return "morning";
  if (hour >= 11 && hour < 16) return "midday";
  if (hour >= 16 && hour < 22) return "evening";
  return "anytime";
}

const NEURO_POOL = PRACTICES.filter((p) => p.category === "Neuroscience");

const ayurvedaPool = (dosha: Dosha | null | undefined) =>
  PRACTICES.filter((p) => p.category === "Ayurveda" && p.dosha === dosha);

function rotate<T>(pool: T[], dayNumber: number): T[] {
  if (pool.length === 0) return [];
  const start = ((Math.max(1, dayNumber) - 1) % pool.length + pool.length) % pool.length;
  return [...pool.slice(start), ...pool.slice(0, start)];
}

function pickFromPool(pool: Practice[], opts: {
  mood: Mood;
  timeBucket: TimeOfDay;
  exclude: Set<string>;
  dayNumber: number;
}): Practice | null {
  const { mood, timeBucket, exclude, dayNumber } = opts;
  // 1) mood filter (treat "all" as wildcard match on either side)
  const moodMatch = pool.filter(
    (p) => mood === "all" || p.targetMoods.includes(mood) || p.targetMoods.includes("all"),
  );
  // 2) time-of-day filter
  const timeMatch = (arr: Practice[]) =>
    arr.filter((p) => p.timeOfDay.includes(timeBucket) || p.timeOfDay.includes("anytime"));
  const tiers = [
    timeMatch(moodMatch).filter((p) => !exclude.has(p.id)),
    moodMatch.filter((p) => !exclude.has(p.id)),
    timeMatch(pool).filter((p) => !exclude.has(p.id)),
    pool.filter((p) => !exclude.has(p.id)),
    moodMatch,
    pool,
  ];
  for (const tier of tiers) {
    if (tier.length > 0) return rotate(tier, dayNumber)[0];
  }
  return null;
}

/**
 * Returns up to 5 days of recently shown practice IDs for this user.
 */
export async function getRecentPracticeIds(userId: string | null | undefined, days = 5): Promise<Set<string>> {
  if (!userId) return new Set();
  try {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    const { data, error } = await supabase
      .from("practice_history")
      .select("practice_id")
      .eq("user_id", userId)
      .gte("shown_at", since);
    if (error || !data) return new Set();
    return new Set(data.map((r: any) => r.practice_id).filter(Boolean));
  } catch {
    return new Set();
  }
}

/**
 * Persist the two chosen practice IDs as today's recommendation.
 */
export async function recordPracticeHistory(
  userId: string | null | undefined,
  dayNumber: number,
  practiceIds: string[],
): Promise<void> {
  if (!userId || practiceIds.length === 0) return;
  try {
    const rows = practiceIds.map((pid) => ({
      user_id: userId,
      practice_id: pid,
      day_number: dayNumber,
    }));
    await supabase.from("practice_history").insert(rows as any);
  } catch {
    // soft-fail
  }
}

export interface DailyPick {
  neuro: Practice | null;
  ayurveda: Practice | null;
}

/**
 * Core matching engine. Returns 1 neuro + 1 ayurveda practice for the user's
 * dosha, filtered by mood and time-of-day, excluding the last `excludeIds`,
 * rotated by dayNumber for variety across the 21-day journey.
 *
 * Pure function — does NOT write to DB. Use recordPracticeHistory after.
 */
export function getDailyPractices(
  profile: RecommendProfile,
  mood: Mood,
  dayNumber: number,
  currentHour: number,
  excludeIds: Set<string> = new Set(),
): DailyPick {
  const timeBucket = timeOfDayFromHour(currentHour);
  const dosha = profile.dosha ?? null;

  const neuro = pickFromPool(NEURO_POOL, { mood, timeBucket, exclude: excludeIds, dayNumber });
  const ayurveda = pickFromPool(ayurvedaPool(dosha), { mood, timeBucket, exclude: excludeIds, dayNumber });
  return { neuro, ayurveda };
}

/**
 * Async wrapper: pulls the user's last-5-days history, picks 2 practices,
 * and writes them back to practice_history. Used by Didi check-in.
 */
export async function recommendAndRecord(
  profile: RecommendProfile,
  mood: Mood,
  dayNumber: number,
  currentHour: number = new Date().getHours(),
): Promise<DailyPick> {
  const exclude = await getRecentPracticeIds(profile.id);
  const pick = getDailyPractices(profile, mood, dayNumber, currentHour, exclude);
  const ids = [pick.neuro?.id, pick.ayurveda?.id].filter((x): x is string => !!x);
  await recordPracticeHistory(profile.id, dayNumber, ids);
  return pick;
}

/**
 * Baseline (mood-agnostic) curriculum pick for a given day. Used by Journey screen.
 * No DB writes; deterministic per (dosha, dayNumber).
 */
export function getBaselinePractices(
  dosha: Dosha | null | undefined,
  dayNumber: number,
): DailyPick {
  const neuroRotated = rotate(NEURO_POOL, dayNumber)[0] ?? null;
  const ayurRotated = rotate(ayurvedaPool(dosha), dayNumber)[0] ?? null;
  return { neuro: neuroRotated, ayurveda: ayurRotated };
}

export { PRACTICES, PRACTICE_BY_ID };
