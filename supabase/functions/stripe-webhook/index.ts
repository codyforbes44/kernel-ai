import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Webhook received");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    if (!webhookSecret) throw new Error("STRIPE_WEBHOOK_SECRET is not set");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    
    // Get the raw body for signature verification
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");
    
    if (!signature) {
      throw new Error("No Stripe signature found");
    }

    logStep("Verifying webhook signature");
    
    let event: Stripe.Event;
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      logStep("Signature verification failed", { error: errorMessage });
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    logStep("Event verified", { type: event.type, id: event.id });

    // Initialize Supabase client with service role key for database operations
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        logStep("Processing checkout.session.completed", { 
          sessionId: session.id,
          customerId: session.customer,
          customerEmail: session.customer_email,
          mode: session.mode
        });

        if (session.mode === "subscription" && session.subscription) {
          // Handle subscription checkout
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
          await upsertSubscription(supabaseAdmin, subscription, session.customer_email, stripe);
        } else if (session.mode === "payment") {
          // Handle one-time payment (credit purchases)
          await handleCreditPurchase(supabaseAdmin, session, stripe);
        }
        break;
      }

      case "customer.subscription.created": {
        const subscription = event.data.object as Stripe.Subscription;
        logStep("Processing customer.subscription.created", { 
          subscriptionId: subscription.id,
          status: subscription.status 
        });
        await upsertSubscription(supabaseAdmin, subscription, null, stripe);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        logStep("Processing customer.subscription.updated", { 
          subscriptionId: subscription.id,
          status: subscription.status 
        });
        await upsertSubscription(supabaseAdmin, subscription, null, stripe);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        logStep("Processing customer.subscription.deleted", { 
          subscriptionId: subscription.id 
        });
        await upsertSubscription(supabaseAdmin, subscription, null, stripe);
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        logStep("Processing invoice.paid", { 
          invoiceId: invoice.id,
          subscriptionId: invoice.subscription 
        });
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        logStep("Processing invoice.payment_failed", { 
          invoiceId: invoice.id,
          subscriptionId: invoice.subscription 
        });
        break;
      }

      default:
        logStep("Unhandled event type", { type: event.type });
    }

    // Log all events to subscription_events table
    await logSubscriptionEvent(supabaseAdmin, event);

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

// Handle credit pack purchases
// deno-lint-ignore no-explicit-any
async function handleCreditPurchase(
  supabase: any,
  session: Stripe.Checkout.Session,
  stripe: Stripe
) {
  logStep("Processing credit purchase", { 
    sessionId: session.id,
    metadata: session.metadata
  });

  // Get user_id and credits from metadata
  const userId = session.metadata?.user_id;
  const creditsToAdd = parseInt(session.metadata?.credits || '0', 10);
  const packId = session.metadata?.pack_id;

  if (!userId || !creditsToAdd) {
    logStep("Missing metadata for credit purchase", { userId, creditsToAdd });
    return;
  }

  logStep("Adding credits to user", { userId, creditsToAdd, packId });

  // Get current credit balance
  const { data: currentCredits, error: fetchError } = await supabase
    .from('ai_credits')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') {
    logStep("Error fetching current credits", { error: fetchError.message });
    return;
  }

  let newBalance: number;
  let newTotalPurchased: number;

  if (currentCredits) {
    // Update existing record
    newBalance = currentCredits.balance + creditsToAdd;
    newTotalPurchased = currentCredits.total_purchased + creditsToAdd;

    const { error: updateError } = await supabase
      .from('ai_credits')
      .update({
        balance: newBalance,
        total_purchased: newTotalPurchased,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (updateError) {
      logStep("Error updating credits", { error: updateError.message });
      return;
    }
  } else {
    // Create new record
    newBalance = 1000 + creditsToAdd; // Default starting balance + purchase
    newTotalPurchased = creditsToAdd;

    const { error: insertError } = await supabase
      .from('ai_credits')
      .insert({
        user_id: userId,
        balance: newBalance,
        total_purchased: newTotalPurchased,
        total_used: 0
      });

    if (insertError) {
      logStep("Error inserting credits", { error: insertError.message });
      return;
    }
  }

  logStep("Credits added successfully", { userId, newBalance, creditsToAdd });

  // Log the transaction
  const { error: txError } = await supabase
    .from('ai_credit_transactions')
    .insert({
      user_id: userId,
      type: 'purchase',
      amount: creditsToAdd,
      balance_after: newBalance,
      description: `Purchased ${packId} pack`,
      stripe_session_id: session.id,
      metadata: {
        pack_id: packId,
        payment_intent: session.payment_intent,
        customer_email: session.customer_email
      }
    });

  if (txError) {
    logStep("Error logging transaction", { error: txError.message });
  } else {
    logStep("Transaction logged successfully");
  }
}

// deno-lint-ignore no-explicit-any
async function upsertSubscription(
  supabase: any,
  subscription: Stripe.Subscription,
  customerEmail: string | null,
  stripe: Stripe
) {
  logStep("Upserting subscription", { 
    subscriptionId: subscription.id,
    customerId: subscription.customer,
    status: subscription.status 
  });

  // Get customer email if not provided
  let email = customerEmail;
  if (!email && subscription.customer) {
    const customer = await stripe.customers.retrieve(subscription.customer as string);
    if (customer && !customer.deleted) {
      email = customer.email;
    }
  }

  if (!email) {
    logStep("No email found for subscription, skipping user lookup");
    return;
  }

  // Find user by email
  const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
  
  if (userError) {
    logStep("Error listing users", { error: userError.message });
    return;
  }

  // deno-lint-ignore no-explicit-any
  const user = userData.users.find((u: any) => u.email === email);
  
  if (!user) {
    logStep("No user found with email", { email });
    return;
  }

  logStep("Found user", { userId: user.id, email });

  // Get price_id from subscription items
  const priceId = subscription.items.data[0]?.price?.id || null;

  // Upsert subscription record
  const { error: upsertError } = await supabase
    .from("subscriptions")
    .upsert({
      user_id: user.id,
      stripe_customer_id: subscription.customer as string,
      stripe_subscription_id: subscription.id,
      status: subscription.status,
      price_id: priceId,
      current_period_start: subscription.current_period_start 
        ? new Date(subscription.current_period_start * 1000).toISOString() 
        : null,
      current_period_end: subscription.current_period_end 
        ? new Date(subscription.current_period_end * 1000).toISOString() 
        : null,
      cancel_at_period_end: subscription.cancel_at_period_end,
      canceled_at: subscription.canceled_at 
        ? new Date(subscription.canceled_at * 1000).toISOString() 
        : null,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: "stripe_subscription_id",
    });

  if (upsertError) {
    logStep("Error upserting subscription", { error: upsertError.message });
  } else {
    logStep("Subscription upserted successfully");
  }
}

// deno-lint-ignore no-explicit-any
async function logSubscriptionEvent(
  supabase: any,
  event: Stripe.Event
) {
  // Try to find related subscription ID
  let subscriptionId: string | null = null;
  
  // deno-lint-ignore no-explicit-any
  const eventData = event.data.object as any;
  if (eventData.subscription && typeof eventData.subscription === 'string') {
    // Look up our internal subscription ID
    const { data } = await supabase
      .from("subscriptions")
      .select("id")
      .eq("stripe_subscription_id", eventData.subscription)
      .single();
    
    if (data) {
      subscriptionId = data.id;
    }
  } else if (eventData.id && event.type.startsWith('customer.subscription')) {
    // The object itself is the subscription
    const { data } = await supabase
      .from("subscriptions")
      .select("id")
      .eq("stripe_subscription_id", eventData.id)
      .single();
    
    if (data) {
      subscriptionId = data.id;
    }
  }

  const { error } = await supabase
    .from("subscription_events")
    .insert({
      stripe_event_id: event.id,
      event_type: event.type,
      subscription_id: subscriptionId,
      event_data: event.data.object,
    });

  if (error) {
    logStep("Error logging event", { error: error.message });
  } else {
    logStep("Event logged successfully", { eventId: event.id });
  }
}
