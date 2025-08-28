import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? '';
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? '';
const openAIApiKey = Deno.env.get("OPENAI_API_KEY") ?? '';

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });
    
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: takeoutData } = await supabase
      .from('takeout_transactions')
      .select('date, amount, category, merchant')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(50);

    const { data: budgetData } = await supabase
      .from('budget_data')
      .select('income, expenses, page_type')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1);
      
    const { data: checkinData } = await supabase
      .from('daily_checkins')
      .select('date, feeling, notes')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(10);

    const dataContext = {
      recent_takeout: takeoutData || [],
      most_recent_budget: budgetData?.[0] || null,
      recent_checkins: checkinData || [],
      current_date: new Date().toISOString().split('T')[0]
    };
    
    if (takeoutData?.length === 0 && budgetData?.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        insights: [],
        message: "Not enough data to generate insights. Please add more transactions and budget information."
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = `
      You are an expert financial analyst. Your task is to generate 3 personalized financial insights for the user based on the provided data.
      
      Each insight must be a JSON object with the following properties:
      - "id" (string): a unique ID (e.g., a timestamp or a random string).
      - "insight_type" (string): must be one of 'spending_pattern', 'budget_prediction', or 'savings_opportunity'.
      - "title" (string): a short, clear title for the insight.
      - "description" (string): a detailed, actionable description.
      - "priority" (number): a priority level (1=High, 2=Medium, 3=Low).
      - "data" (object): an optional object with relevant metrics.
      
      The entire response must be a single JSON object with a key "insights" which is an array of these objects. Do not include any other text or markdown outside the JSON.
      
      User Data:
      ${JSON.stringify(dataContext, null, 2)}
    `;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openAIApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a helpful financial advisor that provides personalized insights based on spending data." },
          { role: "user", content: systemPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1500,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errorDetails = await response.json();
      console.error("OpenAI API error:", errorDetails);
      throw new Error("OpenAI API call failed");
    }

    const aiResponse = await response.json();
    const insightsJSON = aiResponse.choices?.[0]?.message?.content;
    
    if (!insightsJSON) {
      console.error("OpenAI returned no content.");
      throw new Error("No content returned from OpenAI.");
    }
    
    const parsedInsights = JSON.parse(insightsJSON).insights;

    await supabase.from('user_insights').delete().eq('user_id', user.id);

    const { error: insertError } = await supabase
      .from('user_insights')
      .insert(parsedInsights.map((insight) => ({
        user_id: user.id,
        insight_type: insight.insight_type || insight.type,
        title: insight.title,
        description: insight.description,
        priority: insight.priority || 2,
        data: insight.data || {},
      })));

    if (insertError) {
      console.error('Error storing insights:', insertError);
      throw new Error('Database insertion failed');
    }

    return new Response(JSON.stringify({
      success: true,
      count: parsedInsights.length,
      message: `Successfully generated and saved ${parsedInsights.length} insights.`
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error('Error in generate-insights function:', error.message);
    return new Response(JSON.stringify({
      error: 'Failed to generate insights',
      details: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
