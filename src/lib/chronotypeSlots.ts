import type { Chronotype } from "@/lib/chronotype";

export const CHRONOTYPE_SLOT: Record<Chronotype, { label: string; alt?: string }> = {
  Lion: { label: "Morning slot · 6–9 AM" },
  Bear: { label: "Mid-morning · 8–11 AM" },
  Owl: { label: "Evening slot · 6–9 PM" },
  Dolphin: { label: "Anytime · 9–11 AM", alt: "Or wind-down · 8–10 PM" },
};