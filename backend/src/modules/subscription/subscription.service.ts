import { SubscriptionRepository } from "./subscription.repository";
import { CreateSubscriptionInput } from "./types/subscription.types";
import { AppError } from "../../shared/utils/AppError";
import { STATUS_CODES } from "../../shared/constants/status";
import { StripeService } from "../payments/stripe.service";
import { PlanRepository } from "../admin/plan/plan.repository";

export class SubscriptionService {
     private _repo = new SubscriptionRepository();
     private _stripeService = new StripeService();
     private _planRepo = new PlanRepository();

     async createSubscription(data: CreateSubscriptionInput) {
          const existing = await this._repo.findByStripeSubscriptionId(
               data.stripeSubscriptionId
          );
          if (existing) return existing;
          return this._repo.create(data);
     }

     async hasActiveSubscription(userId: string): Promise<boolean> {
          const sub = await this._repo.findActiveByUser(userId);
          if (!sub) return false;
          return new Date(sub.endDate) > new Date();
     }

     async getActiveSubscription(userId: string) {
          return this._repo.findActiveByUser(userId);
     }

     async getUserSubscriptionDetails(userId: string) {
          const sub = await this._repo.findLatestByUser(userId);
          if (!sub) return null;

          return {
               ...sub.toObject(),
               isActive: sub.status === 'active' && new Date(sub.endDate) > new Date(),
          };
     }

     async cancelUserSubscription(userId: string) {
          const sub = await this._repo.findActiveByUser(userId);

          if (!sub) {
               throw new AppError("No active subscription found", STATUS_CODES.NOT_FOUND);
          }

          await this._stripeService.cancelStripeSubscription(sub.stripeSubscriptionId);

          return this._repo.updateById((sub as any)._id.toString(), {
               status: "cancelled",
          });
     }

     async changePlan(userId: string, newPlanId: string) {
          const sub = await this._repo.findActiveByUser(userId);

          if (!sub) {
               throw new AppError("No active subscription found", STATUS_CODES.NOT_FOUND);
          }

          const newPlan = await this._planRepo.findById(newPlanId);

          if (!newPlan || !newPlan.stripePriceId) {
               throw new AppError("Plan not found or not configured on Stripe", STATUS_CODES.NOT_FOUND);
          }

          // Update subscription on Stripe (prorated billing applied automatically)
          await this._stripeService.upgradeSubscription(
               sub.stripeSubscriptionId,
               newPlan.stripePriceId
          );

          // Update planId in our DB
          return this._repo.updateById((sub as any)._id.toString(), {
               planId: newPlanId,
          });
     }

     async cancelSubscription(stripeSubscriptionId: string) {
          const updated = await this._repo.updateStatus(stripeSubscriptionId, "cancelled");
          if (!updated) {
               throw new AppError("Subscription not found", STATUS_CODES.NOT_FOUND);
          }
          return updated;
     }

     async renewSubscription(stripeSubscriptionId: string, newEndDate: Date) {
          const updated = await this._repo.renewSubscription(stripeSubscriptionId, newEndDate);
          if (!updated) {
               throw new AppError("Subscription not found for renewal", STATUS_CODES.NOT_FOUND);
          }
          return updated;
     }
}