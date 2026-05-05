import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, context } = await req.json();
    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY is not configured");

    const firstName = context?.first_name || "friend";
    const chronotype = context?.chronotype || "natural";
    const moods = context?.last_3_mood_entries || "no recent logs";
    const completed = context?.completed_practices ?? 0;

    const system = `You are Didi, the warm and wise wellness guide inside the ReStart app. You speak like a knowledgeable older sister — calm, direct, never clinical. You know the user's name is ${firstName}, their chronotype is ${chronotype}, and their recent mood logs show ${moods}. They have completed ${completed} practices.

Your job is to:
1. Understand how they're feeling right now
2. Identify a pattern in their behaviour (gently)
3. Recommend ONE specific action — always tie it to their Journey screen
4. Keep responses under 3 sentences
5. End responses with a question or a nudge that keeps them engaged
6. Never use clinical language. Sound warm, real, slightly playful.
7. Occasionally reward them with XP for engaging ("That just earned you 10 XP ✦")`;

    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 400,
        system,
        messages,
      }),
    });

    if (!resp.ok) {
      const t = await resp.text();
      console.error("Anthropic error", resp.status, t);
      return new Response(JSON.stringify({ error: "AI error", detail: t }), {
        status: resp.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const data = await resp.json();
    const reply = data?.content?.[0]?.text ?? "";
    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});