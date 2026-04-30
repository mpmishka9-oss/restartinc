import { PRACTICE_BY_ID, type Practice } from "@/data/practices";

export interface PracticeTriad {
  neuro: Practice;
  ayurveda: Practice;
  breathwork: Practice;
}

const STATE_MAP: Record<string, { neuro: string; ayurveda: string; breathwork: string }> = {
  anxious: { neuro: "n2", ayurveda: "a1", breathwork: "b1" },
  worried: { neuro: "n2", ayurveda: "a1", breathwork: "b1" },
  stressed: { neuro: "n3", ayurveda: "a3", breathwork: "b2" },
  "under pressure": { neuro: "n3", ayurveda: "a3", breathwork: "b2" },
  overwhelmed: { neuro: "n4", ayurveda: "a2", breathwork: "b1" },
  scattered: { neuro: "n4", ayurveda: "a2", breathwork: "b1" },
  low: { neuro: "n6", ayurveda: "a4", breathwork: "b3" },
  sad: { neuro: "n6", ayurveda: "a4", breathwork: "b3" },
  angry: { neuro: "n3", ayurveda: "a5", breathwork: "b2" },
  frustrated: { neuro: "n3", ayurveda: "a5", breathwork: "b2" },
  lost: { neuro: "n5", ayurveda: "a6", breathwork: "b1" },
  confused: { neuro: "n5", ayurveda: "a6", breathwork: "b1" },
  focused: { neuro: "n1", ayurveda: "a1", breathwork: "b2" },
  good: { neuro: "n1", ayurveda: "a1", breathwork: "b2" },
  energised: { neuro: "n7", ayurveda: "a6", breathwork: "b2" },
  energized: { neuro: "n7", ayurveda: "a6", breathwork: "b2" },
};

const DEFAULT_IDS = { neuro: "n1", ayurveda: "a2", breathwork: "b1" };

export function getPracticesForState(emotionalState: string): PracticeTriad {
  const key = (emotionalState ?? "").toString().trim().toLowerCase();
  const ids = STATE_MAP[key] ?? DEFAULT_IDS;
  return {
    neuro: PRACTICE_BY_ID[ids.neuro],
    ayurveda: PRACTICE_BY_ID[ids.ayurveda],
    breathwork: PRACTICE_BY_ID[ids.breathwork],
  };
}
