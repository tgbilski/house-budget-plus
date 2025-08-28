import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get user from JWT
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Generating insights for user:', user.id);

    // Fetch user's financial data
    const { data: takeoutData } = await supabaseClient
      .from('takeout_transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(100);

    const { data: budgetData } = await supabaseClient
      .from('budget_data')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    const { data: checkinData } = await supabaseClient
      .from('daily_checkins')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(30);

    // Prepare data for AI analysis
    const dataContext = {
      takeout_spending: takeoutData || [],
      budget_history: budgetData || [],
      daily_checkins: checkinData || [],
      current_date: new Date().toISOString().split('T')[0]
    };

    // Call OpenAI for insights
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const prompt = `Analyze this user's financial data and generate 3-5 personalized insights. Focus on spending patterns, budgeting opportunities, and actionable recommendations.

User Data:
${JSON.stringify(dataContext, null, 2)}

Generate insights in this JSON format:
{
  "insights": [
    {
      "type": "spending_pattern|budget_prediction|savings_opportunity",
      "title": "Brief insight title",
      "description": "Detailed explanation with specific numbers and actionable advice",
      "priority": 1-3,
      "data": { "relevant_metrics": "key_data" }
    }
  ]
}

Make insights specific, actionable, and encouraging. Use actual numbers from their data.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a helpful financial advisor that provides personalized insights based on spending data.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const insightsText = aiResponse.choices[0].message.content;
    
    console.log('AI Response:', insightsText);

    let insights;
    try {
      insights = JSON.parse(insightsText);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      // Fallback insights if AI response is malformed
      insights = {
        insights: [{
          type: 'spending_pattern',
          title: 'Review Your Spending Patterns',
          description: 'Take a closer look at your recent transactions to identify areas for improvement.',
          priority: 2,
          data: { suggestion: 'manual_review' }
        }]
      };
    }

    // Store insights in database
    const insightsToStore = insights.insights.map((insight: any) => ({
      user_id: user.id,
      insight_type: insight.type,
      title: insight.title,
      description: insight.description,
      priority: insight.priority || 2,
      data: insight.data || {},
      valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // Valid for 7 days
    }));

    // Clear old insights before inserting new ones
    await supabaseClient
      .from('user_insights')
      .delete()
      .eq('user_id', user.id);

    const { error: insertError } = await supabaseClient
      .from('user_insights')
      .insert(insightsToStore);

    if (insertError) {
      console.error('Error storing insights:', insertError);
      throw insertError;
    }

    console.log('Successfully generated and stored insights');

    return new Response(JSON.stringify({ 
      success: true, 
      insights: insightsToStore,
      count: insightsToStore.length 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-insights function:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to generate insights',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});