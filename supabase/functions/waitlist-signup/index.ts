import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'
import { createClient } from 'npm:@supabase/supabase-js@2'

const ADMIN_RECIPIENT = "mpmishka9@gmail.com";
const FROM = "RESTART App <onboarding@resend.dev>";

const esc = (s: unknown) =>
  String(s ?? "—").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) && s.length <= 255;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const key = Deno.env.get("RESEND_API_KEY");
    if (!key) throw new Error("RESEND_API_KEY not configured");

    const body = await req.json();
    const email = String(body.email || "").trim().toLowerCase();
    const name = String(body.name || "").trim().slice(0, 100) || "there";
    const dosha = body.dosha ? String(body.dosha).slice(0, 50) : null;
    const chronotype = body.chronotype ? String(body.chronotype).slice(0, 50) : null;
    const user_id = body.user_id || null;

    if (!isEmail(email)) {
      return new Response(JSON.stringify({ ok: false, error: "Invalid email" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const completed_at = new Date().toISOString();
    const { error: dbErr } = await supabase.from("cohort_2_waitlist").insert({
      user_id,
      name: body.name ? String(body.name).slice(0, 100) : null,
      email,
      dosha,
      chronotype,
      completed_at,
    });
    if (dbErr) throw new Error(`DB insert failed: ${dbErr.message}`);

    const date = new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });

    // Admin notification only (no user confirmation until domain verified on Resend)
    const adminHtml = `
<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#1A2A4A;line-height:1.5;font-size:14px;">
  <h2 style="border-bottom:2px solid #fdfcb8;padding-bottom:8px;">New Cohort 2 signup</h2>
  <table style="width:100%;border-collapse:collapse;">
    <tr><td style="padding:6px 0;color:#666;width:140px;">Name</td><td><b>${esc(name)}</b></td></tr>
    <tr><td style="padding:6px 0;color:#666;">Email</td><td>${esc(email)}</td></tr>
    <tr><td style="padding:6px 0;color:#666;">Dosha</td><td>${esc(dosha)}</td></tr>
    <tr><td style="padding:6px 0;color:#666;">Chronotype</td><td>${esc(chronotype)}</td></tr>
    <tr><td style="padding:6px 0;color:#666;">Date</td><td>${esc(date)}</td></tr>
  </table>
</div>`;

    const send = (to: string, subject: string, html: string) =>
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
        body: JSON.stringify({ from: FROM, to: [to], subject, html }),
      });

    const adminRes = await send(ADMIN_RECIPIENT, `New Cohort 2 signup — ${name}`, adminHtml);

    if (!adminRes.ok) {
      console.error("Admin notify failed:", adminRes.status, await adminRes.text());
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("waitlist-signup error:", e?.message || e);
    return new Response(JSON.stringify({ ok: false, error: e?.message || "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});