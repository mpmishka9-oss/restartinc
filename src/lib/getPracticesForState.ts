// Practice selection logic stubbed out — original neuroscience / ayurveda /
// breathwork content has been removed. New solution catalog will replace this.

import type { Practice } from "@/data/practices";

export interface PracticeTriad {
  neuro: Practice;
  ayurveda: Practice;
  breathwork: Practice;
  lead: "neuro" | "ayurveda" | "breathwork";
}

export interface PersonalProfile {
  chronotype?: string | null;
  path?: string | null;
  onboardingAnswers?: Record<string, string>;
  hour?: number;
}

const STUB = (category: Practice["category"]): Practice => ({
  id: "placeholder",
  name: "Coming soon",
  category,
  duration: "—",
  description: "New practice content is being prepared.",
  protocol: "",
  emotionTargets: [],
});

export function getPracticesForState(): PracticeTriad {
  return {
    neuro: STUB("Neuroscience"),
    ayurveda: STUB("Ayurveda"),
    breathwork: STUB("Breathwork"),
    lead: "neuro",
  };
}

export function getWhyTodayLabel(day: number): string {
  const d = Number.isFinite(day) && day > 0 ? Math.floor(day) : 1;
  if (d <= 3) return "Building the foundation";
  if (d <= 7) return "Week 1 — reinforcing the pathway";
  if (d <= 14) return "Week 2 — deepening the practice";
  return "Week 3 — this is now part of who you are";
}

export async function getUserPracticeHistory(_userId: string) {
  return { shownAll: [] as string[], shownRecent: [] as string[] };
}

export function getPracticesForStateWithHistory(): PracticeTriad {
  return getPracticesForState();
}
