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
    name: "Brahmi Tea",
    category: "Ayurveda",
    duration: "5 min",
    description:
      "Bacopa monnieri improves synaptic transmission and reduces anxiety-linked cognitive disturbances. Clinical effect builds over 8 weeks.",
    protocol: "Brew 1 tsp dried Brahmi in hot water 8 minutes. Strain. Drink before work.",
    emotionTargets: ["anxiety fog", "poor memory", "performance anxiety"],
  },
  {
    id: "a2",
    name: "Nasya Oil Drops",
    category: "Ayurveda",
    duration: "3 min",
    description:
      "Nasal oil delivery crosses the blood-brain barrier and clears glymphatic channels — the brain's waste clearance system linked to brain fog.",
    protocol:
      "Lie flat, tilt head back. 2 drops warm sesame oil each nostril. Breathe deeply 5 minutes.",
    emotionTargets: ["brain fog", "mental sluggishness", "emotional numbness"],
  },
  {
    id: "a3",
    name: "Shankhpushpi Milk",
    category: "Ayurveda",
    duration: "5 min",
    description:
      "Directly suppresses cortisol and adrenaline production. One of the few herbs clinically shown to reduce stress hormones rather than just calming downstream.",
    protocol: "1 tsp Shankhpushpi powder in warm milk. Drink 30 min before bed.",
    emotionTargets: ["racing mind", "poor sleep", "elevated cortisol"],
  },
  {
    id: "a4",
    name: "Tulsi Adaptogen Tea",
    category: "Ayurveda",
    duration: "5 min",
    description:
      "True adaptogen — regulates stress hormones up or down as needed. Balances serotonin and dopamine simultaneously via eugenol compounds.",
    protocol: "Brew 7–10 fresh Tulsi leaves in hot water 5 minutes. Drink at 3–4pm.",
    emotionTargets: ["afternoon crash", "irritability", "emotional swings"],
  },
  {
    id: "a5",
    name: "Shiro Abhyanga Scalp Massage",
    category: "Ayurveda",
    duration: "10 min",
    description:
      "Stimulates cerebral blood circulation and activates the vagus nerve via occipital pressure points. Reduces Vata — the anxiety-linked dosha.",
    protocol:
      "Warm 2 tbsp Brahmi Taila oil. Slow circular massage into scalp 10 min before shower.",
    emotionTargets: ["tension headaches", "mental fatigue", "anxiety tension"],
  },
  {
    id: "a6",
    name: "Ghee + Turmeric Brain Fuel",
    category: "Ayurveda",
    duration: "3 min",
    description:
      "Curcumin crosses the blood-brain barrier and reduces neuroinflammation — the hidden driver of brain fog and low mood. Black pepper increases absorption 2000%.",
    protocol:
      "1 tsp A2 ghee + ¼ tsp turmeric + pinch black pepper in warm milk. Take at breakfast.",
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
