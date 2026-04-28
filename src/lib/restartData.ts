// reStart static content: questions, chronotype data, daily phrases.
// "stressed" path uses DB enum value "emotional"; UI label is "stressed".
// "Owl" UI label maps to DB enum value "wolf".

export type Path = "ambitious" | "emotional";
export type Chronotype = "lion" | "bear" | "wolf" | "dolphin";

export const CHRONOTYPE_EMOJI: Record<Chronotype, string> = {
  lion: "🦁", bear: "🐻", wolf: "🦉", dolphin: "🐬",
};

export const CHRONOTYPE_LABEL: Record<Chronotype, string> = {
  lion: "Lion", bear: "Bear", wolf: "Owl", dolphin: "Dolphin",
};

export const CHRONOTYPE_TAGLINE: Record<Chronotype, string> = {
  lion: "Early riser. Driven, structured, goal-oriented.",
  bear: "Follows the sun. Balanced, social, steady.",
  wolf: "Night owl. Creative, introspective. Your best thinking happens late.",
  dolphin: "Light sleeper. Wired but tired. Highly intelligent and deeply perceptive.",
};

export const CHRONOTYPE_STRENGTH: Record<Chronotype, string> = {
  lion: "Peak focus in the morning — you get more done before noon than most do all day.",
  bear: "Consistent output across long stretches — you work well with the natural rhythm of the day.",
  wolf: "Deep creative and analytical work — you access ideas others can't reach at 9am.",
  dolphin: "You notice things others miss. Your sensitivity is a superpower when channelled right.",
};

export const CHRONOTYPE_CHALLENGE: Record<Chronotype, string> = {
  lion: "You can burn out from overworking. Rest is not laziness — it's strategy.",
  bear: "Stress builds up quietly under the surface. You absorb more than you release.",
  wolf: "Daytime structure fights your natural rhythm. Starting tasks early can feel impossible.",
  dolphin: "Overthinking and perfectionism are your biggest blockers. Done is better than perfect.",
};

export const CHRONOTYPE_HERO_BG: Record<Chronotype, string> = {
  lion: "#FEF3C7", bear: "#DCFCE7", wolf: "#EDE9FE", dolphin: "#E0F2FE",
};
export const CHRONOTYPE_HERO_TEXT: Record<Chronotype, string> = {
  lion: "#78350F", bear: "#14532D", wolf: "#3B0764", dolphin: "#0C4A6E",
};

// 7 daily phrases, indexed by day number 1..7+ (mod 7)
export const JOURNEY_DAILY_PHRASES = [
  "Your reset starts today. One breath at a time.",
  "Yesterday you showed up. That's already something.",
  "Small actions compound. You're building something real.",
  "Halfway there. What you're doing is working.",
  "This is where most people stop. You're still here.",
  "One more day of showing up rewires your brain. Literally.",
  "Seven days. A new pattern has begun.",
];

export const greetingFor = (name: string | null | undefined) => {
  const h = new Date().getHours();
  const n = name?.trim() || "friend";
  if (h < 12) return `Good morning, ${n}.`;
  if (h < 17) return `Good afternoon, ${n}.`;
  if (h < 21) return `Good evening, ${n}.`;
  return `Hello, ${n}.`;
};

export const getDayPhrase = (day: number) =>
  JOURNEY_DAILY_PHRASES[Math.max(0, Math.min(6, (day - 1) % 7))];

// ---------- ONBOARDING QUESTIONS ----------
export type Question =
  | { id: string; type: "single"; q: string; sub?: string; options: string[] }
  | { id: string; type: "text"; q: string; sub?: string; placeholder?: string; inputType?: "text" | "email" }
  | { id: string; type: "textarea"; q: string; sub?: string; placeholder?: string; minLength?: number };

// Q1–Q8 universal (everyone sees these)
export const UNIVERSAL_QUESTIONS: Question[] = [
  { id: "name", type: "text", q: "What do you want to call yourself?", placeholder: "Your name" },
  { id: "age", type: "single", q: "How old are you?", options: ["Under 18", "18–24", "25–35", "36–45", "45+"] },
  { id: "sleep", type: "single", q: "How has your sleep been lately?", options: [
    "Sleep well most nights (7–8 hrs)",
    "Varies a lot, unpredictable",
    "Consistently less sleep than I need",
    "Struggle to fall or stay asleep",
    "Crash hard, wake up exhausted",
  ]},
  { id: "role", type: "single", q: "What describes you best right now?", options: [
    "Student", "Working professional", "Freelancer or self-employed", "Between jobs", "Homemaker or caregiver",
  ]},
  { id: "deep_work_time", type: "single", q: "What time of day feels most natural to you for deep work?", options: [
    "Early morning (5–9am)", "Morning (9am–12pm)", "Afternoon (12–5pm)", "Evening (5–10pm)", "Late night (10pm+)",
  ]},
  { id: "lifestyle", type: "single", q: "How would you describe your lifestyle right now?", options: [
    "Very structured and routine", "Somewhat structured", "Flexible and varied", "Chaotic", "I'm figuring it out",
  ]},
  { id: "goal", type: "textarea", q: "Write down one goal you want to achieve in the next 7 days.", sub: "Be honest. No one else sees this.", placeholder: "I want to...", minLength: 5 },
  { id: "openness", type: "single", q: "How open are you to trying new practices — like breathwork or herbal rituals?", options: [
    "Very open — bring it on", "Somewhat open", "Curious but sceptical", "Not really my thing",
  ]},
];

// Q10–Q18 ambitious
export const AMBITIOUS_QUESTIONS: Question[] = [
  { id: "amb_challenge", type: "single", q: "What's your biggest challenge with productivity right now?", options: [
    "Distracted / struggling to focus", "Overworking — can't switch off",
    "Procrastinating more than I'd like", "Starting strong then losing steam",
  ]},
  { id: "energy_today", type: "single", q: "How's your energy today?", options: [
    "High — ready to go", "Decent — not at my peak", "Low — struggling to start", "Drained — no motivation",
  ]},
  { id: "feel_about_work", type: "single", q: "How do you feel about your work right now?", options: [
    "Driven and on it", "Pressured but pushing through", "Stuck and frustrated", "Overwhelmed", "Scattered and unfocused",
  ]},
  { id: "clarity", type: "single", q: "How clear are you on what needs to get done?", options: [
    "Very clear — I know exactly what to do", "Somewhat clear", "Vague — ideas but no plan", "No clarity at all",
  ]},
  { id: "blockers", type: "single", q: "What's slowing you down the most?", options: [
    "Distractions", "Overthinking or perfectionism", "Low energy or fatigue", "Too many things at once", "Lack of clear direction",
  ]},
  { id: "work_style", type: "single", q: "How are you working right now?", options: [
    "Deep focus — locked in", "Starting and stopping", "Avoiding or delaying", "Busy but not really progressing",
  ]},
  { id: "workload", type: "single", q: "How does your workload feel today?", options: [
    "Under control", "Slightly heavy but manageable", "Overloaded but still going", "Chaotic — no idea where to start",
  ]},
  { id: "today_goal", type: "single", q: "What's your goal for today?", options: [
    "Complete one specific task", "Make meaningful progress", "Get organised", "Just get started",
  ]},
  { id: "focus_window", type: "single", q: "How much focused time do you have right now?", options: [
    "60+ minutes", "30–60 minutes", "10–30 minutes", "Less than 10 minutes",
  ]},
];

// Q10–Q18 stressed (DB path = "emotional")
export const STRESSED_QUESTIONS: Question[] = [
  { id: "feeling_word", type: "single", q: "In one word — how are you feeling right now?", options: [
    "Anxious / worried", "Angry / frustrated", "Sad / low", "Overwhelmed / scattered", "Stressed / under pressure", "Lost / confused",
  ]},
  { id: "frequency", type: "single", q: "How often do you feel this way?", options: [
    "Almost every day", "A few times a week", "Occasionally", "It's a recent shift — new for me",
  ]},
  { id: "body_location", type: "single", q: "Where in your body do you feel it most?", options: [
    "Stomach / gut", "Head / temples", "Throat / neck", "Whole body / everywhere", "I don't feel it physically",
  ]},
  { id: "origin", type: "single", q: "Where did this feeling come from?", options: [
    "A specific event triggered it", "Slow build-up over time", "It comes in cycles", "No idea where it started",
  ]},
  { id: "driver", type: "single", q: "What seems to be driving it?", options: [
    "Work / studies", "A relationship or person", "My own thoughts about myself", "Nothing specific — it just is", "Multiple things at once",
  ]},
  { id: "impact", type: "single", q: "How is this feeling affecting you right now?", options: [
    "Can't focus or concentrate", "Withdrawing / isolating", "Physical symptoms (headache, tension)", "Spiralling thoughts", "Going through the motions",
  ]},
  { id: "history", type: "single", q: "Have you felt this way before?", options: [
    "Yes — very familiar, comes back often", "Yes but usually milder", "Rarely — this feels unusual for me", "No — this is completely new",
  ]},
  { id: "tried", type: "single", q: "What have you already tried today?", options: [
    "Nothing yet", "Talking to someone", "Exercise or movement", "Breathing / meditation", "Distraction (scrolling, music)",
  ]},
  { id: "support_needed", type: "single", q: "What kind of support feels right to you right now?", options: [
    "Something physical I can do", "Something to think through mentally", "A calming practice or ritual", "Something quick — under 5 minutes", "Something tonight before sleep",
  ]},
];

export const totalOnboardingSteps = (path: Path) =>
  UNIVERSAL_QUESTIONS.length + (path === "ambitious" ? AMBITIOUS_QUESTIONS.length : STRESSED_QUESTIONS.length);
