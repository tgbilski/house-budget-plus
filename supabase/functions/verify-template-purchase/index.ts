import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DOWNLOAD_PATH = "/downloads/grocery-budget-tracker-2026.xlsx";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("Stripe secret key not configured");

    const body = await req.json();
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Path 1: verify a specific checkout session (post-purchase redirect)
    if (body.session_id && typeof body.session_id === "string") {
      const session = await stripe.checkout.sessions.retrieve(body.session_id);
      if (session.payment_status !== "paid") {
        return new Response(JSON.stringify({ paid: false }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
      return new Response(JSON.stringify({ paid: true, download: DOWNLOAD_PATH }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Path 2: recover a lost download by the email used at checkout
    if (body.email && typeof body.email === "string") {
      const email = body.email.trim().toLowerCase();
      if (!EMAIL_RE.test(email)) {
        return new Response(JSON.stringify({ error: "Please enter a valid email address." }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
      }

      const customers = await stripe.customers.list({ email, limit: 10 });
      for (const customer of customers.data) {
        const sessions = await stripe.checkout.sessions.list({
          customer: customer.id,
          limit: 20,
        });
        const paid = sessions.data.some((s) => s.payment_status === "paid");
        if (paid) {
          return new Response(JSON.stringify({ paid: true, download: DOWNLOAD_PATH }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          });
        }
      }

      return new Response(JSON.stringify({ paid: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    return new Response(JSON.stringify({ error: "session_id or email is required" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
