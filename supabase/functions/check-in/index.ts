import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { message, days_since_signup, streak_days } = await req.json();
    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY not configured");

    const systemPrompt = `You are Didi, a warm and grounding wellness guide in the Restart app. The user has just shared how they're feeling. Your job is two things: first, respond in 3-4 sentences with warmth and without judgement — like a caring older sister who gets it. Second, return a structured JSON block at the end of your response.

The JSON must contain:
- detected_state: one of [anxiety, stress, burnout, overwhelm]
- severity_score: 1 to 10 (1 = mild, 10 = crisis level) based on the emotional intensity of their message
- dosha: one of [vata, pitta, kapha, vata-pitta]
- suggested_practice_types: array of 2 values from [neuro, ayurveda]
- assigned_level: calculate as follows —
  Start with: if days_since_signup < 14 → base_level = 1, if 15-45 → base_level = 2, if 46+ → base_level = 3
  Then: if severity_score >= 7 → drop one level (minimum 1)
  Then: if streak_days >= 5 → can stay at base_level or go up one
  Final assigned_level is the result of this logic.

Return the warm message first, then the JSON on a new line wrapped in <json></json> tags.

Context: days_since_signup=${days_since_signup}, streak_days=${streak_days}.`;

    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 800,
        system: systemPrompt,
        messages: [{ role: "user", content: message }],
      }),
    });

    if (!resp.ok) {
      const t = await resp.text();
      console.error("Claude error", resp.status, t);
      return new Response(JSON.stringify({ error: "AI error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await resp.json();
    const fullText: string = data.content?.[0]?.text ?? "";

    // Extract <json>...</json>
    const jsonMatch = fullText.match(/<json>([\s\S]*?)<\/json>/i);
    let parsed: any = {};
    if (jsonMatch) {
      try { parsed = JSON.parse(jsonMatch[1].trim()); } catch (e) { console.error("JSON parse fail", e); }
    }
    const warm = fullText.replace(/<json>[\s\S]*?<\/json>/i, "").trim();

    return new Response(JSON.stringify({
      warm_response: warm,
      detected_state: parsed.detected_state ?? null,
      severity_score: parsed.severity_score ?? null,
      dosha: parsed.dosha ?? null,
      suggested_practice_types: parsed.suggested_practice_types ?? [],
      assigned_level: parsed.assigned_level ?? 1,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("check-in error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});