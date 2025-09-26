import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Removed console logging for TypeScript compatibility

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    // Function started

    let plan = 'monthly';
    let priceId = 'price_1RriH0ChqC8M6G2balUOl9O8'; // Default monthly price
    
    // Parse request body to get plan
    if (req.method === 'POST') {
      try {
        const body = await req.json() as { plan?: 'monthly' | 'annual' };
        // Request body received
        plan = body.plan || 'monthly';
        
        // Set price ID based on plan
        if (plan === 'annual') {
          priceId = 'price_1SBQoqChqC8M6G2bI8kDPhK6'; // Annual price ID
        } else {
          priceId = 'price_1RriH0ChqC8M6G2balUOl9O8'; // Monthly price ID
        }
      } catch (jsonError) {
        // Error parsing JSON body, using default plan
      }
    }
    // Plan and priceId selected

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Authorization header missing");
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    // User authenticated

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { apiVersion: "2023-10-16" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }
    // Customer lookup complete

    // Using specific price ID

    // Get origin for redirect URLs
    const origin = req.headers.get("origin") || "https://jakfagdthwehkvynykwu.supabase.co";
    
    // Origin detected

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      automatic_tax: {
        enabled: true,
      },
      success_url: `${origin}/subscription-success`,
      cancel_url: `${origin}/`,
    });
    // Checkout session created

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    // ERROR in create-checkout
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
