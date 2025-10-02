import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("[create-listing-subscription] Starting");

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("[create-listing-subscription] No authorization header");
      throw new Error("Authorization header missing");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user?.email) {
      console.error("[create-listing-subscription] Auth error:", authError);
      throw new Error("User not authenticated");
    }

    console.log("[create-listing-subscription] User authenticated:", user.id);

    // Parse request body
    const { listingId, subscriptionType } = await req.json();
    
    if (!listingId) {
      throw new Error("Listing ID is required");
    }

    console.log("[create-listing-subscription] Creating subscription for listing:", listingId, "Type:", subscriptionType);

    // Initialize Stripe
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("Stripe secret key not configured");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Get or create Stripe customer
    let customerId: string | undefined;
    const customers = await stripe.customers.list({ 
      email: user.email, 
      limit: 1 
    });
    
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      console.log("[create-listing-subscription] Found existing customer:", customerId);
    } else {
      console.log("[create-listing-subscription] Creating new customer");
      const newCustomer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_user_id: user.id,
        },
      });
      customerId = newCustomer.id;
    }

    // Determine price based on subscription type
    // These price IDs need to be created in Stripe Dashboard
    // Monthly: $0.99/month
    // Annual: $9.99/year
    const priceId = subscriptionType === "annual" 
      ? Deno.env.get("STRIPE_LISTING_ANNUAL_PRICE_ID") || "price_1RriH0ChqC8M6G2balUOl9O8"
      : Deno.env.get("STRIPE_LISTING_MONTHLY_PRICE_ID") || "price_1RriGmChqC8M6G2btSKe0ppc";

    console.log("[create-listing-subscription] Using price ID:", priceId);

    // Get origin for redirect URLs
    const origin = req.headers.get("origin") || req.headers.get("referer")?.split("?")[0].replace(/\/$/, "") || "https://www.housebudgetcalculator.com";
    console.log("[create-listing-subscription] Using origin:", origin);

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
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
      metadata: {
        listing_id: listingId,
        subscription_type: subscriptionType || "monthly",
      },
      success_url: `${origin}/marketplace?listing_created=true`,
      cancel_url: `${origin}/marketplace`,
    });

    console.log("[create-listing-subscription] Checkout session created:", session.id);

    return new Response(
      JSON.stringify({ url: session.url }), 
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("[create-listing-subscription] Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
