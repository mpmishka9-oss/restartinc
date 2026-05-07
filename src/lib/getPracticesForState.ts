import { PRACTICE_BY_ID, type Practice } from "@/data/practices";

export interface PracticeTriad {
  neuro: Practice;
  ayurveda: Practice;
  breathwork: Practice;
}

type Triplet = [string, string, string];
interface StateOptions { neuro: Triplet; ayurveda: Triplet; breathwork: Triplet }

const STATE_OPTIONS: Record<string, StateOptions> = {
  anxious:        { neuro: ["n2", "n3", "n4"], ayurveda: ["a1", "a2", "a3"], breathwork: ["b1", "b2", "b3"] },
  worried:        { neuro: ["n2", "n3", "n4"], ayurveda: ["a1", "a2", "a3"], breathwork: ["b1", "b2", "b3"] },
  stressed:       { neuro: ["n5", "n3", "n1"], ayurveda: ["a3", "a4", "a5"], breathwork: ["b2", "b1", "b3"] },
  "under pressure": { neuro: ["n5", "n3", "n1"], ayurveda: ["a3", "a4", "a5"], breathwork: ["b2", "b1", "b3"] },
  overwhelmed:    { neuro: ["n4", "n5", "n3"], ayurveda: ["a2", "a1", "a6"], breathwork: ["b1", "b3", "b2"] },
  scattered:      { neuro: ["n4", "n5", "n3"], ayurveda: ["a2", "a1", "a6"], breathwork: ["b1", "b3", "b2"] },
  low:            { neuro: ["n6", "n1", "n7"], ayurveda: ["a4", "a6", "a5"], breathwork: ["b2", "b1", "b3"] },
  sad:            { neuro: ["n6", "n1", "n7"], ayurveda: ["a4", "a6", "a5"], breathwork: ["b2", "b1", "b3"] },
  angry:          { neuro: ["n3", "n4", "n5"], ayurveda: ["a5", "a4", "a2"], breathwork: ["b2", "b3", "b1"] },
  frustrated:     { neuro: ["n3", "n4", "n5"], ayurveda: ["a5", "a4", "a2"], breathwork: ["b2", "b3", "b1"] },
  focused:        { neuro: ["n1", "n7", "n4"], ayurveda: ["a1", "a6", "a2"], breathwork: ["b2", "b1", "b3"] },
  good:           { neuro: ["n1", "n7", "n4"], ayurveda: ["a1", "a6", "a2"], breathwork: ["b2", "b1", "b3"] },
  energised:      { neuro: ["n1", "n7", "n4"], ayurveda: ["a1", "a6", "a2"], breathwork: ["b2", "b1", "b3"] },
  energized:      { neuro: ["n1", "n7", "n4"], ayurveda: ["a1", "a6", "a2"], breathwork: ["b2", "b1", "b3"] },
  numb:           { neuro: ["n6", "n1", "n3"], ayurveda: ["a5", "a3", "a4"], breathwork: ["b3", "b2", "b1"] },
  flat:           { neuro: ["n6", "n1", "n3"], ayurveda: ["a5", "a3", "a4"], breathwork: ["b3", "b2", "b1"] },
};

const DEFAULT_OPTIONS: StateOptions = {
  neuro: ["n1", "n4", "n2"],
  ayurveda: ["a1", "a2", "a4"],
  breathwork: ["b1", "b2", "b3"],
};

export function getPracticesForState(emotionalState: string, day: number = 1): PracticeTriad {
  const key = (emotionalState ?? "").toString().trim().toLowerCase();
  const opts = STATE_OPTIONS[key] ?? DEFAULT_OPTIONS;
  const safeDay = Number.isFinite(day) && day > 0 ? Math.floor(day) : 1;
  const index = (safeDay - 1) % 3;
  return {
    neuro: PRACTICE_BY_ID[opts.neuro[index]],
    ayurveda: PRACTICE_BY_ID[opts.ayurveda[index]],
    breathwork: PRACTICE_BY_ID[opts.breathwork[index]],
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
