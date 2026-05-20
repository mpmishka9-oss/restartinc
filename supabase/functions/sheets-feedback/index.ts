import { SignJWT, importPKCS8 } from "npm:jose@5";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

/* ────────────────────────────────────────────────────────────────
   Day 3 feedback → Google Sheet append (1 row per submission).

   Expects payload from the client:
     { user_id, user_name, dosha, chronotype,
       mood_d1, mood_d2, mood_d3,
       q1_felt_difference, q2_practice_hit_hardest,
       q3_pay_monthly, q4_focus_vote, q5_message }

   Required runtime secrets:
     GOOGLE_SHEET_ID
     GOOGLE_SERVICE_ACCOUNT_EMAIL
     GOOGLE_PRIVATE_KEY  (PEM, with literal \n escaped or actual newlines)
   ──────────────────────────────────────────────────────────────── */

const SHEET_RANGE = "Sheet1!A:L";

async function getAccessToken(): Promise<string> {
  const email = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_EMAIL");
  const rawKey = Deno.env.get("GOOGLE_PRIVATE_KEY");
  if (!email || !rawKey) {
    throw new Error("Google service account env vars not configured");
  }
  const key = rawKey.replace(/\\n/g, "\n");
  const pkcs8 = await importPKCS8(key, "RS256");

  const iat = Math.floor(Date.now() / 1000);
  const jwt = await new SignJWT({
    scope: "https://www.googleapis.com/auth/spreadsheets",
  })
    .setProtectedHeader({ alg: "RS256", typ: "JWT" })
    .setIssuer(email)
    .setAudience("https://oauth2.googleapis.com/token")
    .setIssuedAt(iat)
    .setExpirationTime(iat + 3600)
    .sign(pkcs8);

  const tokRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });
  if (!tokRes.ok) {
    const body = await tokRes.text();
    throw new Error(`Google token exchange failed [${tokRes.status}]: ${body}`);
  }
  const tok = await tokRes.json();
  return tok.access_token as string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  try {
    const sheetId = Deno.env.get("GOOGLE_SHEET_ID");
    if (!sheetId) throw new Error("GOOGLE_SHEET_ID is not configured");

    const body = await req.json();

    const row = [
      new Date().toISOString(),                // A Timestamp
      body.user_name ?? "",                    // B User Name
      body.dosha ?? "",                        // C Dosha
      body.chronotype ?? "",                   // D Chronotype
      body.mood_d1 ?? "",                      // E Mood Day 1
      body.mood_d2 ?? "",                      // F Mood Day 2
      body.mood_d3 ?? "",                      // G Mood Day 3
      body.q1_felt_difference ?? "",           // H Felt a difference?
      body.q2_practice_hit_hardest ?? "",      // I Practice hit hardest
      body.q3_pay_monthly ?? "",               // J Willing to pay monthly
      body.q4_focus_vote ?? "",                // K Journey focus vote
      body.q5_message ?? "",                   // L Message to Mishka
    ];

    const accessToken = await getAccessToken();

    const appendRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${SHEET_RANGE}:append?valueInputOption=USER_ENTERED`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ values: [row] }),
      },
    );

    if (!appendRes.ok) {
      const txt = await appendRes.text();
      throw new Error(`Sheets append failed [${appendRes.status}]: ${txt}`);
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("sheets-feedback error:", msg);
    return new Response(JSON.stringify({ ok: false, error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});