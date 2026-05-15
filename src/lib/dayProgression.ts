/**
 * Day-by-day progression engine for Restart's "Your Ascent" journey.
 *
 * Per-day state is stored in localStorage under `restart_day_state_{n}`:
 *   { dayOpenedAt: number; neuroDone: boolean; ayurvedaDone: boolean }
 *
 * Days 1–3 are free; Day 4+ requires an active subscription.
 */
import { PRACTICES, PRACTICE_BY_ID, type Dosha, type Practice } from "@/data/practices";

export const TOTAL_DAYS = 21;
export const FREE_DAYS = 3;
export const UNLOCK_WAIT_MS = 12 * 60 * 60 * 1000; // 12 hours

export type IntensityLevel = 1 | 2 | 3;

export interface DayState {
  dayOpenedAt: number | null;
  neuroDone: boolean;
  ayurvedaDone: boolean;
}

const EMPTY: DayState = { dayOpenedAt: null, neuroDone: false, ayurvedaDone: false };

const keyFor = (day: number) => `restart_day_state_${day}`;

export function getDayState(day: number): DayState {
  if (typeof window === "undefined") return { ...EMPTY };
  try {
    const raw = localStorage.getItem(keyFor(day));
    if (!raw) return { ...EMPTY };
    const parsed = JSON.parse(raw);
    return {
      dayOpenedAt: typeof parsed.dayOpenedAt === "number" ? parsed.dayOpenedAt : null,
      neuroDone: !!parsed.neuroDone,
      ayurvedaDone: !!parsed.ayurvedaDone,
    };
  } catch {
    return { ...EMPTY };
  }
}

export function setDayState(day: number, patch: Partial<DayState>): DayState {
  const next = { ...getDayState(day), ...patch };
  try { localStorage.setItem(keyFor(day), JSON.stringify(next)); } catch {}
  return next;
}

/** Mark this day as opened (idempotent — only sets timestamp on first open). */
export function markDayOpened(day: number): DayState {
  const s = getDayState(day);
  if (s.dayOpenedAt) return s;
  return setDayState(day, { dayOpenedAt: Date.now() });
}

export function bothTasksDone(s: DayState) {
  return s.neuroDone && s.ayurvedaDone;
}

/**
 * ms until the user can unlock the NEXT day. Negative or 0 means already unlocked.
 * Returns Infinity if tasks aren't both done yet.
 */
export function msUntilNextUnlock(s: DayState): number {
  if (!bothTasksDone(s) || !s.dayOpenedAt) return Infinity;
  return s.dayOpenedAt + UNLOCK_WAIT_MS - Date.now();
}

export function isNextDayUnlocked(s: DayState): boolean {
  return msUntilNextUnlock(s) <= 0;
}

export function formatCountdown(ms: number): string {
  if (ms <= 0) return "ready";
  const totalMin = Math.ceil(ms / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h <= 0) return `${m}min`;
  return `${h}hr ${m}min`;
}

/* ── Completed day list (kept in sync with restart_completed_days for the
      mountain-path "completed glow" overlay used by JourneyScreen) ── */
function readCompletedDays(): number[] {
  try {
    const raw = localStorage.getItem("restart_completed_days");
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr.filter((n) => typeof n === "number") : [];
  } catch { return []; }
}
function writeCompletedDays(arr: number[]) {
  try { localStorage.setItem("restart_completed_days", JSON.stringify(arr.sort((a, b) => a - b))); } catch {}
}

export function getCompletedDays(): number[] { return readCompletedDays(); }

export function markDayComplete(day: number) {
  const list = readCompletedDays();
  if (!list.includes(day)) {
    list.push(day);
    writeCompletedDays(list);
  }
}

export function getCurrentDay(): number {
  try {
    const v = parseInt(localStorage.getItem("restart_day") || "1", 10);
    return Number.isFinite(v) && v > 0 ? Math.min(v, TOTAL_DAYS) : 1;
  } catch { return 1; }
}

export function setCurrentDay(day: number) {
  try { localStorage.setItem("restart_day", String(Math.max(1, Math.min(day, TOTAL_DAYS)))); } catch {}
}

/**
 * Advance to the next day. Marks `currentDay` complete, bumps `restart_day`,
 * and returns the new day number.
 */
export function advanceToNextDay(currentDay: number): number {
  markDayComplete(currentDay);
  const next = Math.min(currentDay + 1, TOTAL_DAYS);
  setCurrentDay(next);
  return next;
}

/* ── Today's mood (read from CheckInScreen's localStorage write) ── */
export type CheckInMood =
  | "anxious" | "stressed" | "low" | "overwhelmed"
  | "angry" | "focused" | "good" | "numb";

export interface TodayCheckIn {
  mood: CheckInMood;
  intensityLevel: IntensityLevel;
  /** true when no fresh check-in for today exists (defaults applied) */
  isDefault: boolean;
}

export function intensityToLevel(intensity: number): IntensityLevel {
  if (intensity <= 4) return 1;
  if (intensity <= 7) return 2;
  return 3;
}

export function getTodayCheckIn(): TodayCheckIn {
  try {
    const dateStr = localStorage.getItem("restart_checkin_date");
    const today = new Date().toDateString();
    if (dateStr === today) {
      const moodRaw = (localStorage.getItem("restart_checkin_emotion") || "").toLowerCase();
      const intensity = parseInt(localStorage.getItem("restart_checkin_intensity") || "5", 10);
      const mood = (["anxious","stressed","low","overwhelmed","angry","focused","good","numb"]
        .includes(moodRaw) ? moodRaw : "focused") as CheckInMood;
      return {
        mood,
        intensityLevel: intensityToLevel(Number.isFinite(intensity) ? intensity : 5),
        isDefault: false,
      };
    }
  } catch {}
  return { mood: "focused", intensityLevel: 1, isDefault: true };
}

export function hasCheckedInToday(): boolean {
  try {
    return localStorage.getItem("restart_checkin_date") === new Date().toDateString();
  } catch { return false; }
}

/* ── Practice assignment matrices ── */

/**
 * Mood + intensity-level → neuroscience practice id.
 * Spec maps each Didi mood to three escalating practices (L1/L2/L3).
 * Where the spec referenced a practice not in the library (e.g. "HIIT
 * Movement Prompt") we substitute the closest available behavioural practice
 * so every cell resolves to a real Practice.
 */
const NEURO_MATRIX: Record<CheckInMood, [string, string, string]> = {
  anxious:     ["n_observer_perspective", "n_single_sense_focus", "n_cognitive_reappraisal"],
  stressed:    ["n_ultradian_reset",      "n_woop",               "n_pre_mortem"           ],
  low:         ["n_friction_sprint",      "n_bhramari",           "n_identity_rewriting"   ],
  overwhelmed: ["n_single_sense_focus",   "n_cognitive_reappraisal","n_implementation_intention"],
  focused:     ["n_pomodoro",             "n_interleaved_learning","n_spaced_repetition"   ],
  good:        ["n_deliberate_discomfort","n_identity_rewriting", "n_deliberate_discomfort"],
  angry:       ["n_cognitive_reappraisal","n_observer_perspective","n_pre_mortem"          ],
  numb:        ["n_friction_sprint",      "n_bhramari",           "n_identity_rewriting"   ],
};

const AYURVEDA_POOLS: Record<Dosha, string[]> = {
  Vata:  ["v_nasya_oil","v_abhyanga","v_ashwagandha_milk","v_cardamom_milk","v_foot_massage","v_physiological_sigh","v_478_breathing"],
  Pitta: ["p_ccf_tea","p_amalaki","p_rose_water","p_coconut_scalp","p_coriander_water","p_box_breathing","p_nadi_shodhana"],
  Kapha: ["k_tulsi_ginger_tea","k_trikatu","k_ginger_lemon_shot","k_ajwain_steam","k_methi_water","k_jeera_water","k_kapalabhati"],
};

const FALLBACK_NEURO = PRACTICES.find((p) => p.category === "Neuroscience")!;
const FALLBACK_AYUR  = PRACTICES.find((p) => p.category === "Ayurveda")!;

export function getNeuroPractice(mood: CheckInMood, level: IntensityLevel): Practice {
  const row = NEURO_MATRIX[mood] ?? NEURO_MATRIX.focused;
  const id = row[level - 1] ?? row[0];
  return PRACTICE_BY_ID[id] ?? FALLBACK_NEURO;
}

export function getAyurvedaPractice(dosha: Dosha | null | undefined, day: number): Practice {
  const pool = dosha ? AYURVEDA_POOLS[dosha] : null;
  if (!pool || pool.length === 0) return FALLBACK_AYUR;
  const idx = ((Math.max(1, day) - 1) % pool.length + pool.length) % pool.length;
  return PRACTICE_BY_ID[pool[idx]] ?? FALLBACK_AYUR;
}

export interface DayPractices {
  neuro: Practice;
  ayurveda: Practice;
  mood: CheckInMood;
  intensityLevel: IntensityLevel;
  isDefaultMood: boolean;
}

export function getPracticesForDay(dosha: Dosha | null | undefined, day: number): DayPractices {
  const checkIn = getTodayCheckIn();
  return {
    neuro: getNeuroPractice(checkIn.mood, checkIn.intensityLevel),
    ayurveda: getAyurvedaPractice(dosha, day),
    mood: checkIn.mood,
    intensityLevel: checkIn.intensityLevel,
    isDefaultMood: checkIn.isDefault,
  };
}

/** Days 1–3 are free; Day 4+ requires Pro. */
export function dayRequiresPro(day: number): boolean {
  return day > FREE_DAYS;
}

/**
 * Whether the user is allowed to OPEN this day's card. They must have
 * unlocked it via prior progression (or it's their current day, or already
 * complete).
 */
export function canOpenDay(day: number, currentDay: number): boolean {
  return day <= currentDay;
}