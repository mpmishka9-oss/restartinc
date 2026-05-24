import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'
import { createClient } from 'npm:@supabase/supabase-js@2'

const RECIPIENT = "mpmishka9@gmail.com";
const FROM = "RESTART App <onboarding@resend.dev>";

const esc = (s: unknown) =>
  String(s ?? "—")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const sb = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
    );
    const { data: claimData, error: claimErr } = await sb.auth.getClaims(
      authHeader.replace("Bearer ", ""),
    );
    if (claimErr || !claimData?.claims) {
      return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const key = Deno.env.get("RESEND_API_KEY");
    if (!key) throw new Error("RESEND_API_KEY not configured");

    const b = await req.json();
    const name = b.user_name || "Anonymous";
    const subject = `New RESTART Feedback — ${name} completed Day 3`;
    const date = new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });

    const html = `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1A2A4A;line-height:1.5;">
  <h2 style="color:#1A2A4A;border-bottom:2px solid #fdfcb8;padding-bottom:8px;">New RESTART Feedback</h2>

  <h3 style="margin-top:24px;color:#1A2A4A;">User Details</h3>
  <table style="width:100%;border-collapse:collapse;font-size:14px;">
    <tr><td style="padding:6px 0;color:#666;width:140px;">Name</td><td><b>${esc(name)}</b></td></tr>
    <tr><td style="padding:6px 0;color:#666;">Dosha</td><td>${esc(b.dosha)}</td></tr>
    <tr><td style="padding:6px 0;color:#666;">Chronotype</td><td>${esc(b.chronotype)}</td></tr>
    <tr><td style="padding:6px 0;color:#666;">Date completed</td><td>${esc(date)}</td></tr>
  </table>

  <h3 style="margin-top:24px;color:#1A2A4A;">Mood Arc</h3>
  <p style="font-size:15px;margin:0;">
    Day 1: <b>${esc(b.mood_d1)}</b> &nbsp;·&nbsp;
    Day 2: <b>${esc(b.mood_d2)}</b> &nbsp;·&nbsp;
    Day 3: <b>${esc(b.mood_d3)}</b>
  </p>

  <h3 style="margin-top:24px;color:#1A2A4A;">Feedback Responses</h3>
  <div style="background:#faf8e8;padding:16px;border-radius:8px;font-size:14px;">
    <p style="margin:0 0 12px;"><b>Q1 — Did they feel a difference?</b><br>${esc(b.q1_felt_difference)}</p>
    <p style="margin:0 0 12px;"><b>Q2 — Practice that hit hardest:</b><br>${esc(b.q2_practice_hit_hardest)}</p>
    <p style="margin:0 0 12px;"><b>Q3 — Willing to pay monthly:</b><br>${esc(b.q3_pay_monthly)}</p>
    <p style="margin:0 0 12px;"><b>Q4 — Journey focus vote:</b><br>${esc(b.q4_focus_vote)}</p>
    <p style="margin:0;"><b>Q5 — Message to Mishka:</b><br>${esc(b.q5_message)}</p>
  </div>
</div>`;

    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({ from: FROM, to: [RECIPIENT], subject, html }),
    });
    const data = await r.json();
    if (!r.ok) throw new Error(`Resend failed [${r.status}]: ${JSON.stringify(data)}`);

    return new Response(JSON.stringify({ ok: true, id: data.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("send-feedback-email error:", e?.message || e);
    return new Response(JSON.stringify({ ok: false, error: e?.message || "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});