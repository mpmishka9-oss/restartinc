import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are a wellness guide for the app Restart. Based on the user's onboarding answers, assign them one chronotype: Lion (early riser, peak morning energy), Bear (solar rhythm, steady energy, afternoon dip), Owl (night owl, creative peak in evenings), or Dolphin (light sleeper, anxious tendencies, variable energy). Return ONLY a JSON object with fields: chronotype (one of: Lion/Bear/Owl/Dolphin), headline (8 words max describing their rhythm), and description (2 warm sentences about what this means for their day).`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { onboarding_answers } = await req.json();
    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY not configured");

    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 500,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: JSON.stringify(onboarding_answers) }],
      }),
    });

    if (!resp.ok) {
      const t = await resp.text();
      console.error("Claude error", resp.status, t);
      return new Response(JSON.stringify({ error: "AI error", detail: t }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await resp.json();
    const text = data.content?.[0]?.text ?? "";
    // Extract JSON object
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No JSON in Claude response");
    const parsed = JSON.parse(match[0]);

    // Normalize chronotype to capitalized
    const ct = String(parsed.chronotype || "").trim();
    const normalized = ct.charAt(0).toUpperCase() + ct.slice(1).toLowerCase();
    const valid = ["Lion", "Bear", "Owl", "Dolphin"].includes(normalized) ? normalized : "Bear";

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