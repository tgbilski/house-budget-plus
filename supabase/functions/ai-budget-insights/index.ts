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

    // Fetch all user's financial data from different sources
    const { data: budgetData, error: budgetError } = await supabase
      .from("budget_data")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    const { data: takeoutData, error: takeoutError } = await supabase
      .from("takeout_transactions")
      .select("*")
      .eq("user_id", user.id)
      .limit(100)
      .order("date", { ascending: false });

    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    const { data: pdfData, error: pdfError } = await supabase
      .from("pdf_processing_logs")
      .select("*")
      .eq("user_id", user.id)
      .eq("processing_status", "completed")
      .order("created_at", { ascending: false })
      .limit(10);

    // Prepare comprehensive context for OpenAI
    let dataContext = `User's Comprehensive Financial Profile:\n\n`;
    
    // Add profile information
    if (profileData) {
      dataContext += `Profile Information:\n`;
      dataContext += `- Name: ${profileData.first_name || ''} ${profileData.last_name || ''}\n`;
      dataContext += `- Email: ${profileData.email || ''}\n\n`;
    }

    // Add budget information from all budget entries
    if (budgetData && budgetData.length > 0) {
      dataContext += `Budget Information (Multiple Budget Scenarios):\n`;
      budgetData.forEach((budget, index) => {
        dataContext += `Budget ${index + 1} (${budget.page_type}, Created: ${new Date(budget.created_at).toLocaleDateString()}):\n`;
        dataContext += `- Monthly Income: $${budget.income || 0}\n`;
        
        if (budget.expenses && typeof budget.expenses === 'object') {
          const expenses = budget.expenses as any;
          
          if (expenses.fixed && typeof expenses.fixed === 'object') {
            dataContext += `- Fixed Expenses: \n`;
            Object.entries(expenses.fixed).forEach(([key, value]) => {
              dataContext += `  * ${key}: $${value}\n`;
            });
          }
          
          if (expenses.custom && Array.isArray(expenses.custom)) {
            dataContext += `- Custom Expenses: \n`;
            expenses.custom.forEach((expense: any) => {
              dataContext += `  * ${expense.name || 'Unknown'}: $${expense.amount || 0}\n`;
            });
          }
          
          if (expenses.subscriptionServices && typeof expenses.subscriptionServices === 'object') {
            dataContext += `- Subscription Services: ${JSON.stringify(expenses.subscriptionServices)}\n`;
          }
          
          if (expenses.additionalSubscriptions && Array.isArray(expenses.additionalSubscriptions)) {
            dataContext += `- Additional Subscriptions: ${JSON.stringify(expenses.additionalSubscriptions)}\n`;
          }
        }
        dataContext += `\n`;
      });
    } else {
      dataContext += "No budget data available.\n\n";
    }

    // Add transaction data with spending patterns
    if (takeoutData && takeoutData.length > 0) {
      dataContext += `Recent Transaction History (Last ${takeoutData.length} transactions):\n`;
      
      // Group transactions by month for pattern analysis
      const monthlySpending = {};
      const categorySpending = {};
      const merchantSpending = {};
      
      takeoutData.forEach((transaction) => {
        const month = new Date(transaction.date).toLocaleString('default', { month: 'long', year: 'numeric' });
        const category = transaction.category || 'Uncategorized';
        const merchant = transaction.merchant || 'Unknown';
        
        monthlySpending[month] = (monthlySpending[month] || 0) + parseFloat(transaction.amount || '0');
        categorySpending[category] = (categorySpending[category] || 0) + parseFloat(transaction.amount || '0');
        merchantSpending[merchant] = (merchantSpending[merchant] || 0) + parseFloat(transaction.amount || '0');
        
        dataContext += `- ${transaction.date}: $${transaction.amount} at ${merchant} (${category})\n`;
      });
      
      dataContext += `\nSpending Analysis:\n`;
      dataContext += `Monthly Spending Totals:\n`;
      Object.entries(monthlySpending).forEach(([month, total]) => {
        dataContext += `  * ${month}: $${total.toFixed(2)}\n`;
      });
      
      dataContext += `Category Spending Totals:\n`;
      Object.entries(categorySpending).forEach(([category, total]) => {
        dataContext += `  * ${category}: $${total.toFixed(2)}\n`;
      });
      
      dataContext += `Top Merchants:\n`;
      Object.entries(merchantSpending)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .forEach(([merchant, total]) => {
          dataContext += `  * ${merchant}: $${total.toFixed(2)}\n`;
        });
      
    } else {
      dataContext += "No recent transactions available.\n";
    }

    // Add PDF processing insights if available
    if (pdfData && pdfData.length > 0) {
      dataContext += `\nDocument Analysis:\n`;
      pdfData.forEach((pdf, index) => {
        dataContext += `Document ${index + 1}: ${pdf.file_name}\n`;
        if (pdf.ai_categorization) {
          dataContext += `- AI Analysis: ${JSON.stringify(pdf.ai_categorization)}\n`;
        }
        if (pdf.extracted_text && pdf.extracted_text.length > 200) {
          dataContext += `- Content Preview: ${pdf.extracted_text.substring(0, 200)}...\n`;
        }
      });
    }

    // Enhanced system prompt for comprehensive financial analysis
    const systemPrompt = `
      You are an expert financial advisor AI with access to comprehensive user financial data.
      
      **Use Markdown for your response to improve readability.** Use headings (#, ##), bold text (**bold**), and bullet points (-) where appropriate to organize your advice and insights.

      The user's complete financial profile includes:
      - Multiple budget scenarios and planning documents
      - Detailed transaction history with spending patterns
      - Monthly and category-based spending analysis
      - Document analysis from financial PDFs
      - Profile information for personalized advice
      
      Provide detailed, actionable, and personalized financial advice based on ALL available data.
      Consider spending patterns, budget vs actual spending, trends over time, and specific financial goals.
      
      If the user asks about vendor comparisons, vacation planning, or specific spending categories, 
      reference their actual data and provide concrete recommendations.
      
      If data is limited in certain areas, acknowledge this and suggest next steps.
      
      Data Context:
      ${dataContext}
    `;
    const openaiBody = {
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: question }
      ],
      max_tokens: 1000,
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
      console.error("OpenAI error:", errorDetails);
      return new Response(JSON.stringify({
        error: "OpenAI API error",
        details: errorDetails,
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const completion = await response.json();
    const insight = completion.choices?.[0]?.message?.content ?? "No insight returned.";

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
