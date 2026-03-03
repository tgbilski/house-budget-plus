// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");

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

    // Check subscription status and AI usage limit
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

    // Check and increment AI usage
    const { data: usageCheck, error: usageError } = await supabase
      .rpc('check_and_increment_ai_usage', { _user_id: user.id });
    
    if (usageError) {
      console.error("Usage check error:", usageError);
      return new Response(JSON.stringify({
        error: "Failed to check usage limit"
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!usageCheck.allowed) {
      const resetDate = new Date(usageCheck.reset_date);
      return new Response(JSON.stringify({
        error: "Usage limit reached",
        message: "You've reached your AI insight limit this month. Your balance will reset the 1st day of the next month at midnight!",
        reset_date: resetDate.toLocaleDateString(),
        queries_count: usageCheck.queries_count
      }), {
        status: 429,
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

    // Get current year and user's household context
    const currentYear = new Date().getFullYear();
    
    // Fetch user's profile with household information
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("*, current_household_id")
      .eq("user_id", user.id)
      .single();

    const currentHouseholdId = profileData?.current_household_id;

    // Fetch household information if user has one
    const { data: householdData, error: householdError } = currentHouseholdId
      ? await supabase
          .from("households")
          .select("*")
          .eq("id", currentHouseholdId)
          .single()
      : { data: null, error: null };

    // Fetch all user's financial data from different sources with year and household filtering
    const { data: budgetData, error: budgetError } = await supabase
      .from("budget_data")
      .select("*")
      .eq("user_id", user.id)
      .eq("year", currentYear)
      .order("created_at", { ascending: false });

    const { data: takeoutData, error: takeoutError } = await supabase
      .from("takeout_transactions")
      .select("*")
      .eq("user_id", user.id)
      .limit(100)
      .order("date", { ascending: false });

    const { data: pdfData, error: pdfError } = await supabase
      .from("pdf_processing_logs")
      .select("*")
      .eq("user_id", user.id)
      .eq("year", currentYear)
      .eq("processing_status", "completed")
      .order("created_at", { ascending: false })
      .limit(10);

    // Fetch savings goals for current year and household
    const { data: savingsGoals, error: savingsError } = await supabase
      .from("savings_goals")
      .select("*")
      .eq("user_id", user.id)
      .eq("year", currentYear)
      .order("created_at", { ascending: false });

    // Fetch daily checkins for current year
    const { data: checkinData, error: checkinError } = await supabase
      .from("daily_checkins")
      .select("*")
      .eq("user_id", user.id)
      .eq("year", currentYear)
      .order("date", { ascending: false })
      .limit(30);

    // Prepare comprehensive context for OpenAI
    let dataContext = `User's Comprehensive Financial Profile for ${currentYear}:\n\n`;
    
    // Add profile and household information
    if (profileData) {
      dataContext += `Profile Information:\n`;
      dataContext += `- Name: ${profileData.first_name || ''} ${profileData.last_name || ''}\n`;
      dataContext += `- Email: ${profileData.email || ''}\n`;
      dataContext += `- Current Year: ${currentYear}\n`;
      
      if (householdData) {
        dataContext += `- Household: ${householdData.name}\n`;
        dataContext += `- Household Role: ${profileData.user_id === householdData.originator_id ? 'Originator' : 'Member'}\n`;
      } else {
        dataContext += `- No household assigned\n`;
      }
      dataContext += `\n`;
    }

    // Add budget information from all budget entries for current year
    if (budgetData && budgetData.length > 0) {
      dataContext += `Budget Information for ${currentYear} (Multiple Budget Scenarios):\n`;
      budgetData.forEach((budget, index) => {
        dataContext += `Budget ${index + 1} (${budget.page_type}, Year: ${budget.year}, Created: ${new Date(budget.created_at).toLocaleDateString()}):\n`;
        dataContext += `- Monthly Income: $${budget.income || 0}\n`;
        
        if (budget.expenses && typeof budget.expenses === 'object') {
          const expenses = budget.expenses as any;
          
          if (expenses.fixed && typeof expenses.fixed === 'object') {
            dataContext += `- Fixed Expenses: \n`;
            Object.entries(expenses.fixed).forEach(([key, value]) => {
              dataContext += `  * ${key}: $${value}\n`;
            });
          }
          
          if (expenses.custom && Array.isArray(expenses.custom)) {
            dataContext += `- Custom Expenses: \n`;
            expenses.custom.forEach((expense: any) => {
              dataContext += `  * ${expense.name || 'Unknown'}: $${expense.amount || 0}\n`;
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
      dataContext += `No budget data available for ${currentYear}.\n\n`;
    }

    // Add savings goals information
    if (savingsGoals && savingsGoals.length > 0) {
      dataContext += `Savings Goals for ${currentYear}:\n`;
      savingsGoals.forEach((goal, index) => {
        const progressPercentage = goal.target_amount > 0 ? (goal.current_amount / goal.target_amount * 100).toFixed(1) : 0;
        dataContext += `Goal ${index + 1}: ${goal.title}\n`;
        dataContext += `- Target: $${goal.target_amount}\n`;
        dataContext += `- Current: $${goal.current_amount}\n`;
        dataContext += `- Progress: ${progressPercentage}%\n`;
        if (goal.target_date) {
          dataContext += `- Target Date: ${goal.target_date}\n`;
        }
        if (goal.description) {
          dataContext += `- Description: ${goal.description}\n`;
        }
        dataContext += `\n`;
      });
    } else {
      dataContext += `No savings goals set for ${currentYear}.\n\n`;
    }

    // Add daily checkins information
    if (checkinData && checkinData.length > 0) {
      dataContext += `Recent Daily Check-ins for ${currentYear} (Last ${checkinData.length} entries):\n`;
      checkinData.forEach((checkin) => {
        dataContext += `- ${checkin.date}: `;
        if (checkin.amount) dataContext += `$${checkin.amount} `;
        if (checkin.category) dataContext += `(${checkin.category}) `;
        if (checkin.description) dataContext += `- ${checkin.description}`;
        if (checkin.mood_score) dataContext += ` [Mood: ${checkin.mood_score}/10]`;
        dataContext += `\n`;
      });
      dataContext += `\n`;
    } else {
      dataContext += `No daily check-ins recorded for ${currentYear}.\n\n`;
    }

    // Add transaction data with spending patterns
    if (takeoutData && takeoutData.length > 0) {
      dataContext += `Recent Transaction History (Last ${takeoutData.length} transactions):\n`;
      
      // Group transactions by month for pattern analysis
      const monthlySpending: { [key: string]: number } = {};
      const categorySpending: { [key: string]: number } = {};
      const merchantSpending: { [key: string]: number } = {};
      
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
        dataContext += `  * ${month}: $${total.toFixed(2)}\n`;
      });
      
      dataContext += `Category Spending Totals:\n`;
      Object.entries(categorySpending).forEach(([category, total]) => {
        dataContext += `  * ${category}: $${total.toFixed(2)}\n`;
      });
      
      dataContext += `Top Merchants:\n`;
      Object.entries(merchantSpending)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .forEach(([merchant, total]) => {
          dataContext += `  * ${merchant}: $${total.toFixed(2)}\n`;
        });
      
    } else {
      dataContext += "No recent transactions available.\n";
    }

    // Add PDF processing insights if available
    if (pdfData && pdfData.length > 0) {
      dataContext += `Document Analysis for ${currentYear}:\n`;
      pdfData.forEach((pdf, index) => {
        dataContext += `Document ${index + 1}: ${pdf.file_name} (Year: ${pdf.year})\n`;
        if (pdf.ai_categorization) {
          dataContext += `- AI Analysis: ${JSON.stringify(pdf.ai_categorization)}\n`;
        }
        if (pdf.extracted_text && pdf.extracted_text.length > 200) {
          dataContext += `- Content Preview: ${pdf.extracted_text.substring(0, 200)}...\n`;
        }
      });
    } else {
      dataContext += `No document analysis available for ${currentYear}.\n`;
    }

    // Enhanced system prompt for comprehensive financial analysis
    const systemPrompt = `
      You are an expert financial advisor AI with access to comprehensive user financial data. 
      
      **RESPONSE FORMATTING REQUIREMENTS:**
      - Keep responses under 150 words. Be concise and to the point.
      - Use **bold** sparingly — only for key dollar amounts or percentages.
      - Structure responses with bullet points for actionable advice.
      - Be friendly, professional, and encouraging.
      
      **CRITICAL: GIVE CREATIVE, ACTIONABLE ADVICE — NOT GENERIC "REDUCE YOUR COSTS"**
      When a user asks how to save money, NEVER just say "reduce [expense]" or "lower your [bill]." That's obvious and unhelpful.
      Instead, provide SPECIFIC, CREATIVE, REAL-WORLD tactics they can act on TODAY. Examples:
      - For utilities: "Lower your thermostat 2°F in winter" / "Use a smart power strip to kill phantom loads" / "Switch to LED bulbs" / "Run dishwasher without pre-rinsing — modern detergents don't need it"
      - For insurance: "Bundle home + auto for 15-25% off" / "Shop quotes on Policygenius or The Zebra" / "Raise your deductible from $500 to $1000"
      - For cell phone: "Check if your employer offers a corporate discount" / "Switch to Mint Mobile or Visible for $25/mo" / "Call and threaten to cancel — retention offers are real"
      - For groceries: "Meal plan on Sundays" / "Buy store brand — same factory, different label" / "Use Flashfood or Too Good To Go for discounts"
      - For subscriptions: "Audit streaming — rotate one at a time instead of all at once" / "Use free library apps like Libby for audiobooks"
      - For car loans: "Refinance if your credit improved since purchase" / "Make biweekly payments to save on interest"
      - For daycare/childcare: "Check your employer's Dependent Care FSA ($5,000 pre-tax)" / "Look into co-op childcare or nanny shares"
      - For fixed costs: Acknowledge they're hard to change, then suggest alternatives like refinancing, negotiating, or finding employer benefits.
      
      NEVER give lazy advice. Every suggestion should be something the user can Google and do this week.
      
      **STRICT DATA GUARDRAILS:**
      - ONLY analyze and reference the user's actual financial data provided below for the current year (${currentYear})
      - If specific data is missing, clearly state "Based on your available ${currentYear} data..." 
      - NEVER make assumptions about financial situations not evidenced in the data
      - Always base recommendations on the user's unique financial profile
      
      **User's Actual Financial Data:**
      ${dataContext}
    `;
    const lovableBody = {
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: question }
      ],
      max_tokens: 1000,
      temperature: 0.7,
    };

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(lovableBody),
    });

    if (!response.ok) {
      const errorDetails = await response.json();
      console.error("Lovable AI error:", errorDetails);
      return new Response(JSON.stringify({
        error: "AI API error",
        details: errorDetails,
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const completion = await response.json();
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
