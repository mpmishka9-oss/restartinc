import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are a wellness guide for the reStart app.
Based on the user's onboarding answers, assign them ONE chronotype:
- Lion (early riser, peak morning energy, strategic)
- Bear (solar rhythm, steady energy, afternoon dip)
- Wolf (night owl, creative peak in evenings, slow mornings)
- Dolphin (light sleeper, anxious tendencies, variable energy, highly sensitive)

Return ONLY a valid JSON object with these exact lowercase fields:
{
  "chronotype": "lion" | "bear" | "wolf" | "dolphin",
  "headline": "max 8 words describing their rhythm",
  "description": "exactly 2 warm sentences about what this means for their day",
  "animal_emoji": "🦁" | "🐻" | "🐺" | "🐬"
}
No prose, no markdown — JSON only.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { onboarding_answers, path } = await req.json();
    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY not configured");

    const userMsg = `Path: ${path}\nAnswers: ${JSON.stringify(onboarding_answers)}`;

    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 400,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: userMsg }],
      }),
    });

    if (!resp.ok) {
      const t = await resp.text();
      console.error("Anthropic error", resp.status, t);
      const status = resp.status === 429 ? 429 : resp.status === 402 ? 402 : 500;
      return new Response(JSON.stringify({ error: "AI error", detail: t }), {
        status, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await resp.json();
    const text = data.content?.[0]?.text ?? "";
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No JSON in AI response");
    const parsed = JSON.parse(match[0]);

    const ct = String(parsed.chronotype || "").toLowerCase().trim();
    const valid = ["lion","bear","wolf","dolphin"].includes(ct) ? ct : "bear";

    return new Response(JSON.stringify({
      chronotype: valid,
      headline: parsed.headline || "",
      description: parsed.description || "",
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("assign-chronotype error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
