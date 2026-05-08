import { PRACTICE_BY_ID, type Practice } from "@/data/practices";
import { supabase } from "@/integrations/supabase/client";

export interface PracticeTriad {
  neuro: Practice;
  ayurveda: Practice;
  breathwork: Practice;
}

type Septet = [string, string, string, string, string, string, string];
interface StateOptions { neuro: Septet; ayurveda: Septet; breathwork: Septet }

const STATE_OPTIONS: Record<string, StateOptions> = {
  anxious:          { neuro: ["n2", "n3", "n4", "n5", "n2", "n3", "n4"], ayurveda: ["a1", "a2", "a3", "a5", "a6", "a1", "a2"], breathwork: ["b1", "b2", "b3", "b1", "b2", "b3", "b1"] },
  worried:          { neuro: ["n2", "n3", "n4", "n5", "n2", "n3", "n4"], ayurveda: ["a1", "a2", "a3", "a5", "a6", "a1", "a2"], breathwork: ["b1", "b2", "b3", "b1", "b2", "b3", "b1"] },
  stressed:         { neuro: ["n5", "n3", "n1", "n2", "n4", "n5", "n3"], ayurveda: ["a3", "a4", "a5", "a6", "a1", "a3", "a4"], breathwork: ["b2", "b1", "b3", "b2", "b1", "b3", "b2"] },
  "under pressure": { neuro: ["n5", "n3", "n1", "n2", "n4", "n5", "n3"], ayurveda: ["a3", "a4", "a5", "a6", "a1", "a3", "a4"], breathwork: ["b2", "b1", "b3", "b2", "b1", "b3", "b2"] },
  overwhelmed:      { neuro: ["n4", "n5", "n3", "n2", "n1", "n4", "n5"], ayurveda: ["a2", "a1", "a6", "a3", "a5", "a2", "a1"], breathwork: ["b1", "b3", "b2", "b1", "b3", "b2", "b1"] },
  scattered:        { neuro: ["n4", "n5", "n3", "n2", "n1", "n4", "n5"], ayurveda: ["a2", "a1", "a6", "a3", "a5", "a2", "a1"], breathwork: ["b1", "b3", "b2", "b1", "b3", "b2", "b1"] },
  low:              { neuro: ["n6", "n1", "n7", "n3", "n4", "n6", "n1"], ayurveda: ["a4", "a6", "a5", "a2", "a1", "a4", "a6"], breathwork: ["b2", "b1", "b3", "b2", "b1", "b3", "b2"] },
  sad:              { neuro: ["n6", "n1", "n7", "n3", "n4", "n6", "n1"], ayurveda: ["a4", "a6", "a5", "a2", "a1", "a4", "a6"], breathwork: ["b2", "b1", "b3", "b2", "b1", "b3", "b2"] },
  angry:            { neuro: ["n3", "n4", "n5", "n2", "n6", "n3", "n4"], ayurveda: ["a5", "a4", "a2", "a3", "a1", "a5", "a4"], breathwork: ["b2", "b3", "b1", "b2", "b3", "b1", "b2"] },
  frustrated:       { neuro: ["n3", "n4", "n5", "n2", "n6", "n3", "n4"], ayurveda: ["a5", "a4", "a2", "a3", "a1", "a5", "a4"], breathwork: ["b2", "b3", "b1", "b2", "b3", "b1", "b2"] },
  focused:          { neuro: ["n1", "n7", "n4", "n6", "n5", "n3", "n2"], ayurveda: ["a1", "a6", "a2", "a4", "a5", "a3", "a1"], breathwork: ["b2", "b1", "b3", "b1", "b2", "b3", "b1"] },
  good:             { neuro: ["n1", "n7", "n4", "n6", "n5", "n3", "n2"], ayurveda: ["a1", "a6", "a2", "a4", "a5", "a3", "a1"], breathwork: ["b2", "b1", "b3", "b1", "b2", "b3", "b1"] },
  energised:        { neuro: ["n1", "n7", "n4", "n6", "n5", "n3", "n2"], ayurveda: ["a1", "a6", "a2", "a4", "a5", "a3", "a1"], breathwork: ["b2", "b1", "b3", "b1", "b2", "b3", "b1"] },
  energized:        { neuro: ["n1", "n7", "n4", "n6", "n5", "n3", "n2"], ayurveda: ["a1", "a6", "a2", "a4", "a5", "a3", "a1"], breathwork: ["b2", "b1", "b3", "b1", "b2", "b3", "b1"] },
  numb:             { neuro: ["n6", "n1", "n3", "n7", "n4", "n6", "n1"], ayurveda: ["a5", "a3", "a4", "a2", "a6", "a5", "a3"], breathwork: ["b3", "b2", "b1", "b3", "b2", "b1", "b3"] },
  flat:             { neuro: ["n6", "n1", "n3", "n7", "n4", "n6", "n1"], ayurveda: ["a5", "a3", "a4", "a2", "a6", "a5", "a3"], breathwork: ["b3", "b2", "b1", "b3", "b2", "b1", "b3"] },
};

const DEFAULT_OPTIONS: StateOptions = {
  neuro: ["n1", "n4", "n2", "n3", "n5", "n6", "n7"],
  ayurveda: ["a1", "a2", "a4", "a3", "a5", "a6", "a1"],
  breathwork: ["b1", "b2", "b3", "b2", "b1", "b3", "b2"],
};

export function getPracticesForState(
  emotionalState: string,
  day: number = 1,
  onboardingAnswers: Record<string, string> = {},
): PracticeTriad {
  const key = (emotionalState ?? "").toString().trim().toLowerCase();
  const opts = STATE_OPTIONS[key] ?? DEFAULT_OPTIONS;
  const safeDay = Number.isFinite(day) && day > 0 ? Math.floor(day) : 1;
  const index = (safeDay - 1) % 7;

  let neuroId = opts.neuro[index];
  let ayurvedaId = opts.ayurveda[index];
  let breathworkId = opts.breathwork[index];

  const support = (onboardingAnswers.support_needed ?? "").toLowerCase();
  const blocker = (onboardingAnswers.blocker ?? "").toLowerCase();

  // support_needed refinements
  if (support.includes("tonight before sleep")) {
    breathworkId = "b3";
  }
  if (support.includes("physical")) {
    neuroId = "n6";
  }
  if (support.includes("under 5 minutes") || support.includes("quick")) {
    const shortPick = (ids: Septet, fallback: string) => {
      const found = ids.find((id) => {
        const p = PRACTICE_BY_ID[id];
        return p && (p.duration === "2 min" || p.duration === "3 min");
      });
      return found ?? fallback;
    };
    neuroId = shortPick(opts.neuro, neuroId);
    ayurvedaId = shortPick(opts.ayurveda, ayurvedaId);
    breathworkId = shortPick(opts.breathwork, breathworkId);
  }

  // blocker refinements (override neuro)
  if (blocker.includes("no energy")) neuroId = "n6";
  else if (blocker.includes("overthinking")) neuroId = "n4";
  else if (blocker.includes("avoiding")) neuroId = "n1";

  return {
    neuro: PRACTICE_BY_ID[neuroId],
    ayurveda: PRACTICE_BY_ID[ayurvedaId],
    breathwork: PRACTICE_BY_ID[breathworkId],
  };
}

export function getWhyTodayLabel(day: number): string {
  const d = Number.isFinite(day) && day > 0 ? Math.floor(day) : 1;
  if (d === 1) return "Starting gentle — building the foundation";
  if (d === 2) return "Day 2 — your brain is already adapting";
  if (d === 3) return "Day 3 — this is where habits begin forming";
  if (d <= 7) return "Week 1 — reinforcing the neural pathway";
  if (d <= 14) return "Week 2 — deepening the practice";
  if (d <= 21) return "Week 3 — this is now part of who you are";
  return "Week 3 — this is now part of who you are";
}

// ---------- History-aware practice selection ----------

/**
 * Fetches the last 7 check-ins for a user and returns a flat list of
 * practice IDs that have already been shown, plus the IDs shown in the
 * most recent 3 check-ins (treated as "very recent").
 */
export async function getUserPracticeHistory(userId: string): Promise<{
  shownAll: string[];
  shownRecent: string[];
}> {
  if (!userId) return { shownAll: [], shownRecent: [] };
  try {
    const { data, error } = await supabase
      .from("check_ins")
      .select("practices_shown, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(7);
    if (error || !data) return { shownAll: [], shownRecent: [] };

    const flat = (rows: any[]): string[] =>
      rows.flatMap((r) => {
        const ps = r?.practices_shown;
        if (Array.isArray(ps)) return ps.filter((x): x is string => typeof x === "string");
        return [];
      });

    return {
      shownAll: flat(data),
      shownRecent: flat(data.slice(0, 3)),
    };
  } catch {
    return { shownAll: [], shownRecent: [] };
  }
}

/**
 * Like getPracticesForState, but de-duplicates against the user's recent
 * history. If the rotation pick was shown in the last 3 check-ins, swap it
 * for another option from the same emotion's septet that wasn't recently shown.
 */
export function getPracticesForStateWithHistory(
  emotionalState: string,
  day: number,
  onboardingAnswers: Record<string, string>,
  history: { shownRecent: string[] },
): PracticeTriad {
  const baseTriad = getPracticesForState(emotionalState, day, onboardingAnswers);
  const key = (emotionalState ?? "").toString().trim().toLowerCase();
  const opts = STATE_OPTIONS[key] ?? DEFAULT_OPTIONS;
  const recent = new Set(history.shownRecent ?? []);

  const swap = (currentId: string, pool: Septet): string => {
    if (!recent.has(currentId)) return currentId;
    const alt = pool.find((id) => id !== currentId && !recent.has(id));
    return alt ?? currentId;
  };

  const neuroId = swap(baseTriad.neuro.id, opts.neuro);
  const ayurvedaId = swap(baseTriad.ayurveda.id, opts.ayurveda);
  const breathworkId = swap(baseTriad.breathwork.id, opts.breathwork);

  return {
    neuro: PRACTICE_BY_ID[neuroId] ?? baseTriad.neuro,
    ayurveda: PRACTICE_BY_ID[ayurvedaId] ?? baseTriad.ayurveda,
    breathwork: PRACTICE_BY_ID[breathworkId] ?? baseTriad.breathwork,
  };
}
