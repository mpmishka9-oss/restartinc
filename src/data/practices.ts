// Practice catalog cleared — new content will replace this.
// Keep types + a single placeholder to avoid runtime crashes
// in any code path still referencing PRACTICE_BY_ID.

export type PracticeCategory = "Neuroscience" | "Ayurveda" | "Breathwork";

export interface Practice {
  id: string;
  name: string;
  category: PracticeCategory;
  duration: string;
  description: string;
  protocol: string;
  emotionTargets: string[];
}

const PLACEHOLDER: Practice = {
  id: "placeholder",
  name: "Coming soon",
  category: "Neuroscience",
  duration: "—",
  description: "New practices are being prepared.",
  protocol: "",
  emotionTargets: [],
};

export const PRACTICES: Practice[] = [];

export const PRACTICE_BY_ID: Record<string, Practice> = new Proxy(
  {} as Record<string, Practice>,
  { get: () => PLACEHOLDER },
);
