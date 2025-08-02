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
    // Auth header check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const jwt = authHeader.replace("Bearer ", "");

    // Supabase client
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    // Get user from JWT
    const { data: { user }, error: authError } = await supabase.auth.getUser(jwt);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check subscription status
    const { data: subscription, error: subError } = await supabase
      .from("subscribers")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
    if (subError) {
      console.error("Subscription check error:", subError);
    }
    if (!subscription?.subscribed) {
      return new Response(JSON.stringify({
        error: "Subscription required",
        message: "Please subscribe to access AI insights feature."
      }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get question from request
    const { question } = await req.json();
    if (!question || typeof question !== "string") {
      return new Response(JSON.stringify({ error: "Missing or invalid question" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch user's budget data
    const { data: budgetData, error: budgetError } = await supabase
      .from("budget_calculators")
      .select("*")
      .eq("user_id", user.id);
    const { data: takeoutData, error: takeoutError } = await supabase
      .from("takeout_transactions")
      .select("*")
      .eq("user_id", user.id)
      .limit(50)
      .order("date", { ascending: false });

    // Prepare context for OpenAI
    let dataContext = "User's Financial Data:\n\n";
    if (budgetData && budgetData.length > 0) {
      dataContext += "Budget Information:\n";
      budgetData.forEach((budget, index) => {
        dataContext += `Budget ${index + 1}:\n`;
        dataContext += `- Monthly Income: $${budget.monthly_income || 0}\n`;
        dataContext += `- Fixed Expenses: ${JSON.stringify(budget.expenses || {})}\n`;
        dataContext += `- Additional Expenses: ${JSON.stringify(budget.additional_expenses || [])}\n`;
        dataContext += `- Streaming Services: ${JSON.stringify(budget.streaming_services || [])}\n\n`;
      });
    } else {
      dataContext += "No budget data available.\n\n";
    }
    if (takeoutData && takeoutData.length > 0) {
      dataContext += "Recent Transactions:\n";
      takeoutData.forEach((transaction) => {
        dataContext += `- Date: ${transaction.date}, Amount: $${transaction.amount}, Merchant: ${transaction.merchant}\n`;
      });
    } else {
      dataContext += "No recent transactions available.\n";
    }

    // Query OpenAI
    const openaiUrl = "https://api.openai.com/v1/chat/completions";
    const systemPrompt = `
      You are a financial advisor AI. The following is the user's financial data and question.
      Provide clear, actionable, and friendly advice in a few paragraphs.
      If the question is unclear or you lack data, explain what is missing or suggest a starting point.
      Data Context:
      ${dataContext}
    `;
    const openaiBody = {
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: question }
      ],
      max_tokens: 500,
      temperature: 0.7,
    };

    const openaiResp = await fetch(openaiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openAIApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(openaiBody),
    });

    if (!openaiResp.ok) {
      const errorDetails = await openaiResp.json();
      console.error("OpenAI error:", errorDetails);
      return new Response(JSON.stringify({
        error: "OpenAI API error",
        details: errorDetails,
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const completion = await openaiResp.json();
    const insight = completion.choices?.[0]?.message?.content ?? "No insight returned.";

    return new Response(JSON.stringify({ insight }), {
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
