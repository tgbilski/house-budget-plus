import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ImageGenerationRequest {
  prompt: string;
  size?: string;
}

interface ImageGenerationResponse {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, size = "512x512" }: ImageGenerationRequest = await req.json();
    
    if (!prompt) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Prompt is required' 
        } as ImageGenerationResponse),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'OpenAI API key not configured' 
        } as ImageGenerationResponse),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log(`Generating image for prompt: ${prompt}`);

    // Create a financial news specific prompt
    const enhancedPrompt = `Financial news illustration: ${prompt}. Professional, clean, modern business style, suitable for financial news article. High quality, detailed.`;

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-image-1',
        prompt: enhancedPrompt,
        n: 1,
        size: size,
        quality: 'high',
        output_format: 'webp',
        output_compression: 80
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Image generated successfully');

    // gpt-image-1 returns base64 directly
    const imageData = data.data[0];
    let imageUrl = '';

    if (imageData.b64_json) {
      imageUrl = `data:image/webp;base64,${imageData.b64_json}`;
    } else if (imageData.url) {
      imageUrl = imageData.url;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        imageUrl 
      } as ImageGenerationResponse),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in generate-image function:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      } as ImageGenerationResponse),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});