// @ts-nocheck
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

// Make the CORS headers dynamic based on the incoming request's origin.
const getCorsHeaders = (origin: string | null) => {
  const allowedOrigins = [
    "https://www.housebudgetcalculator.com",
    "http://localhost:3000",
    "https://localhost:3000",
  ];
  
  // Check if origin is allowed or is a Lovable preview URL
  const isAllowed = origin && (
    allowedOrigins.includes(origin) ||
    origin.includes('.lovableproject.com') ||
    origin.includes('.supabase.co')
  );
  
  // Use wildcard or specific origin
  const allowedOrigin = isAllowed && origin ? origin : "*";

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CUSTOMER-PORTAL] ${step}${detailsStr}`);
};

serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    logStep("Searching for Stripe customer", { email: user.email });
    
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    if (customers.data.length === 0) {
      logStep("ERROR: No Stripe customer found", { email: user.email });
      throw new Error("No Stripe customer found for this user. Please ensure you have an active subscription.");
    }
    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    // Determine return URL
    const allowedOrigins = [
      "https://www.housebudgetcalculator.com",
      "http://localhost:3000",
      "https://localhost:3000"
    ];

    const isValidOrigin = origin && (
      allowedOrigins.includes(origin) ||
      origin.includes('.lovableproject.com') ||
      origin.includes('.supabase.co')
    );

    const returnUrl = isValidOrigin && origin ? `${origin}/` : allowedOrigins[0];
    logStep("Creating Stripe portal session", { customerId, returnUrl });

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
    logStep("Customer portal session created", { sessionId: portalSession.id, url: portalSession.url });

    return new Response(JSON.stringify({ url: portalSession.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in customer-portal", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
