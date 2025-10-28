import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
    return new Response('ok', { headers: corsHeaders });
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

    // Step 2: Parse expense using Lovable AI
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
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are an expense parser. Extract structured data from natural language expense descriptions.
Extract: amount (as a number), merchant (or "Unknown" if not mentioned), category (one of: Groceries, Dining Out, Transportation, Entertainment, Shopping, Bills, Healthcare, Other).

Respond ONLY with valid JSON in this exact format:
{
  "amount": 42.50,
  "merchant": "Whole Foods",
  "category": "Groceries"
}

Examples:
"Spent $42 on groceries at Whole Foods" → {"amount": 42, "merchant": "Whole Foods", "category": "Groceries"}
"Grabbed lunch for $18" → {"amount": 18, "merchant": "Unknown", "category": "Dining Out"}
"Coffee this morning was like 6 bucks" → {"amount": 6, "merchant": "Unknown", "category": "Dining Out"}
"Got gas around $50" → {"amount": 50, "merchant": "Unknown", "category": "Transportation"}`
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
      console.error('Lovable AI error:', errorText);
      throw new Error(`AI parsing error: ${errorText}`);
    }

    const parseResult = await parseResponse.json();
    const parsedExpense = JSON.parse(parseResult.choices[0].message.content);
    
    console.log('Parsed expense:', parsedExpense);

    return new Response(
      JSON.stringify({
        transcription: transcribedText,
        expense: parsedExpense
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