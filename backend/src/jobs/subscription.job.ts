import cron from "node-cron";
import { SubscriptionRepository } from "../modules/subscription/subscription.repository";

const subscriptionRepo = new SubscriptionRepository();

/**
 * Runs daily at midnight (00:00).
 * Marks any active subscriptions whose endDate has passed as 'expired'.
 * This is a safety net — Stripe webhooks handle real-time updates,
 * but this catches any edge cases or missed webhooks.
 */
export const startSubscriptionCronJobs = () => {
  cron.schedule("0 0 * * *", async () => {
    try {
      const result = await subscriptionRepo.expireOldSubscriptions();
      console.log(`[CRON] Expired subscriptions updated: ${(result as any).modifiedCount ?? 0}`);
    } catch (error) {
      console.error("[CRON] Failed to expire subscriptions:", error);
    }
  });

  console.log("[CRON] Subscription jobs registered");
};
