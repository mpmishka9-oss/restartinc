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

export const PRACTICES: Practice[] = [
  {
    id: "n1",
    name: "Friction Sprint",
    category: "Neuroscience",
    duration: "10 min",
    description:
      "Start the one task you've been avoiding — no warm-up, no preparation. The aMCC (willpower centre) only grows when you do things you don't want to do.",
    protocol: "Set a 10-min timer. Open the avoided task immediately. Do not prepare first.",
    emotionTargets: ["procrastination", "low willpower", "avoidance"],
  },
  {
    id: "n2",
    name: "Physiological Sigh",
    category: "Neuroscience",
    duration: "2 min",
    description:
      "Double inhale through the nose, long exhale through the mouth. Proven to lower cortisol faster than any other breathing pattern.",
    protocol: "2 sharp inhales through nose, 1 long exhale through mouth. Repeat 5 times.",
    emotionTargets: ["anxiety", "stress", "overwhelm"],
  },
  {
    id: "n3",
    name: "Observer Perspective Bridging",
    category: "Neuroscience",
    duration: "5 min",
    description:
      "Describe yourself in third person for 60 seconds. Reduces emotional intensity by 30–40% and preserves executive function under stress (Kross et al.).",
    protocol: "Say out loud: '[Your name] is feeling X because Y.' Repeat for 60 seconds.",
    emotionTargets: ["emotional overwhelm", "anger", "anxiety escalation"],
  },
  {
    id: "n4",
    name: "Single-Sense Focus Drill",
    category: "Neuroscience",
    duration: "3 min",
    description:
      "Focus only on sounds for 3 minutes. Trains selective attention and suppresses the Default Mode Network responsible for rumination.",
    protocol: "Close eyes. Identify every sound. Name it, locate it, note its quality.",
    emotionTargets: ["distraction", "mind wandering", "overthinking"],
  },
  {
    id: "n5",
    name: "Cognitive Reappraisal Journal",
    category: "Neuroscience",
    duration: "5 min",
    description:
      "Reframe a stressful event at the meaning level — not what you feel but what it means in context. Strengthens PFC–amygdala regulation.",
    protocol:
      "Write 3 sentences: what happened, what it means in the bigger picture, one thing it teaches you.",
    emotionTargets: ["stress spirals", "overthinking", "emotional reactivity"],
  },
  {
    id: "n6",
    name: "Deliberate Cold Exposure",
    category: "Neuroscience",
    duration: "2 min",
    description:
      "Cold water on face and wrists for 2 minutes. Produces a 300% norepinephrine spike for focus lasting 3–6 hours.",
    protocol:
      "Run cold water on both wrists and splash face for 2 full minutes. Do not enjoy it — the discomfort is the medicine.",
    emotionTargets: ["low energy", "burnout", "motivational deficit"],
  },
  {
    id: "n7",
    name: "Identity Statement Read-Aloud",
    category: "Neuroscience",
    duration: "5 min",
    description:
      "Read your opposite identity statement aloud for 5 minutes. Begins remyelination of new identity pathways in the medial PFC.",
    protocol:
      "Write: 'I am someone who [positive opposite of limiting belief].' Read aloud slowly, 5 minutes. Log 3 daily proofs afterward.",
    emotionTargets: ["imposter syndrome", "self-sabotage", "fixed mindset"],
  },
  {
    id: "a1",
    name: "Haldi Doodh (Turmeric Milk)",
    category: "Ayurveda",
    duration: "5 min",
    description:
      "Reduces neuroinflammation and supports serotonin production. Built from ingredients in every Indian kitchen.",
    protocol:
      "Warm 1 cup milk. Add ¼ tsp turmeric, pinch of black pepper, 1 tsp jaggery. Simmer 3 min. Sip slowly.",
    emotionTargets: ["low mood", "neuroinflammation", "poor sleep"],
  },
  {
    id: "a2",
    name: "Ajwain Steam Inhale",
    category: "Ayurveda",
    duration: "3 min",
    description:
      "Clears nasal passages, improves oxygen flow to the brain, and reduces Vata. Ajwain (carom seeds) sits in every Indian kitchen.",
    protocol:
      "Boil 2 cups water with 1 tsp ajwain. Cover head with towel and inhale steam for 3 minutes.",
    emotionTargets: ["brain fog", "mental sluggishness", "anxiety tension"],
  },
  {
    id: "a3",
    name: "Jeera Saunf Water",
    category: "Ayurveda",
    duration: "5 min",
    description:
      "Regulates cortisol, supports the gut-brain axis, and eases bloating-linked anxiety.",
    protocol:
      "Boil ½ tsp jeera (cumin) + ½ tsp saunf (fennel) in 2 cups water for 5 min. Strain and drink warm.",
    emotionTargets: ["elevated cortisol", "gut-linked anxiety", "racing mind"],
  },
  {
    id: "a4",
    name: "Tulsi Ginger Tea",
    category: "Ayurveda",
    duration: "5 min",
    description:
      "True adaptogen — regulates stress hormones up or down as needed. Tulsi grows in most Indian homes; ginger is a kitchen staple.",
    protocol:
      "Steep 7–10 fresh (or 1 tsp dried) tulsi leaves with ½ inch crushed ginger in hot water 5 min. Add honey. Drink at 3–4pm.",
    emotionTargets: ["afternoon crash", "irritability", "emotional swings"],
  },
  {
    id: "a5",
    name: "Coconut Oil Scalp Press",
    category: "Ayurveda",
    duration: "5 min",
    description:
      "Activates the vagus nerve via occipital pressure and reduces Vata — the anxiety-linked dosha. Coconut oil is universal in Indian households.",
    protocol:
      "Warm 3–4 drops coconut oil. Massage slow circles into temples and back of skull for 5 minutes.",
    emotionTargets: ["tension headaches", "mental fatigue", "anxiety tension"],
  },
  {
    id: "a6",
    name: "Ghee + Pepper Brain Fuel",
    category: "Ayurveda",
    duration: "3 min",
    description:
      "Ghee carries fat-soluble compounds across the blood-brain barrier; black pepper boosts absorption and reduces neuroinflammation. Both universal in Indian cooking.",
    protocol:
      "1 tsp desi ghee + pinch of black pepper stirred into warm water or milk. Sip at breakfast.",
    emotionTargets: ["brain fog", "low mood", "poor memory"],
  },
  {
    id: "b1",
    name: "Nadi Shodhana",
    category: "Breathwork",
    duration: "5 min",
    description:
      "Alternate nostril breathing physically balances left and right brain hemispheres. Restores coherent brainwave state within 4–8 minutes.",
    protocol: "Close right nostril, inhale left. Close left, exhale right. Repeat 10 cycles.",
    emotionTargets: ["anxiety", "cognitive decline mid-task", "creative block"],
  },
  {
    id: "b2",
    name: "Box Breathing",
    category: "Breathwork",
    duration: "4 min",
    description:
      "4-4-4-4 pattern activates the parasympathetic nervous system and signals safety to the amygdala. Used by Navy SEALs for high-pressure performance.",
    protocol: "Inhale 4 counts. Hold 4. Exhale 4. Hold 4. Repeat 6 cycles.",
    emotionTargets: ["stress", "performance anxiety", "pre-meeting nerves"],
  },
  {
    id: "b3",
    name: "4-7-8 Wind Down",
    category: "Breathwork",
    duration: "5 min",
    description:
      "Exhale is nearly double the inhale — this ratio maximally activates the vagus nerve and drops heart rate within 3 cycles.",
    protocol: "Inhale 4 counts. Hold 7. Exhale 8 counts. Repeat 5 cycles before bed.",
    emotionTargets: ["racing mind at night", "insomnia", "overthinking before sleep"],
  },
];

export const PRACTICE_BY_ID: Record<string, Practice> = PRACTICES.reduce(
  (acc, p) => ({ ...acc, [p.id]: p }),
  {} as Record<string, Practice>,
);

export const CATEGORY_COLORS: Record<PracticeCategory, string> = {
  Neuroscience: "#7B9BD6",
  Ayurveda: "#1D9E75",
  Breathwork: "#7F77DD",
};
