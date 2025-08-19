import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

interface ImageGenerationRequest {
  prompt: string;
  size?: string;
}

interface ImageGenerationResponse {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://jakfagdthwehkvynykwu.supabase.co",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[GENERATE-IMAGE] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      logStep("ERROR: No authorization header");
      throw new Error("No authorization header provided");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) {
      logStep("ERROR: Authentication failed", { error: userError.message });
      throw new Error(`Authentication error: ${userError.message}`);
    }
    const user = userData.user;
    if (!user) {
      logStep("ERROR: User not authenticated");
      throw new Error("User not authenticated");
    }
    logStep("User authenticated", { userId: user.id });

    // Check subscription status
    const { data: subscription, error: subError } = await supabaseClient
      .from('subscribers')
      .select('subscribed, subscription_tier')
      .eq('user_id', user.id)
      .maybeSingle();

    if (subError) {
      logStep("ERROR: Failed to check subscription", { error: subError.message });
      throw new Error("Failed to check subscription status");
    }

    if (!subscription?.subscribed) {
      logStep("ERROR: User not subscribed");
      throw new Error("Image generation requires an active subscription");
    }
    logStep("Subscription verified", { tier: subscription.subscription_tier });

    const { prompt, size = "512x512" }: ImageGenerationRequest = await req.json();
    logStep("Request parsed", { prompt: prompt.substring(0, 50), size });
    
    if (!prompt) {
      logStep("ERROR: No prompt provided");
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
      logStep("ERROR: OpenAI API key not configured");
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

    logStep(`Generating image for authenticated user`);

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
      logStep('OpenAI API error', { status: response.status, error: errorData });
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    logStep('Image generated successfully');

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
    logStep('Error in generate-image function', { error: error.message });
    
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