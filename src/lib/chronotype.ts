/**
 * Chronotype timing engine for Restart.
 *
 * Mood/dosha still pick the practice — chronotype only controls timing
 * framing (banner copy, "best time" line, mismatch note) and notification
 * schedule.
 */
import type { Chronotype } from "@/lib/restartData";

export type WindowState = "peak" | "between" | "second" | "windDown" | "off";
export type PracticeTimingTag = "morning" | "anytime" | "evening";

export interface ChronotypeWindow {
  peak: [number, number];      // [startHour, endHourExclusive]
  second: [number, number];
  windDown: [number, number];  // wraps past midnight: endHour treated as next-day
}

export const CHRONOTYPE_WINDOWS: Record<Chronotype, ChronotypeWindow> = {
  lion:    { peak: [6, 10],  second: [16, 18], windDown: [20, 24] },
  bear:    { peak: [10, 14], second: [16, 19], windDown: [22, 24] },
  wolf:    { peak: [12, 14], second: [18, 21], windDown: [0, 2]   },
  dolphin: { peak: [8, 10],  second: [15, 17], windDown: [23, 24] },
};

/** Hours when the daily "open the app" push notification should fire. */
export const CHRONOTYPE_PRIMARY_NOTIFY_HOUR: Record<Chronotype, number> = {
  lion: 6, bear: 10, wolf: 12, dolphin: 8,
};

export const CHRONOTYPE_PRIMARY_NOTIFY_COPY: Record<Chronotype, (name: string) => string> = {
  lion:    (n) => `Your peak window is open, ${n}. 3 minutes is all it takes.`,
  bear:    () => `Mid-morning is your sweet spot. Today's reset is ready.`,
  wolf:    () => `Your brain peaks at noon. Didi's waiting.`,
  dolphin: () => `Your focus window just opened. Let's use it.`,
};

export const secondNotifyCopy = (name: string, day: number) =>
  `You still have a second window today, ${name}. Don't let Day ${day} slip.`;

const CHRONOTYPE_LABELS: Record<Chronotype, string> = {
  lion: "Lion", bear: "Bear", wolf: "Wolf", dolphin: "Dolphin",
};

const fmtHour = (h: number) => {
  const norm = ((h % 24) + 24) % 24;
  if (norm === 0) return "12am";
  if (norm === 12) return "12pm";
  return norm < 12 ? `${norm}am` : `${norm - 12}pm`;
};

export function normalizeChronotype(c: string | null | undefined): Chronotype {
  const v = (c || "").toLowerCase();
  if (v === "lion" || v === "bear" || v === "wolf" || v === "dolphin") return v;
  return "bear";
}

export function getChronotypeWindow(c: string | null | undefined): ChronotypeWindow {
  return CHRONOTYPE_WINDOWS[normalizeChronotype(c)];
}

function inWindow(hour: number, [start, end]: [number, number]): boolean {
  // Round boundary in user's favour — inclusive on both ends.
  if (start <= end) return hour >= start && hour <= end;
  // wraps midnight
  return hour >= start || hour <= end;
}

export function getCurrentWindow(
  c: string | null | undefined,
  date: Date = new Date(),
): WindowState {
  const w = getChronotypeWindow(c);
  const h = date.getHours();
  if (inWindow(h, w.peak)) return "peak";
  if (inWindow(h, w.windDown)) return "windDown";
  if (inWindow(h, w.second)) return "second";
  // "between" = after peak ended but before second starts
  if (h > w.peak[1] && h < w.second[0]) return "between";
  return "off";
}

export function formatPeakWindow(c: string | null | undefined): string {
  const ct = normalizeChronotype(c);
  const [a, b] = CHRONOTYPE_WINDOWS[ct].peak;
  return `${fmtHour(a)} – ${fmtHour(b)} (${CHRONOTYPE_LABELS[ct]})`;
}

export function bannerCopy(state: WindowState, name: string): string | null {
  switch (state) {
    case "peak":     return `You're in your peak window, ${name}. This is your brain's best hour.`;
    case "second":   return `You've got a second wind coming. Use it.`;
    case "windDown": return `Your nervous system is ready to restore. This practice works best now.`;
    default:         return null;
  }
}

/* ── Practice timing tags ─────────────────────────────────────────────── */

export const PRACTICE_TIMING_TAGS: Record<string, PracticeTimingTag> = {
  // MORNING (peak-window practices)
  n_friction_sprint: "morning",
  n_pomodoro: "morning",
  n_woop: "morning",
  n_implementation_intention: "morning",
  n_interleaved_learning: "morning",
  v_nasya_oil: "morning",
  v_abhyanga: "morning",
  k_trikatu: "morning",
  k_ginger_lemon_shot: "morning",
  k_tulsi_ginger_tea: "morning",
  p_amalaki: "morning",
  k_jeera_water: "morning",
  k_methi_water: "morning",

  // ANYTIME
  n_observer_perspective: "anytime",
  n_single_sense_focus: "anytime",
  n_cognitive_reappraisal: "anytime",
  n_identity_rewriting: "anytime",
  n_deliberate_discomfort: "anytime",
  n_spaced_repetition: "anytime",
  n_pre_mortem: "anytime",
  p_ccf_tea: "anytime",
  p_rose_water: "anytime",
  p_coriander_water: "anytime",
  p_coconut_scalp: "anytime",
  p_box_breathing: "anytime",
  p_nadi_shodhana: "anytime",
  v_cardamom_milk: "anytime",

  // EVENING / WIND DOWN
  n_ultradian_reset: "evening",
  n_bhramari: "evening",
  v_ashwagandha_milk: "evening",
  v_foot_massage: "evening",
  v_478_breathing: "evening",
  v_physiological_sigh: "evening",
  k_ajwain_steam: "evening",
  k_kapalabhati: "evening",
};

export function getPracticeTiming(id: string): PracticeTimingTag {
  return PRACTICE_TIMING_TAGS[id] ?? "anytime";
}

/**
 * If the assigned practice's timing tag conflicts with the user's current
 * window, return a soft note. Returns null when there's no conflict.
 */
export function getTimingMismatchNote(
  practiceId: string,
  chronotype: string | null | undefined,
  date: Date = new Date(),
): string | null {
  const tag = getPracticeTiming(practiceId);
  if (tag === "anytime") return null;
  const state = getCurrentWindow(chronotype, date);
  if (tag === "morning" && (state === "peak" || state === "second")) return null;
  if (tag === "evening" && state === "windDown") return null;
  if (tag === "morning") {
    return "This works best in your morning window — but doing it now still counts.";
  }
  return "This works best in your evening window — but doing it now still counts.";
}