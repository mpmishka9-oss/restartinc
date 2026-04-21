import type { OnboardingData } from "@/components/OnboardingFlow";
import type { ReflectiveData } from "@/components/ReflectiveQuestions";

export type Chronotype = "Lion" | "Bear" | "Owl" | "Dolphin";
export type Scores = Record<Chronotype, number>;

const empty = (): Scores => ({ Lion: 0, Bear: 0, Owl: 0, Dolphin: 0 });

const add = (s: Scores, type: Chronotype, n: number) => {
  s[type] += n;
};

// ----- AMBITIOUS / PRODUCTIVITY PATH -----
// Note: the spec references some questions that don't exist verbatim in the flow.
// Per user direction, map each scoring rule to the closest existing question.
//   Spec Q1 (Challenge pattern)  -> flow "What's slowing you down" (slowingDown)
//   Spec Q2 (Energy today)       -> energyToday
//   Spec Q3 (Feeling about work) -> goalsFeeling (multi)
//   Spec Q4 (Clarity)            -> clarityToday
//   Spec Q5 (What's slowing you) -> slowingDown (multi) — also drives Q1
//   Spec Q6 (How are you working)-> workingMode
//   Spec Q7 (Workload)           -> workload
//   Spec Q8 (Goal for today)     -> successLook (closest match)
//   Spec Q9 (Time available)     -> focusTime
//   Spec Q10 (Support needed)    -> productivitySupport
function scoreAmbitious(d: ReflectiveData): Scores {
  const s = empty();

  // Q1 — Challenge pattern (mapped from slowingDown items)
  d.slowingDown.forEach((opt) => {
    if (opt.includes("Distractions")) {
      add(s, "Dolphin", 2);
      add(s, "Owl", 1);
    } else if (opt.includes("Overthinking")) {
      // "overwork / can't switch off" closest = perfectionism
      add(s, "Lion", 2);
      add(s, "Dolphin", 1);
    } else if (opt.includes("Procrastination")) {
      add(s, "Owl", 2);
      add(s, "Bear", 1);
    }
  });

  // Q2 — Energy today
  switch (d.energyToday) {
    case "High - ready to go": add(s, "Lion", 2); break;
    case "Decent - can work, but not at my peak": add(s, "Bear", 2); break;
    case "Low - struggling to get started": add(s, "Owl", 2); break;
    case "Drained - no motivation": add(s, "Dolphin", 2); break;
  }

  // Q3 — Feeling about work (multi)
  d.goalsFeeling.forEach((opt) => {
    switch (opt) {
      case "Driven": add(s, "Lion", 2); break;
      case "Pressured": add(s, "Lion", 1); add(s, "Dolphin", 1); break;
      case "Stuck": add(s, "Owl", 2); break;
      case "Overwhelmed / stressed": add(s, "Dolphin", 2); break;
      case "Unfocused": add(s, "Owl", 2); add(s, "Bear", 1); break;
      case "Indifferent": add(s, "Bear", 2); break;
      case "Unsure": add(s, "Dolphin", 1); add(s, "Bear", 1); break;
    }
  });

  // Q4 — Clarity
  switch (d.clarityToday) {
    case "Very clear - I know exactly what to do": add(s, "Lion", 2); break;
    case "Somewhat clear - but not fully structured": add(s, "Bear", 2); break;
    case "Vague - I have ideas but no clear plan": add(s, "Owl", 1); add(s, "Dolphin", 1); break;
    case "No clarity - I feel lost": add(s, "Dolphin", 2); break;
  }

  // Q5 — What's slowing you (multi)
  d.slowingDown.forEach((opt) => {
    if (opt.startsWith("Distractions")) { add(s, "Owl", 2); add(s, "Bear", 1); }
    else if (opt.startsWith("Overthinking")) { add(s, "Dolphin", 3); }
    else if (opt.startsWith("Low energy")) { add(s, "Owl", 2); }
    else if (opt.startsWith("Too many things")) { add(s, "Bear", 1); add(s, "Dolphin", 1); }
    else if (opt.startsWith("Lack of direction")) { add(s, "Owl", 2); }
    else if (opt.startsWith("Procrastination")) { add(s, "Owl", 2); }
  });

  // Q6 — How are you working
  switch (d.workingMode) {
    case "Deep focus - locked in": add(s, "Lion", 2); break;
    case "Starting and stopping frequently": add(s, "Bear", 1); add(s, "Dolphin", 1); break;
    case "Avoiding / delaying tasks": add(s, "Owl", 2); break;
    case "Busy, but not making real progress": add(s, "Bear", 1); add(s, "Dolphin", 1); break;
  }

  // Q7 — Workload
  switch (d.workload) {
    case "Under control": add(s, "Lion", 2); break;
    case "Slightly heavy but manageable": add(s, "Bear", 2); break;
    case "Overloaded": add(s, "Dolphin", 1); add(s, "Lion", 1); break;
    case "Chaotic - I don't know where to start": add(s, "Dolphin", 2); break;
  }

  // Q8 — Goal for today (mapped from successLook)
  switch (d.successLook) {
    case "Crushing a key deliverable": add(s, "Lion", 2); break;
    case "Making meaningful progress on a big goal": add(s, "Lion", 1); add(s, "Bear", 1); break;
    case "Clearing the noise so I can focus": add(s, "Bear", 2); break;
    case "Honestly, just getting unstuck": add(s, "Owl", 2); break;
  }

  // Q9 — Focus time
  switch (d.focusTime) {
    case "60+ minutes": add(s, "Lion", 2); break;
    case "30–60 minutes": add(s, "Bear", 2); break;
    case "10–30 minutes": add(s, "Owl", 1); add(s, "Dolphin", 1); break;
    case "Less than 10 minutes": add(s, "Dolphin", 2); break;
  }

  // Q10 — Support needed
  switch (d.productivitySupport) {
    case "Help getting started": add(s, "Owl", 2); break;
    case "Focus support (stay on track)": add(s, "Dolphin", 1); add(s, "Bear", 1); break;
    case "Energy boost / reset": add(s, "Dolphin", 2); break;
    case "Quick win - something fast": add(s, "Owl", 1); add(s, "Bear", 1); break;
  }

  return s;
}

// ----- STRESSED / WELLBEING PATH -----
// Mapping notes:
//   Spec Q1 (Habitual sleep)     -> onboarding.sleepGeneral
//   Spec Q2 (Emotional baseline) -> emotionalState (multi)
//   Spec Q3 (How often)          -> feelFrequency
//   Spec Q4 (Body)               -> bodyLocation
//   Spec Q5 (Root)               -> rootCause
//   Spec Q6 (What's driving)     -> closest existing = rootCause (reuse) — see note
//   Spec Q7 (Affecting)          -> affect
//   Spec Q8 (Felt before)        -> feltBefore
//   Spec Q9 (Tried)              -> triedAlready (multi)
//   Spec Q10 (Support)           -> supportType
function scoreStressed(d: ReflectiveData, o: OnboardingData): Scores {
  const s = empty();

  // Q1 — Sleep (from onboarding)
  switch (o.sleepGeneral) {
    case "I sleep well most nights — 7–8 hrs": add(s, "Bear", 2); break;
    case "It varies a lot — some nights good, some bad": add(s, "Bear", 1); add(s, "Dolphin", 1); break;
    case "I consistently sleep less than I should": add(s, "Owl", 2); break;
    case "I struggle to fall/stay asleep regularly": add(s, "Dolphin", 3); break;
    case "I crash hard but never feel rested": add(s, "Dolphin", 2); add(s, "Owl", 1); break;
  }

  // Q2 — Emotional state (multi)
  d.emotionalState.forEach((opt) => {
    switch (opt) {
      case "Anxious / worried": add(s, "Dolphin", 2); break;
      case "Angry / Frustrated": add(s, "Lion", 1); add(s, "Dolphin", 1); break;
      case "Sad / Low": add(s, "Bear", 2); break;
      case "Overwhelmed / scattered": add(s, "Dolphin", 2); break;
      case "Numb / empty": add(s, "Bear", 2); break;
      case "Stressed / pressure": add(s, "Lion", 1); add(s, "Dolphin", 1); break;
      case "Lost / confused": add(s, "Owl", 2); break;
      case "I don't know": add(s, "Dolphin", 1); add(s, "Owl", 1); break;
    }
  });

  // Q3 — Frequency
  switch (d.feelFrequency) {
    case "Almost everyday": add(s, "Dolphin", 2); break;
    case "A few times a week": add(s, "Bear", 1); add(s, "Dolphin", 1); break;
    case "Occasionally": add(s, "Bear", 2); break;
    case "This is a recent shift - it's new": add(s, "Lion", 1); add(s, "Bear", 1); break;
  }

  // Q4 — Body
  switch (d.bodyLocation) {
    case "Stomach / gut": add(s, "Dolphin", 2); break;
    case "Head / temples": add(s, "Lion", 2); add(s, "Dolphin", 1); break;
    case "Throat / neck": add(s, "Bear", 1); add(s, "Dolphin", 1); break;
    case "Whole body": add(s, "Bear", 2); break;
    case "I don't feel it physically": add(s, "Owl", 1); add(s, "Lion", 1); break;
  }

  // Q5 — Root cause
  switch (d.rootCause) {
    case "A specific life event or situation": add(s, "Lion", 1); add(s, "Bear", 1); break;
    case "A slow build-up over time": add(s, "Bear", 2); break;
    case "It comes in cycles - I don't always know why": add(s, "Dolphin", 2); break;
    case "I genuinely have no idea": add(s, "Owl", 1); add(s, "Dolphin", 1); break;
  }

  // Q6 — What's driving it (closest map: rootCause flavour again, lighter weight)
  // We reuse rootCause as a proxy at half weight to avoid double-counting.
  switch (d.rootCause) {
    case "A specific life event or situation": add(s, "Lion", 1); add(s, "Dolphin", 1); break; // ~ work/perf
    case "A slow build-up over time": add(s, "Bear", 1); add(s, "Dolphin", 1); break; // ~ health/relationships
    case "It comes in cycles - I don't always know why": add(s, "Dolphin", 1); break; // ~ own thoughts
    case "I genuinely have no idea": add(s, "Owl", 2); break; // ~ nothing specific
  }

  // Q7 — Affecting you
  switch (d.affect) {
    case "Can't focus / concentrate": add(s, "Dolphin", 2); break;
    case "Feels like withdrawing / isolating": add(s, "Bear", 2); break;
    case "I'm going through motions but not present": add(s, "Owl", 1); add(s, "Bear", 1); break;
    case "I physically feel unwell (headache, stress, fatigue)": add(s, "Dolphin", 2); add(s, "Bear", 1); break;
    case "Spiralling in my thoughts": add(s, "Dolphin", 3); break;
  }

  // Q8 — Felt before
  switch (d.feltBefore) {
    case "Yes, this is very familiar - it comes back often": add(s, "Dolphin", 3); break;
    case "Yes, but usually milder than this": add(s, "Bear", 1); add(s, "Dolphin", 1); break;
    case "Rarely - this feels unusual for me": add(s, "Bear", 2); break;
    case "No, this is new for me": add(s, "Lion", 1); add(s, "Bear", 1); break;
  }

  // Q9 — Tried (multi)
  d.triedAlready.forEach((opt) => {
    switch (opt) {
      case "Nothing yet": add(s, "Owl", 2); add(s, "Bear", 1); break;
      case "Distraction (scrolling, music, TV)": add(s, "Bear", 1); add(s, "Owl", 1); break;
      case "Talking to someone about it": add(s, "Bear", 2); break;
      case "Exercise / movement": add(s, "Lion", 2); break;
      case "Food / drink": add(s, "Bear", 1); break;
      case "Breathing / meditation / sleeping": add(s, "Lion", 1); add(s, "Dolphin", 1); break;
    }
  });

  // Q10 — Support
  switch (d.supportType) {
    case "Something physical that I can do with my body": add(s, "Lion", 2); break;
    case "Something I can think through mentally": add(s, "Dolphin", 2); break;
    case "A calming practice / ritual": add(s, "Bear", 2); break;
    case "Something quick - under 5 minutes": add(s, "Owl", 2); break;
    case "Something I can do tonight before sleeping": add(s, "Bear", 1); add(s, "Dolphin", 1); break;
  }

  return s;
}

// Tiebreaker priority: Dolphin > Owl > Bear > Lion
const TIEBREAKER: Chronotype[] = ["Dolphin", "Owl", "Bear", "Lion"];

export function pickWinner(scores: Scores): Chronotype {
  const max = Math.max(...Object.values(scores));
  for (const t of TIEBREAKER) {
    if (scores[t] === max) return t;
  }
  return "Bear";
}

export function assignChronotype(onboarding: OnboardingData, reflective: ReflectiveData): { chronotype: Chronotype; scores: Scores } {
  const PRODUCTIVITY = "I'm highly ambitious and want to boost my productivity to achieve more";
  const scores = reflective.condition === PRODUCTIVITY
    ? scoreAmbitious(reflective)
    : scoreStressed(reflective, onboarding);

  return { chronotype: pickWinner(scores), scores };
}

export const CHRONOTYPE_INFO: Record<Chronotype, { emoji: string; tagline: string; strength: string; challenge: string }> = {
  Lion: {
    emoji: "🦁",
    tagline: "Early riser with sharp morning focus. A natural leader who thrives on structure.",
    strength: "You convert intention into action faster than most.",
    challenge: "You can over-extend and burn out before you notice.",
  },
  Bear: {
    emoji: "🐻",
    tagline: "You follow the sun — steady mid-morning energy and a balanced rhythm.",
    strength: "You're consistent, social, and get things done without drama.",
    challenge: "Stress builds quietly — you may notice it only after it's piled up.",
  },
  Owl: {
    emoji: "🦉",
    tagline: "Your mind comes alive in the evening. Creative and introspective by nature.",
    strength: "You think in original, non-obvious ways most people miss.",
    challenge: "Society's early schedule fights your wiring — mornings can feel heavy.",
  },
  Dolphin: {
    emoji: "🐬",
    tagline: "Light, sensitive sleeper. A perceptive, perfectionistic mind that rarely switches off.",
    strength: "You notice nuance and care deeply about getting things right.",
    challenge: "Your mind runs hot — wired but tired is a familiar state.",
  },
};
