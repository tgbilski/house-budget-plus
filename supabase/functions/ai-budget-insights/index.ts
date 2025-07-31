import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.1';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);
    
    // Get user from JWT
    const jwt = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(jwt);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { question } = await req.json();

    // Fetch user's budget data
    const { data: budgetData, error: budgetError } = await supabase
      .from('budget_calculators')
      .select('*')
      .eq('user_id', user.id);

    const { data: takeoutData, error: takeoutError } = await supabase
      .from('takeout_transactions')
      .select('*')
      .eq('user_id', user.id)
      .limit(50)
      .order('date', { ascending: false });

    if (budgetError) {
      console.error('Budget error:', budgetError);
    }
    if (takeoutError) {
      console.error('Takeout error:', takeoutError);
    }

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
      takeoutData.forEach(transaction => {
        dataContext += `- ${transaction.date}: $${transaction.amount} at ${transaction.merchant} (${transaction.category})\n`;
      });
    } else {
      dataContext += "No recent transaction data available.\n";
    }

    const systemPrompt = `You are a financial advisor AI that provides personalized budget insights and recommendations. 
    
    Analyze the user's financial data and provide helpful, actionable advice based on their specific situation. 
    Be encouraging but realistic. Focus on practical tips for saving money, optimizing spending, and improving financial health.
    
    If the user has no data, encourage them to start tracking their expenses and income using the budget calculator.
    
    Keep responses conversational and helpful, not overly formal.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `${dataContext}\n\nUser's Question: ${question}` }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    const aiResponse = await response.json();
    const insight = aiResponse.choices[0].message.content;

    return new Response(JSON.stringify({ insight }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in ai-budget-insights function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});