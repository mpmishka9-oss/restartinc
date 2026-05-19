/**
 * Didi's real-time guided scripts per practice.
 * BEFORE → DURING[] → AFTER. Lines may contain `{name}` placeholder.
 */

export interface DidiScript {
  before: string;
  during: string[];
  after: string;
}

export const DIDI_SCRIPTS: Record<string, DidiScript> = {
  n_friction_sprint: {
    before: "The task you've been avoiding is shrinking your willpower muscle. Starting it — right now — is the only thing that grows it back. 10 minutes. That's the whole deal.",
    during: [
      "Type the task. Don't negotiate with yourself. Just type it.",
      "Halfway. Your aMCC is firing. Keep going.",
    ],
    after: "You did it. That resistance you felt at the start? That was your brain growing. It gets easier from here.",
  },
  n_pomodoro: {
    before: "Your brain's focus degrades after 25 minutes whether you notice it or not. We're going to work with that — not against it.",
    during: [
      "Type your task. One thing only.",
      "5 minutes left. Finish your current thought — don't start anything new.",
      "Break time. Step away from the screen. Seriously.",
    ],
    after: "One round done. Want to go again? Your prefrontal cortex is warmed up now — this next round will feel sharper.",
  },
  n_bhramari: {
    before: "Humming increases nitric oxide in your nasal passages by 1500%. That's not a metaphor — it's a vasodilator that opens blood flow to your brain within minutes.",
    during: [
      "Inhale slowly through your nose.",
      "Now hum on the exhale. Feel the vibration in your skull.",
      "Again. Longer this time.",
      "Keep the cycles going — soft, steady hum.",
    ],
    after: "Your cerebral blood flow just increased. That clarity you feel? That's more oxygen reaching your prefrontal cortex.",
  },
  n_ultradian_reset: {
    before: "You've been running for 90 minutes. Your neurotransmitters are depleted. This 10 minutes will refill them. Close your eyes — this isn't sleep, it's maintenance.",
    during: [
      "Let the screen go dark. Follow the circle if you need something to track.",
      "Halfway. Let your thoughts drift — don't chase them.",
    ],
    after: "Dopamine and norepinephrine just restocked. You're ready for your next 90 minutes.",
  },
  n_implementation_intention: {
    before: "Willpower fails because you rely on it in the moment. This removes the moment entirely — your brain pre-decides, so the behaviour becomes automatic.",
    during: [
      "Fill in: If [situation]…",
      "…I will [action]…",
      "…at [time or place].",
      "Didi will remind you at exactly that time.",
    ],
    after: "That's stored. When the moment arrives, your brain already knows what to do. No willpower needed.",
  },
  n_woop: {
    before: "Visualising success alone tricks your brain into thinking the goal is done. Adding the obstacle is what separates people who follow through from people who intend to.",
    during: [
      "What's your wish?",
      "What's the best outcome if it happens? Picture it fully.",
      "What's the main thing standing in your way?",
      "If that obstacle appears, what's your plan?",
    ],
    after: "That plan is now stored in your prefrontal cortex as a ready-made response. You've tripled your odds of following through.",
  },
  n_observer_perspective: {
    before: "Calling yourself by your name — '{name} is feeling this right now' — drops emotional intensity by up to 40%. You're about to try it.",
    during: [
      "Describe what {name} is feeling right now, as if watching a friend. Don't rush — just observe.",
      "Now read it back. What would you tell this person?",
    ],
    after: "That distance you just created? That's your prefrontal cortex staying online instead of going dark. It works every time.",
  },
  n_single_sense_focus: {
    before: "Your brain can't spiral and be fully present at the same time. Pick one sense — we're going to use it to crowd out the noise.",
    during: [
      "Choose your sense.",
      "Now describe everything you notice through it. Don't stop — keep going even when it feels like there's nothing left.",
      "There's always more. What else?",
    ],
    after: "Your default mode network just went offline. That loop that was running? It needed your attention to survive. You just starved it.",
  },
  n_cognitive_reappraisal: {
    before: "Your brain attached a meaning to this stressor. That meaning is causing more suffering than the stressor itself. We're about to change it.",
    during: [
      "What's the stressor?",
      "What's the worst meaning you've given it?",
      "Now write three other meanings it could have. They don't have to be positive — just true.",
    ],
    after: "Your prefrontal cortex just overrode your amygdala. That pathway gets stronger every time you do this.",
  },
  n_spaced_repetition: {
    before: "You'll forget 70% of what you learned today by tomorrow. Unless you do this. One review. Takes 2 minutes.",
    during: [
      "What's one important thing you learned recently?",
      "Got it. Didi will bring this back to you tomorrow, then in 3 days, then in 7.",
      "Can you recall it without looking? Take a moment.",
    ],
    after: "Each time you retrieve this, the neural pathway gets physically stronger. That's how long-term memory actually works.",
  },
  n_interleaved_learning: {
    before: "Studying one subject for hours creates an illusion of learning. Switching — even though it feels harder — is what actually builds memory. The difficulty is the point.",
    during: [
      "Enter up to 3 topics.",
      "Switch to Topic 2 now. Don't finish your thought — the gap is part of it.",
      "Switch to Topic 3.",
    ],
    after: "Harder during practice, 40% better at recall. Every time. That's not a theory — it's replicated across dozens of studies.",
  },
  n_identity_rewriting: {
    before: "Behaviour follows identity — not the other way around. What you say you are, you become. Say it enough times and your brain builds the neural architecture to match.",
    during: [
      "Complete: I am the kind of person who…",
      "Now read the first one aloud. Slowly.",
      "Second one.",
      "Third.",
    ],
    after: "Saved to your identity profile. Didi will show these back to you on Day 7 and Day 21. Watch what shifts.",
  },
  n_deliberate_discomfort: {
    before: "The aMCC grows fastest from chosen difficulty — not forced difficulty. Doing something hard while you feel good is the rarest and most effective form of willpower training.",
    during: [
      "What's one thing you'd rather avoid right now?",
      "Don't negotiate. Don't modify. Just do it until the timer ends.",
    ],
    after: "You chose difficulty. Most people wait until they have to. That distinction is everything.",
  },
  n_pre_mortem: {
    before: "Stress comes from feeling like outcomes are out of your control. Pre-mortem thinking puts you back in control — you solve for failure before it happens.",
    during: [
      "What are you about to start?",
      "List every reason it could fail — don't hold back.",
      "Now solve for each one. Pair a solution to every failure you listed.",
    ],
    after: "Your prefrontal contingency system is activated. You've converted uncertainty into a plan. You're ready.",
  },

  /* ── Ayurveda — Vata ── */
  v_nasya_oil: {
    before: "Your nasal passage is the direct highway to your brain. Warm sesame oil here calms Vata anxiety at the source — it's been used for over 3,000 years for exactly this.",
    during: [
      "Warm 2 drops of sesame oil between your palms.",
      "Tilt your head back gently.",
      "2 drops in each nostril. Breathe slowly.",
      "Rest here for a moment. Let the oil do its work.",
    ],
    after: "Your Manovaha Srotas — your mind channel — just got nourished. Notice what's changed in the next few minutes.",
  },
  v_abhyanga: {
    before: "Vata anxiety lives in the body as tension and dryness. Warm sesame oil on your skin is pharmacologically active — it absorbs and counteracts Vata's cold, dry nature within minutes.",
    during: [
      "Start at your feet. Long strokes upward.",
      "Move to your legs — always toward the heart.",
      "Torso — circular motions on the belly.",
      "Arms, then neck.",
    ],
    after: "Oxytocin from the self-touch, Vata pacification from the sesame oil. Your nervous system just received two simultaneous signals to calm down.",
  },
  v_ashwagandha_milk: {
    before: "Ashwagandha is Ayurveda's primary nerve tonic for Vata. A clinical trial showed it reduced cortisol significantly in 60 days. Warm milk carries it directly into your system.",
    during: [
      "½ tsp ashwagandha into warm milk. Add a small pinch of ghee — it improves absorption.",
      "Sip slowly. No screens.",
      "5 minutes is yours. Just the warmth, the breath, the quiet.",
    ],
    after: "Your nervous system received it. The effect is cumulative — each evening you do this, the baseline drops a little more.",
  },
  v_cardamom_milk: {
    before: "Cardamom calms Vata's tendency toward mental hyperactivity — its aromatic compounds work through your olfactory pathway straight to your limbic system. It's in your kitchen right now.",
    during: [
      "Crush 2 cardamom pods into warm milk.",
      "Hold the cup with both hands. Inhale the steam before the first sip.",
      "Sip slowly. Notice the warmth moving through you.",
    ],
    after: "Simple and old. That's how you know it works.",
  },
  v_foot_massage: {
    before: "The soles of your feet hold Talahridaya — the heart marma point. Sesame oil here before bed directly regulates the nervous system. This is Ayurveda's most prescribed sleep practice.",
    during: [
      "Warm oil between your palms and apply to your right sole.",
      "Thumb pressure on the arch — hold 20 seconds.",
      "Move to the heel. Then the ball of the foot.",
      "Switch to left foot.",
    ],
    after: "Cortisol just dropped. Your body knows what bedtime feels like now.",
  },
  v_physiological_sigh: {
    before: "This is your nervous system's fastest built-in reset. A double inhale followed by a long exhale drops CO2 and activates the parasympathetic system within seconds.",
    during: [
      "Inhale fully through your nose.",
      "One more short sniff on top — fill the last space in your lungs.",
      "Now exhale. Slow. Complete.",
      "Again — double inhale, long exhale.",
    ],
    after: "Your body has a built-in panic off-switch. You just used it.",
  },
  v_478_breathing: {
    before: "The extended 8-second exhale is the mechanism — it maximally activates your vagus nerve, dropping your heart rate within 3 cycles. Best used at the end of the Vata peak window — your evenings.",
    during: [
      "Inhale for 4…",
      "Hold for 7…",
      "Exhale for 8 — all the way out.",
      "Again. Inhale 4.",
    ],
    after: "Heart rate is lower. Nervous system is cooling. You've earned the rest that's coming.",
  },

  /* ── Ayurveda — Pitta ── */
  p_ccf_tea: {
    before: "Coriander, cumin, and fennel are Pitta's three primary cooling herbs. Together they cool internal heat, calm the reactive mind, and support the liver — the organ Pitta stress damages first.",
    during: [
      "Equal parts of each seed into water. Boil for 10 minutes.",
      "While it brews, step away from whatever was stressing you.",
      "Pour. Let it cool one minute before the first sip.",
      "Sip slowly. This is your midday reset.",
    ],
    after: "Your gut-brain axis just received a cooling signal. The reactivity you feel after this tea is blunted — not suppressed, blunted.",
  },
  p_amalaki: {
    before: "One teaspoon. 20 times the Vitamin C of an orange. Ayurveda's single best herb for draining Pitta heat from the liver before the day begins.",
    during: [
      "1 tsp amla powder into a glass of room temperature water.",
      "Stir. Drink it in one go or sip — your call.",
      "That's it. 2 minutes. Every morning.",
    ],
    after: "Pitta heat builds cumulatively. Amla drains it cumulatively. One morning at a time, your baseline cools.",
  },
  p_rose_water: {
    before: "Rose is one of Ayurveda's most cooling plants. At Pitta's peak window — 12 to 2pm — your internal heat is highest. This takes 2 minutes and works immediately.",
    during: [
      "Cup rose water in both hands.",
      "Splash across your face and neck — don't pat it dry yet.",
      "Let it sit. Two minutes. Breathe.",
    ],
    after: "Your skin cooled. Your nervous system noticed. That irritability has a biological cause — you just gave it a biological answer.",
  },
  p_coconut_scalp: {
    before: "Coconut oil is one of Ayurveda's most cooling substances. Applied to the crown — where Pitta heat accumulates — it directly addresses the headaches and agitation of a Pitta stress state.",
    during: [
      "Warm coconut oil between palms.",
      "Apply to the crown of your head. Hold gentle pressure for 30 seconds.",
      "Move to your temples — circular motion.",
      "Base of skull. Hold.",
    ],
    after: "Pitta heat moves upward. You just gave it somewhere to cool down.",
  },
  p_coriander_water: {
    before: "Coriander is Pitta's most accessible daily cooling herb. Soaking it overnight extracts the cooling compounds without heat — you drink them first thing and start the day with Pitta already calmed.",
    during: [
      "Tonight: 1 tsp coriander seeds into a glass of water. Cover and leave overnight.",
      "In the morning: strain and drink at room temperature. That's the whole practice.",
    ],
    after: "Simple, cumulative, effective. The Pitta reduction from this is not dramatic — it's steady. That's what makes it work.",
  },
  p_box_breathing: {
    before: "Four equal sides. This pattern disrupts the sympathetic nervous system's grip by introducing a full hold on both ends — your CO2 tolerance builds, your reactivity drops.",
    during: [
      "Inhale — 4 counts.",
      "Hold — 4 counts.",
      "Exhale — 4 counts.",
      "Hold — 4 counts.",
      "Again. Keep the box even.",
    ],
    after: "Used by Navy SEALs before high-pressure operations. Not because it's trendy — because it works.",
  },
  p_nadi_shodhana: {
    before: "Alternate nostril breathing balances left and right hemisphere activity. Pitta stress creates right-hemisphere dominance — this is the direct counter.",
    during: [
      "Right thumb closes right nostril. Inhale through left — 4 counts.",
      "Close both. Hold.",
      "Release right. Exhale — 4 counts.",
      "Inhale right. Then switch and exhale left.",
    ],
    after: "Both hemispheres are talking to each other again. That balance is what calm actually feels like.",
  },

  /* ── Ayurveda — Kapha ── */
  k_tulsi_ginger_tea: {
    before: "Tulsi regulates cortisol, dopamine, and serotonin — simultaneously. Ginger ignites your digestive fire. Together they are the direct pharmacological antidote to Kapha heaviness.",
    during: [
      "4–5 tulsi leaves and 1 slice of ginger into boiling water. 3 minutes.",
      "While it brews — stand up. Don't sit for this one.",
      "Pour and sip warm. Feel the ginger hit.",
    ],
    after: "Your Agni just got lit. The heaviness you felt before this? Track it over the next 20 minutes.",
  },
  k_trikatu: {
    before: "Three peppers. Ayurveda's most powerful Agni ignitor. This is not subtle — it is the direct opposite of everything Kapha feels like.",
    during: [
      "¼ tsp of the mix into warm water.",
      "If adding honey — do NOT heat it. Room temperature only, added after.",
      "Drink it. First thing.",
    ],
    after: "Your metabolic fire just got lit. Kapha stagnation needs heat — you just gave it some.",
  },
  k_ginger_lemon_shot: {
    before: "90 seconds to make. Immediate effect. Ginger's thermogenic compounds directly counter Kapha's cold and heavy qualities. The lemon activates your liver. This is your ignition before everything else.",
    during: [
      "Grate or press 1 inch of fresh ginger.",
      "Squeeze half a lemon.",
      "Add warm — not hot — water. Drink immediately.",
    ],
    after: "Day started. Kapha interrupted. That's the whole goal of this practice.",
  },
  k_ajwain_steam: {
    before: "Ajwain contains thymol — a natural bronchodilator. Breathing its steam opens your airways, delivers more oxygen to your brain, and breaks up the Kapha congestion that creates brain fog.",
    during: [
      "Boil ajwain seeds in water. Lean over the bowl.",
      "Towel over your head.",
      "Breathe in through your nose — slow and deep.",
      "Out through your mouth.",
    ],
    after: "More oxygen. Clearer airways. Your brain just got a direct delivery of what it was missing.",
  },
  k_methi_water: {
    before: "Fenugreek seeds soaked overnight extract compounds that stimulate Agni, support your gut microbiome, and reduce the Kapha heaviness that creates low mood. Your gut mood is your brain mood.",
    during: [
      "Tonight: 1 tsp methi seeds into a glass of water. Leave overnight.",
      "In the morning: drink the water first thing. You can eat the seeds or discard them.",
    ],
    after: "Gut-brain axis supported. Kapha stagnation interrupted at the root.",
  },
  k_jeera_water: {
    before: "Cumin is one of the most Agni-activating spices in Ayurvedic cooking. This warm water ignites your digestive fire and removes the Kapha bloating and heaviness that amplify low mood.",
    during: [
      "1 tsp cumin seeds into water. Boil 3 minutes.",
      "Strain. Drink warm.",
      "Morning. Every morning.",
    ],
    after: "Agni lit. Bloating reduced. The physical heaviness of Kapha low mood has a physical solution — this is it.",
  },
  k_kapalabhati: {
    before: "Skull-Shining Breath. Ayurveda named it for what it does — immediate mental clarity through rapid oxygen delivery and Kapha expulsion. This is your strongest pre-action activator.",
    during: [
      "Forceful exhale through your nose — belly pumps in sharply.",
      "Let the inhale happen passively.",
      "1 exhale per second. Follow the pulse.",
      "Rest, then Round 2.",
      "Rest, then Round 3.",
    ],
    after: "Agni is lit. Kapha is moving. Whatever you're about to do — do it now, while this is active.",
  },
};

export function getDidiScript(practiceId: string): DidiScript | null {
  return DIDI_SCRIPTS[practiceId] ?? null;
}

export function fillName(line: string, name: string): string {
  const safe = name?.trim() ? name.trim() : "you";
  return line.replace(/\{name\}/g, safe);
}