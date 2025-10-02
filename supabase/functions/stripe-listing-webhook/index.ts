import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import Stripe from "https://esm.sh/stripe@14.21.0";

serve(async (req) => {
  const signature = req.headers.get("stripe-signature");
  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
    apiVersion: "2023-10-16",
  });

  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET_LISTING");
  if (!webhookSecret) {
    return new Response("Webhook secret not configured", { status: 500 });
  }

  try {
    const body = await req.text();
    const event = stripe.webhooks.constructEvent(body, signature!, webhookSecret);

    console.log("Webhook event:", event.type);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const listingId = session.metadata?.listing_id;
        const subscriptionType = session.metadata?.subscription_type || "monthly";
        const subscriptionId = session.subscription as string;

        if (listingId) {
          // Calculate subscription end based on type
          const daysToAdd = subscriptionType === "annual" ? 365 : 30;
          const subscriptionEnd = new Date(Date.now() + daysToAdd * 24 * 60 * 60 * 1000).toISOString();

          // Activate the listing
          await supabase
            .from('marketplace_listings')
            .update({
              stripe_subscription_id: subscriptionId,
              subscription_status: 'active',
              status: 'active',
              subscription_end: subscriptionEnd,
            })
            .eq('id', listingId);

          console.log("Activated listing:", listingId, "Type:", subscriptionType);
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const subscriptionId = subscription.id;
        
        await supabase
          .from('marketplace_listings')
          .update({
            subscription_status: subscription.status === 'active' ? 'active' : 'cancelled',
            subscription_end: new Date(subscription.current_period_end * 1000).toISOString(),
          })
          .eq('stripe_subscription_id', subscriptionId);

        console.log("Updated subscription:", subscriptionId);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const subscriptionId = subscription.id;
        
        // Deactivate listing when subscription ends
        await supabase
          .from('marketplace_listings')
          .update({
            subscription_status: 'expired',
            status: 'expired',
          })
          .eq('stripe_subscription_id', subscriptionId);

        console.log("Expired listing subscription:", subscriptionId);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;
        
        if (subscriptionId) {
          await supabase
            .from('marketplace_listings')
            .update({
              subscription_status: 'cancelled',
              status: 'expired',
            })
            .eq('stripe_subscription_id', subscriptionId);

          console.log("Payment failed, deactivated listing for subscription:", subscriptionId);
        }
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 400 }
    );
  }
});
