import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PRODUCTS: Record<string, { name: string; description: string; successPath: string }> = {
  grocery: {
    name: "Meal Planner & Grocery List Tool",
    description:
      "Plan a week of meals from 45+ budget recipes (or your own), get an auto-combined grocery list that fits your budget, plus a bonus 12-month budget spreadsheet. One-time payment, 90 days of access.",
    successPath: "/planner",
  },
  fodmap: {
    name: "Low-FODMAP Meal Planner & Grocery List",
    description:
      "Plan a week of low-FODMAP meals from 30+ gut-friendly recipes (no onion, no garlic, lactose-smart), get an auto-combined grocery list with cost estimates and budget tracking. One-time payment, 90 days of access.",
    successPath: "/low-fodmap-planner",
  },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("Stripe secret key not configured");

    let productKey = "grocery";
    try {
      const body = await req.json();
      if (body?.product && typeof body.product === "string") productKey = body.product;
    } catch { /* no body — default product */ }
    const product = PRODUCTS[productKey] ?? PRODUCTS.grocery;

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const origin = req.headers.get("origin") || "https://housebudgetcalculator.com";

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: 500,
            product_data: {
              name: product.name,
              description: product.description,
            },
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      metadata: { product: productKey },
      success_url: `${origin}${product.successPath}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/`,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
