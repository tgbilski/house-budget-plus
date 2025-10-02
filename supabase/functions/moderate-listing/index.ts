import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, description, category, website_url, listingId } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    console.log("Moderating listing:", { title, category, listingId });

    // Check content with AI
    const moderationPrompt = `You are a content moderator. Analyze this marketplace listing for inappropriate content, spam, or violations.

Category: ${category}
Title: ${title}
Description: ${description}
${website_url ? `Website: ${website_url}` : ''}

Check for:
1. Profanity, hate speech, or offensive content
2. Spam or low-quality content (e.g., "test", "asdf", gibberish)
3. Scams or fraudulent offers
4. Inappropriate for the category
5. Valid business information

Respond with a JSON object:
{
  "approved": true/false,
  "reason": "explanation if rejected",
  "confidence": 0-100
}`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a content moderator. Always respond with valid JSON only." },
          { role: "user", content: moderationPrompt }
        ],
        temperature: 0.3,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI moderation error:", aiResponse.status, errorText);
      throw new Error("AI moderation failed");
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices[0].message.content;
    
    console.log("AI moderation response:", aiContent);
    
    // Parse AI response
    let moderationResult;
    try {
      moderationResult = JSON.parse(aiContent);
    } catch (e) {
      console.error("Failed to parse AI response:", e);
      moderationResult = { approved: true, reason: "Auto-approved due to parsing error", confidence: 50 };
    }

    // Update listing in database if listingId provided
    if (listingId) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      const newStatus = moderationResult.approved ? 'pending' : 'rejected';
      
      await supabase
        .from('marketplace_listings')
        .update({
          status: newStatus,
          moderation_result: moderationResult,
          rejection_reason: moderationResult.approved ? null : moderationResult.reason,
        })
        .eq('id', listingId);
      
      console.log("Updated listing status to:", newStatus);
    }

    return new Response(JSON.stringify(moderationResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in moderate-listing:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
