const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve((req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const enabled = (Deno.env.get("TEST_MODE") ?? "").toLowerCase() === "true";
  return new Response(JSON.stringify({ enabled }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});