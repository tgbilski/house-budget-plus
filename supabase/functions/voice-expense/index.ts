import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Process base64 in chunks to prevent memory issues
function processBase64Chunks(base64String: string, chunkSize = 32768) {
  const chunks: Uint8Array[] = [];
  let position = 0;
  
  while (position < base64String.length) {
    const chunk = base64String.slice(position, position + chunkSize);
    const binaryChunk = atob(chunk);
    const bytes = new Uint8Array(binaryChunk.length);
    
    for (let i = 0; i < binaryChunk.length; i++) {
      bytes[i] = binaryChunk.charCodeAt(i);
    }
    
    chunks.push(bytes);
    position += chunkSize;
  }

  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;

  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }

  return result;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { audio } = await req.json();
    
    if (!audio) {
      throw new Error('No audio data provided');
    }

    console.log('Processing audio for transcription...');

    // Step 1: Transcribe audio using OpenAI Whisper
    const binaryAudio = processBase64Chunks(audio);
    const formData = new FormData();
    const blob = new Blob([binaryAudio], { type: 'audio/webm' });
    formData.append('file', blob, 'audio.webm');
    formData.append('model', 'whisper-1');

    const transcriptionResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      },
      body: formData,
    });

    if (!transcriptionResponse.ok) {
      const errorText = await transcriptionResponse.text();
      console.error('OpenAI transcription error:', errorText);
      throw new Error(`OpenAI API error: ${errorText}`);
    }

    const transcription = await transcriptionResponse.json();
    const transcribedText = transcription.text;
    console.log('Transcribed text:', transcribedText);

    // Step 2: Parse with AI - determine if expense or savings
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const parseResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          {
            role: 'system',
            content: `You are a financial entry parser. Determine if the user is describing an EXPENSE or a SAVINGS deposit, then extract structured data.

EXPENSE indicators: "spent", "bought", "paid", "cost", "grabbed", "got", purchasing language
SAVINGS indicators: "saved", "put away", "deposited", "set aside", "added to savings", "tucked away"

For EXPENSES extract: amount, merchant (or "Unknown"), category (Groceries, Dining Out, Transportation, Entertainment, Shopping, Bills, Healthcare, Other).
For SAVINGS extract: amount, month (1-12 or null if not mentioned), notes (brief description).

Respond ONLY with valid JSON:

For expense:
{"type": "expense", "amount": 42.50, "merchant": "Whole Foods", "category": "Groceries"}

For savings:
{"type": "savings", "amount": 200, "month": 3, "notes": "bonus from work"}

Examples:
"Spent $42 on groceries at Whole Foods" → {"type": "expense", "amount": 42, "merchant": "Whole Foods", "category": "Groceries"}
"Put away $200 into savings this month" → {"type": "savings", "amount": 200, "month": null, "notes": "monthly savings"}
"Saved $500 from my tax refund" → {"type": "savings", "amount": 500, "month": null, "notes": "tax refund"}
"Coffee this morning was like 6 bucks" → {"type": "expense", "amount": 6, "merchant": "Unknown", "category": "Dining Out"}`
          },
          {
            role: 'user',
            content: transcribedText
          }
        ]
      }),
    });

    if (!parseResponse.ok) {
      const errorText = await parseResponse.text();
      console.error('AI error:', errorText);
      
      if (parseResponse.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (parseResponse.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted. Please try again later.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`AI parsing error: ${errorText}`);
    }

    const parseResult = await parseResponse.json();
    let aiContent = parseResult.choices[0].message.content;
    
    // Strip markdown code blocks if present
    aiContent = aiContent.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    
    const parsedEntry = JSON.parse(aiContent);
    
    console.log('Parsed entry:', parsedEntry);

    return new Response(
      JSON.stringify({
        transcription: transcribedText,
        entry: parsedEntry
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in voice-expense function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
