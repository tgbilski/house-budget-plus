import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, pageContext, pageName, conversationHistory } = await req.json();

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY is not set');
    }

    // Build context-aware system prompt with examples
    const systemPrompt = `You are a helpful AI assistant embedded in a financial planning web application. You are currently helping a user on the "${pageName}" page.

Page Context: ${pageContext}

Your role is to:
1. Help users understand how to fill out forms and use features on this specific page
2. Provide guidance on financial planning concepts relevant to this page
3. Answer questions about the interface and functionality
4. **AUTOFILL FORMS** when users give you specific instructions about data entry
5. Be concise but helpful in your responses
6. If users ask about features not on this page, guide them to the appropriate section

**FORM FILLING CAPABILITIES:**
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

For autofill requests, respond with this exact format:
AUTOFILL_INSTRUCTION: {
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
User: "I bought a $2 coffee each day this week"
Response: AUTOFILL_INSTRUCTION: {"action": "fill_form", "entries": [{"date": "2024-01-01", "restaurant": "Coffee", "amount": 2}, {"date": "2024-01-02", "restaurant": "Coffee", "amount": 2}, ...], "message": "I've added $2 coffee entries for each day this week."}

User: "$2 coffee and $5 lunch each day this week"  
Response: AUTOFILL_INSTRUCTION: {"action": "fill_form", "entries": [{"date": "2024-01-01", "restaurant": "Coffee & Lunch", "amount": 7}, ...], "message": "I've added $7 daily entries (coffee + lunch) for each day this week."}

Keep responses focused, practical, and user-friendly. Always be encouraging about their financial planning journey.`;

    // Prepare conversation context
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.map((msg: any) => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user', content: message }
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const assistantResponse = data.choices[0].message.content;

    // Check if the response contains autofill instructions
    if (assistantResponse.includes('AUTOFILL_INSTRUCTION:')) {
      const parts = assistantResponse.split('AUTOFILL_INSTRUCTION:');
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
        console.error('Error parsing autofill instruction:', parseError);
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