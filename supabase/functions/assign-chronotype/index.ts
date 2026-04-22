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
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: JSON.stringify(onboarding_answers) },
        ],
      }),
    });

    if (!resp.ok) {
      const t = await resp.text();
      console.error("AI gateway error", resp.status, t);
      if (resp.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (resp.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Add funds in Settings → Workspace." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "AI error", detail: t }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await resp.json();
    const text = data.choices?.[0]?.message?.content ?? "";
    // Extract JSON object
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No JSON in AI response");
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