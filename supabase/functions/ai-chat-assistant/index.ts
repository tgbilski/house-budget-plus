import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const openAIApiKey = Deno.env.get("OPENAI_API_KEY");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const jwt = authHeader.replace("Bearer ", "");

    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    const { data: { user }, error: authError } = await supabase.auth.getUser(jwt);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: subscription } = await supabase
      .from("subscribers")
      .select("subscribed")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!subscription?.subscribed) {
      return new Response(JSON.stringify({
        error: "Subscription required",
        message: "Please subscribe to access AI insights feature."
      }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { question } = await req.json();
    if (!question || typeof question !== "string") {
      return new Response(JSON.stringify({ error: "Missing or invalid question" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // --- CONTEXT CONDENSATION ---
    // Fetch only the most recent budget data
    const { data: budgetData } = await supabase
      .from("budget_data")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1);

    // Fetch a limited number of recent transactions
    const { data: takeoutData } = await supabase
      .from("takeout_transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .limit(50); // Reduced from 100

    const { data: profileData } = await supabase
      .from("profiles")
      .select("first_name, last_name")
      .eq("user_id", user.id)
      .single();

    // Prepare concise context for OpenAI
    let dataContext = `User financial profile:\n\n`;
    
    if (profileData) {
      dataContext += `User Name: ${profileData.first_name || ''} ${profileData.last_name || ''}\n`;
    }

    if (budgetData && budgetData.length > 0) {
      const budget = budgetData[0]; // Use only the most recent budget
      dataContext += `Most Recent Budget (${budget.page_type}, Created: ${new Date(budget.created_at).toLocaleDateString()}):\n`;
      dataContext += `- Monthly Income: $${budget.income || 0}\n`;
      if (budget.expenses) {
        dataContext += `- Expenses: ${JSON.stringify(budget.expenses, null, 2)}\n`;
      }
    } else {
      dataContext += "No recent budget data available.\n";
    }

    if (takeoutData && takeoutData.length > 0) {
      dataContext += `Recent Transactions (Last ${takeoutData.length}):\n`;
      takeoutData.forEach(tx => {
        dataContext += `- ${tx.date}: $${tx.amount} at ${tx.merchant} (${tx.category})\n`;
      });
    } else {
      dataContext += "No recent transaction history available.\n";
    }

    const systemPrompt = `
      You are an expert financial advisor AI. Your goal is to provide **personalized, actionable, and helpful financial advice**.
      
      Your response should be formatted using **Markdown** for clarity. Use headings, bold text, and bullet points.
      
      Base your advice on the following data, and if a question cannot be answered with the data, state that clearly. Avoid making up information.
      
      ---
      ${dataContext}
      ---
    `;

    const openaiBody = {
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: question }
      ],
      max_tokens: 750, // Adjusted max tokens
      temperature: 0.7,
    };

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openAIApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(openaiBody),
    });

    if (!response.ok) {
      const errorDetails = await response.json();
      console.error("OpenAI API error:", errorDetails);
      return new Response(JSON.stringify({
        error: "OpenAI API error",
        details: errorDetails,
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const completion = await response.json();
    const insight = completion.choices?.[0]?.message?.content;

    // --- NEW: Handle empty insight explicitly ---
    if (!insight) {
      return new Response(JSON.stringify({ response: "I'm sorry, I couldn't generate a helpful response at this time. Please try again." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    return new Response(JSON.stringify({ response: insight }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("ai-budget-insights function error:", error);
    return new Response(JSON.stringify({ error: error.message || String(error) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
