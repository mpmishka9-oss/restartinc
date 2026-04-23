// Static reStart content: questions, prompts, chronotype data, etc.

export type Path = "ambitious" | "emotional";
export type Chronotype = "lion" | "bear" | "wolf" | "dolphin";

export const CHRONOTYPE_EMOJI: Record<Chronotype, string> = {
  lion: "🦁", bear: "🐻", wolf: "🐺", dolphin: "🐬",
};

export const CHRONOTYPE_LABEL: Record<Chronotype, string> = {
  lion: "Lion", bear: "Bear", wolf: "Wolf", dolphin: "Dolphin",
};

export const CHRONOTYPE_GRADIENT: Record<Chronotype, string> = {
  lion: "linear-gradient(180deg, #F5E6C8 0%, #E8D4A0 100%)",
  bear: "linear-gradient(180deg, #C8E6D4 0%, #A8D5BA 100%)",
  wolf: "linear-gradient(180deg, hsl(209 64% 73%) 0%, hsl(207 47% 56%) 100%)",
  dolphin: "linear-gradient(180deg, #C8D4E8 0%, #A8B8D4 100%)",
};

export const CHRONOTYPE_TIMING: Record<Chronotype, { label: string; alt?: string }> = {
  lion: { label: "Best 6–9am for your Lion rhythm" },
  bear: { label: "Best 8–11am for your Bear rhythm" },
  wolf: { label: "Best 6–9pm for your Wolf rhythm" },
  dolphin: { label: "Best 9–11am", alt: "Or wind-down 8–10pm" },
};

export const DAILY_PHRASES = [
  "Begin again. Always, begin again.",                    // Sun (0)
  "What you tend to daily, tends to you.",                 // Mon (1)
  "Stillness is not emptiness — it is arrival.",            // Tue (2)
  "The body knows before the mind admits.",                 // Wed (3)
  "Rest is not the absence of work. It is its foundation.", // Thu (4)
  "Small acts of care compound into transformation.",       // Fri (5)
  "You do not need to earn your rest.",                     // Sat (6)
];

export const DAILY_PROMPTS = [
  "What would feel like enough today?",                    // Sun
  "How are you arriving today?",                            // Mon
  "What's sitting heaviest on you right now?",              // Tue
  "Where in your body do you feel today?",                  // Wed
  "What does your mind keep returning to?",                 // Thu
  "What do you need most in this moment?",                  // Fri
  "What are you carrying that isn't yours?",                // Sat
];

export const todayPhrase = () => DAILY_PHRASES[new Date().getDay()];
export const todayPrompt = () => DAILY_PROMPTS[new Date().getDay()];

export const greetingFor = (name: string | null | undefined) => {
  const h = new Date().getHours();
  const n = name?.trim() || "friend";
  if (h < 12) return `Good morning, ${n}`;
  if (h < 17) return `Good afternoon, ${n}`;
  return `Good evening, ${n}`;
};

export const levelPoetic: Record<number, string> = {
  1: "Gentle practices await you",
  2: "Deeper tools for where you are",
  3: "Potent practices, you're ready",
};

// ---- Questions ----
export type Question =
  | { id: string; type: "single"; q: string; sub?: string; options: string[] }
  | { id: string; type: "multi"; q: string; sub?: string; options: string[] }
  | { id: string; type: "text"; q: string; sub?: string; placeholder?: string; inputType?: "text" | "email" };

export const UNIVERSAL_QUESTIONS: Question[] = [
  { id: "role", type: "single", q: "What best describes you right now?", options: [
    "Student", "Working professional", "Freelancer or self-employed",
    "Between jobs or taking a break", "Homemaker or caregiver"
  ]},
  { id: "age", type: "single", q: "Your age group?", options: ["Under 18", "19–25", "26–35", "36–45", "Above 45"] },
  { id: "email", type: "text", q: "What's your email?", placeholder: "you@email.com", inputType: "email" },
  { id: "gender", type: "single", q: "Your gender?", options: ["Male", "Female", "Other", "Prefer not to say"] },
  { id: "name", type: "text", q: "What would you like to be called?", sub: "Didi will use this name", placeholder: "Your name" },
  { id: "sleep", type: "single", q: "How would you describe your sleep?", options: [
    "I sleep well most nights (7-8 hrs)",
    "It varies — some nights good, some bad",
    "I consistently sleep less than I should",
    "I struggle to fall or stay asleep",
    "I crash hard but never feel rested",
  ]},
  { id: "person_type", type: "single", q: "What kind of person are you?", options: [
    "A morning person", "A night owl", "Somewhere in between"
  ]},
  { id: "habits", type: "multi", q: "What's already part of your life?", options: [
    "Exercise or movement", "Meditation or breathwork",
    "A consistent morning or evening routine", "None of these yet",
  ]},
  { id: "wellness_attitude", type: "single", q: "How do you feel about practices like breathwork, journaling or herbal routines?", options: [
    "Open to trying anything", "Prefer science-backed approaches",
    "Drawn to holistic or ancient wisdom", "Sceptical but curious",
  ]},
];

export const AMBITIOUS_QUESTIONS: Question[] = [
  { id: "goals", type: "single", q: "How do you feel about your goals right now?", options: [
    "Driven", "Pressured", "Stuck", "Overwhelmed", "Unfocused", "Indifferent", "Unsure"
  ]},
  { id: "energy_today", type: "single", q: "How has your energy been today?", options: [
    "High — ready to go", "Decent — can work but not at my peak",
    "Low — struggling to get started", "Drained — no motivation",
  ]},
  { id: "blockers", type: "single", q: "What's slowing you down the most?", options: [
    "Distractions (phone, people, environment)", "Overthinking or perfectionism",
    "Low energy or fatigue", "Too many things at once",
    "Lack of direction", "Procrastination",
  ]},
  { id: "clarity", type: "single", q: "How clear are you on what to do today?", options: [
    "Very clear — I know exactly", "Somewhat clear — not fully structured",
    "Vague — ideas but no clear plan", "No clarity — I feel lost",
  ]},
  { id: "workload", type: "single", q: "What does your workload feel like?", options: [
    "Under control", "Slightly heavy but manageable",
    "Overloaded", "Chaotic — don't know where to start",
  ]},
  { id: "work_style", type: "single", q: "How are you currently working?", options: [
    "Deep focus — locked in", "Starting and stopping frequently",
    "Avoiding or delaying tasks", "Busy but not making real progress",
  ]},
  { id: "success", type: "single", q: "What does success look like today?", options: [
    "Crushing a key deliverable", "Meaningful progress on a big goal",
    "Clearing the noise so I can focus", "Honestly, just getting unstuck",
  ]},
  { id: "focus_window", type: "single", q: "How much time can you realistically focus?", options: [
    "60+ minutes", "30–60 minutes", "10–30 minutes", "Less than 10 minutes",
  ]},
  { id: "support", type: "single", q: "What kind of support do you need?", options: [
    "Help getting started", "Focus support — stay on track",
    "Energy boost or reset", "Quick win — something fast",
  ]},
];

export const EMOTIONAL_QUESTIONS: Question[] = [
  { id: "emotional_state", type: "single", q: "Which best describes your emotional state lately?", options: [
    "Anxious or worried", "Angry or frustrated", "Sad or low",
    "Overwhelmed or scattered", "Numb or empty", "Stressed or under pressure",
    "Lost or confused", "I don't know",
  ]},
  { id: "frequency", type: "single", q: "How often do you feel this way?", options: [
    "Almost every day", "A few times a week", "Occasionally", "This is recent — it's new",
  ]},
  { id: "body_location", type: "single", q: "Where in your body do you feel it most?", options: [
    "Stomach or gut", "Head or temples", "Throat or neck",
    "Whole body", "I don't feel it physically",
  ]},
  { id: "onset", type: "single", q: "When did this feeling start?", options: [
    "Just now — something specific triggered it", "A few hours ago",
    "Since I woke up", "Been there for a few days", "I genuinely don't know",
  ]},
  { id: "root", type: "single", q: "Do you have a sense of what's been at the root of this?", options: [
    "A specific life event or situation", "A slow build-up over time",
    "It comes in cycles — I don't always know why", "I genuinely have no idea",
  ]},
  { id: "impact", type: "single", q: "How is this affecting you right now?", options: [
    "Can't focus or concentrate", "Feels like withdrawing or isolating",
    "Going through motions but not present", "I physically feel unwell",
    "Spiralling in my thoughts",
  ]},
  { id: "history", type: "single", q: "Have you felt this way before?", options: [
    "Yes — this is very familiar, comes back often",
    "Yes — but usually milder", "Rarely — this feels unusual for me",
    "No — this is new for me",
  ]},
  { id: "tried", type: "multi", q: "What have you already tried?", options: [
    "Nothing yet", "Distraction (scrolling, music, TV)",
    "Talking to someone", "Exercise or movement",
    "Food or drink", "Breathing, meditation or sleep",
  ]},
  { id: "support", type: "single", q: "What kind of support feels right?", options: [
    "Something physical I can do with my body",
    "Something I can think through mentally",
    "A calming practice or ritual",
    "Something quick — under 5 minutes",
    "Something for tonight before sleeping",
  ]},
];
