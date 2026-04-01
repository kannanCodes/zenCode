import { Request, Response } from "express";
import Stripe from "stripe";
import { StripeService } from "./stripe.service";
import { SubscriptionService } from "../subscription/subscription.service";
import { PlanRepository } from "../admin/plan/plan.repository";

const stripeService = new StripeService();
const subscriptionService = new SubscriptionService();
const planRepo = new PlanRepository();

export const stripeWebhookHandler = async (req: Request, res: Response) => {
  const signature = req.headers["stripe-signature"] as string;

  let event: Stripe.Event;

  // ── 1. Verify Stripe signature 
  try {
    event = await stripeService.constructWebhookEvent(req.body, signature);
  } catch (err) {
    console.error("❌ Webhook signature verification failed:", err);
    return res.status(400).send("Invalid signature");
  }

  // ── 2. Handle events 
  try {
    switch (event.type) {

      // ✅ PAYMENT SUCCESS 
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        const userId = session.metadata?.userId;
        const stripeSubscriptionId = session.subscription as string;
        const stripeCustomerId = session.customer as string;

        if (!userId || !stripeSubscriptionId) {
          console.error("❌ Missing userId or subscriptionId in session metadata");
          return res.status(200).json({ received: true });
        }

        const fullSession = await stripeService.retrieveCheckoutSession(session.id);
        const subscription = fullSession.subscription as Stripe.Subscription;

        const priceId = subscription.items.data[0].price.id;

        const plan = await planRepo.findByStripePriceId(priceId);
        if (!plan) {
          console.error(`❌ No plan found for Stripe priceId: ${priceId}`);
          return res.status(200).json({ received: true });
        }

        const item = subscription.items.data[0] as any;
        await subscriptionService.createSubscription({
          userId,
          planId: plan._id.toString(),
          stripeCustomerId,
          stripeSubscriptionId,
          status: "active",
          startDate: new Date(item.current_period_start * 1000),
          endDate: new Date(item.current_period_end * 1000),
        });

        console.log(`✅ Subscription created for user: ${userId}`);
        break;
      }

      // ❌ SUBSCRIPTION CANCELLED (user cancelled or payment failed)
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        await subscriptionService.cancelSubscription(subscription.id);
        console.log(`✅ Subscription cancelled: ${subscription.id}`);
        break;
      }

      // 🔄 RENEWAL 
      case "invoice.payment_succeeded": {
        const invoice = event.data.object as any;

        const billingReason = invoice.billing_reason as string | undefined;
        const stripeSubscriptionId = invoice.subscription as string | undefined;

        if (billingReason === "subscription_cycle" && stripeSubscriptionId) {
          const periodEnd = invoice.lines?.data[0]?.period?.end as number | undefined;

          if (periodEnd) {
            await subscriptionService.renewSubscription(
              stripeSubscriptionId,
              new Date(periodEnd * 1000)
            );
            console.log(`✅ Subscription renewed: ${stripeSubscriptionId}`);
          }
        }
        break;
      }

      default:
        console.log(`ℹ️ Unhandled Stripe event: ${event.type}`);
    }

    res.status(200).json({ received: true });

  } catch (error) {
    console.error("❌ Webhook processing error:", error);
    res.status(500).send("Webhook handler failed");
  }
};
