// Edge function: assess
// Calls Google Gemini (gemini-1.5-flash) with a strict triage system prompt.
// GEMINI_API_KEY is read from Supabase secrets and never leaves the server.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SYSTEM_INSTRUCTION = `You are MediBot, an AI health triage assistant for humans, pets, and cattle. You are not a doctor or veterinarian and never claim certainty. Given the patient category and symptoms, respond ONLY with valid JSON, no markdown, no code fences:
{
  "possible_causes": ["...", "...", "..."],
  "follow_up_questions": ["...", "..."],
  "risk_level": "Low" | "Medium" | "High" | "Critical",
  "recommendation": "2-3 sentences on what to do next",
  "care_suggestions": ["...", "..."],
  "see_professional": true | false
}
Rules for care_suggestions: only general supportive care and common over-the-counter options used as directed on the label. NEVER name prescription drugs, antibiotics, or dosages. For pets and cattle NEVER suggest human medications (many are toxic to animals) — only supportive care plus consulting a vet. If risk_level is High or Critical, care_suggestions must be an empty array.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Missing GEMINI_API_KEY" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { category, symptoms } = await req.json();
    if (!category || !symptoms) {
      return new Response(JSON.stringify({ error: "category and symptoms are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userPrompt = `Patient category: ${category}\nSymptoms: ${symptoms}`;

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
          contents: [{ role: "user", parts: [{ text: userPrompt }] }],
          generationConfig: { temperature: 0.4, responseMimeType: "application/json" },
        }),
      },
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error("Gemini error:", geminiRes.status, errText);
      return new Response(JSON.stringify({ error: "Gemini request failed", detail: errText }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await geminiRes.json();
    const raw: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();

    let parsed: unknown;
    try {
      parsed = JSON.parse(cleaned);
    } catch (e) {
      console.error("Parse error:", e, "raw:", raw);
      return new Response(JSON.stringify({ error: "Failed to parse Gemini JSON", raw }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ assessment: parsed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("assess error:", err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
