import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { message, path, onboarding_answers } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = `You are Didi, a warm and grounding wellness guide in the reStart app.
You speak like a caring older sister — warm, wise, never clinical.
The user has just shared how they're feeling.

First, respond in 3-4 sentences with genuine warmth and zero judgement.
Acknowledge what they shared specifically. Do not give advice yet. Just be present.

Then on a new line return a JSON block wrapped in <json></json> tags with these EXACT fields:
- detected_state: one of [anxiety, stress, burnout, overwhelm]
- severity_score: 1-10 based on emotional intensity
  (1-2 = very mild, 3-4 = mild, 5-6 = moderate, 7-8 = intense, 9-10 = crisis level)
- dosha: one of [vata, pitta, kapha, vata-pitta]
- assigned_level: an integer 1, 2, or 3, determined as follows —
  FOR EMOTIONAL PATH: severity 1-3 → 1, severity 4-6 → 2, severity 7-10 → 3.
  FOR AMBITIOUS PATH: read energy_today, clarity, work_style from answers.
    High energy + very clear + deep focus → 3
    Any two moderate answers → 2
    Low/drained + vague/none + avoiding → 1
- level_description: ONE warm sentence explaining the level poetically, not numerically.
  e.g. "You seem like you need a gentle on-ramp today, not a sprint."
- suggested_practices: array of 3 strings (practice titles) matching detected_state.

Context: path=${path}. onboarding_answers=${JSON.stringify(onboarding_answers)}.

Return only the warm message text followed by the <json>...</json> block. No markdown.`;

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
      }),
    });

    if (!resp.ok) {
      const t = await resp.text();
      console.error("AI gateway error", resp.status, t);
      const status = resp.status === 429 ? 429 : resp.status === 402 ? 402 : 500;
      return new Response(JSON.stringify({ error: "AI error", detail: t }), {
        status, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await resp.json();
    const fullText: string = data.choices?.[0]?.message?.content ?? "";

    const jsonMatch = fullText.match(/<json>([\s\S]*?)<\/json>/i);
    let parsed: any = {};
    if (jsonMatch) {
      try { parsed = JSON.parse(jsonMatch[1].trim()); } catch (e) { console.error("JSON parse fail", e); }
    }
    const warm = fullText.replace(/<json>[\s\S]*?<\/json>/i, "").trim();

    return new Response(JSON.stringify({
      warm,
      detected_state: parsed.detected_state ?? null,
      severity_score: parsed.severity_score ?? null,
      dosha: parsed.dosha ?? null,
      assigned_level: parsed.assigned_level ?? 1,
      level_description: parsed.level_description ?? null,
      suggested_practices: parsed.suggested_practices ?? [],
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("check-in error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
