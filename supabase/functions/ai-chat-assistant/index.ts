// @ts-nocheck
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

serve(async (req) => {
  if (req.method === 'OPTIONS') {
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

    const { message, pageContext, pageName, conversationHistory, calculatorsData } = await req.json();

    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY is not set');
    }

    // Build context-aware system prompt with examples
    const systemPrompt = `You are a professional, hyper-concise family financial analyst embedded in a financial planning web application. You are currently helping a user on the "${pageName}" page.

Page Context: ${pageContext}

${calculatorsData && calculatorsData.length > 0 ? `
**AVAILABLE BUDGET CALCULATORS:**
${calculatorsData.map((calc: any, index: number) => `Calculator ${index + 1}: ${calc.ownerName || 'Unnamed'} (ID: ${calc.calculatorId})`).join('\n')}

**IMPORTANT:** When users request budget changes, they can specify which calculator by number (1, 2, 3, or 4). If no specific calculator is mentioned, ask which calculator they want to update.
` : ''}

**HARD CONSTRAINTS:**

Maximum Length: Your entire response must be a maximum of 150 words.

Directness: Immediately begin your response with the most critical answer or action item; do not use conversational filler, introductions, or disclaimers.

Actionable Focus: If the user asks for improvement or optimization, provide one clear, prioritized recommendation first.

**CONTENT PRIORITIZATION:**
Your concise answer must always focus on the key, most relevant metric for the user's context:

- Budgeting (Income/Expense): Highlight the single largest area for imbalance or savings opportunity and its direct monetary impact.
- Remodel Vendor Pricing: Identify the single most cost-effective vendor or the biggest cost discrepancy between the top two bids.
- Monthly Savings Goal: State the current progress percentage and the projected time (date or months) remaining to reach the goal.
- Multi-Point Advice: If the answer requires listing three or more distinct steps or points, use single-sentence bullet points for clarity and brevity.

**RESPONSE FORMATTING REQUIREMENTS:**
- Use **bold text** for headings and important information
- Use bullet points (- or *) for lists
- Structure responses in clear paragraphs
- Keep responses concise but helpful

**STRICT DATA GUARDRAILS:**
- ONLY provide advice based on the user's own financial data when they have entered it
- If no user data is available, provide GENERAL financial guidance only
- NEVER make assumptions about user's financial situation without their data
- If users ask about unrelated topics, politely redirect to financial matters in 1 sentence

Your role is to:
1. Help users understand how to fill out forms and use features on this specific page
2. Provide guidance on financial planning concepts relevant to this page
3. Answer questions about the interface and functionality
4. **AUTOFILL FORMS** when users give you specific instructions about data entry
5. Be hyper-concise but actionable in your responses (max 150 words)
6. If users ask about features not on this page, guide them to the appropriate section

**BUDGET CALCULATOR AUTOFILL CAPABILITIES:**
When users want to autofill budget calculator data, look for instructions like:
- "Set my income to $5000 in calculator 1"
- "Add $1200 for rent to calculator 2" 
- "Set my electric bill to $150 in budget 3"
- "My mortgage is $2500 for calculator 1"
- "Add Netflix for $15.99 to budget 2"
- "I pay $100 for car insurance in calculator 1"

**CALCULATOR TARGETING:**
- Users can specify "calculator 1", "budget 1", "first calculator", etc.
- Numbers 1-4 correspond to the calculators they have created
- If no calculator is specified, ask them which calculator they want to update
- Use the calculatorId from the calculatorsData to target the correct calculator

**BUDGET FIELD MAPPING:**
- "income", "salary", "pay" → monthlyIncome
- "rent", "mortgage" → mortgage (fixed expense)
- "electric", "electricity" → electric
- "gas" → gas  
- "water" → water
- "sewage", "sewer" → sewage
- "utilities" → utilities
- "car loan", "auto loan" → car-loan
- "car insurance", "auto insurance" → car-insurance
- "internet", "wifi" → internet
- "phone", "cell phone", "mobile" → phone
- "netflix", "streaming", "subscription" → subscription fields

For budget autofill requests, respond with this exact format:
BUDGET_AUTOFILL: {
  "action": "fill_budget",
  "calculatorId": "specific_calculator_id_from_calculatorsData",
  "data": {
    "income": amount_or_null,
    "expenses": {
      "field_id": amount,
      "field_id2": amount
    },
    "customExpenses": [
      {"label": "Expense Name", "amount": amount}
    ]
  },
  "message": "I've updated calculator [number] with the specified amounts."
}

**GIFTS AUTOFILL CAPABILITIES:**
When users want to autofill gift information, look for instructions like:
- "Add a $50 book for Christmas"
- "Set up a birthday list with a $25 toy"
- "Add a holiday gift: $100 headphones from Amazon"
- "Create a gift idea for my brother's birthday: $75 shoes from Nike.com"

For gift autofill requests, respond with this exact format:
GIFT_AUTOFILL: {
  "action": "fill_gift",
  "data": {
    "list_title": "list title or null",
    "gift_idea": "gift description",
    "price": amount_or_null,
    "url": "url_or_null"
  },
  "message": "I've added your gift idea."
}

**TAKEOUT CALENDAR AUTOFILL CAPABILITIES:**
When users give instructions like:
- "I bought a $2 coffee each day this week"
- "Add $5 lunch every day this week"
- "$2 coffee and $5 lunch each day this week"
- "I spent $10 at McDonald's yesterday"

You should parse the amounts, items, time periods, and create autofill instructions.

**CALCULATION EXAMPLES:**
- "$2 coffee and $5 lunch each day" = $7 total per day
- "coffee for $2, lunch $5, dinner $8" = $15 total
- Multiple items get combined into a single entry per day

**DATE PARSING:**
- "this week" = Monday through Sunday of current week
- "today" = current date
- "yesterday" = previous day
- "last 3 days" = previous 3 days including today

For takeout autofill requests, respond with this exact format:
TAKEOUT_AUTOFILL: {
  "action": "fill_form",
  "entries": [
    {
      "date": "YYYY-MM-DD",
      "restaurant": "Combined items (e.g., 'Coffee & Lunch')",
      "amount": total_calculated_amount
    }
  ],
  "message": "I've filled in your entries as requested."
}

**EXAMPLES:**
Budget: "Set my income to $5000 and rent to $1200"
Response: BUDGET_AUTOFILL: {"action": "fill_budget", "data": {"income": 5000, "expenses": {"mortgage": 1200}}, "message": "I've set your income to $5000 and rent to $1200."}

Takeout: "I bought a $2 coffee each day this week"
Response: TAKEOUT_AUTOFILL: {"action": "fill_form", "entries": [{"date": "2024-01-01", "restaurant": "Coffee", "amount": 2}, {"date": "2024-01-02", "restaurant": "Coffee", "amount": 2}, ...], "message": "I've added $2 coffee entries for each day this week."}

Gift: "Add a $50 book for Christmas"
Response: GIFT_AUTOFILL: {"action": "fill_gift", "data": {"list_title": "Christmas Gifts", "gift_idea": "Book", "price": 50, "url": null}, "message": "I've added a $50 book to your Christmas gift list."}

**RESPONSE EXAMPLES:**
- Use **bold** for section headings
- Structure with bullet points for clarity
- End with encouraging messages about their financial planning journey

Keep responses focused, practical, and user-friendly. Always be encouraging about their financial planning journey.`;

    // Prepare conversation context
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory
        .filter((msg: any) => msg.role && msg.content && typeof msg.content === 'string')
        .map((msg: any) => ({
          role: msg.type === 'user' ? 'user' : 'assistant',
          content: msg.content
        })),
      { role: 'user', content: message }
    ];

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages,
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const assistantResponse = data.choices[0].message.content;

    // Check if the response contains autofill instructions
    if (assistantResponse.includes('BUDGET_AUTOFILL:')) {
      const parts = assistantResponse.split('BUDGET_AUTOFILL:');
      const instruction = parts[1].trim();
      
      try {
        const autofillData = JSON.parse(instruction);
        return new Response(JSON.stringify({ 
          response: autofillData.message,
          autofill: autofillData
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (parseError) {
        console.error('Error parsing budget autofill instruction:', parseError);
        // If parsing fails, return the original response
        return new Response(JSON.stringify({ response: assistantResponse }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }
    
    // Check for takeout calendar autofill instructions
    if (assistantResponse.includes('TAKEOUT_AUTOFILL:')) {
      const parts = assistantResponse.split('TAKEOUT_AUTOFILL:');
      const instruction = parts[1].trim();
      
      try {
        const autofillData = JSON.parse(instruction);
        return new Response(JSON.stringify({ 
          response: autofillData.message,
          autofill: autofillData
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (parseError) {
        console.error('Error parsing takeout autofill instruction:', parseError);
        // If parsing fails, return the original response
        return new Response(JSON.stringify({ response: assistantResponse }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Check for gift autofill instructions
    if (assistantResponse.includes('GIFT_AUTOFILL:')) {
      const parts = assistantResponse.split('GIFT_AUTOFILL:');
      const instruction = parts[1].trim();
      
      try {
        const autofillData = JSON.parse(instruction);
        return new Response(JSON.stringify({ 
          response: autofillData.message,
          autofill: autofillData
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (parseError) {
        console.error('Error parsing gift autofill instruction:', parseError);
        // If parsing fails, return the original response
        return new Response(JSON.stringify({ response: assistantResponse }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    return new Response(JSON.stringify({ response: assistantResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in ai-chat-assistant function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});