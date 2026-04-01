import { Subscription } from "./subsription.model";
import { CreateSubscriptionInput } from "./types/subscription.types";

export class SubscriptionRepository {

     async create(data: CreateSubscriptionInput) {
          return Subscription.create(data);
     }

     async findActiveByUser(userId: string) {
          return Subscription.findOne({
               userId,
               status: 'active',
          }).populate('planId');
     }

     // Returns most recent subscription (any status) — used for "My Subscription" page
     async findLatestByUser(userId: string) {
          return Subscription.findOne({ userId })
               .sort({ createdAt: -1 })
               .populate('planId');
     }

     async findByStripeSubscriptionId(stripeSubId: string) {
          return Subscription.findOne({
               stripeSubscriptionId: stripeSubId,
          });
     }

     async updateStatus(stripeSubId: string, status: string) {
          return Subscription.findOneAndUpdate(
               { stripeSubscriptionId: stripeSubId },
               { status },
               { new: true }
          );
     }

     async updateById(id: string, data: Partial<{ status: string; planId: string; endDate: Date }>) {
          return Subscription.findByIdAndUpdate(id, data, { new: true });
     }

     async renewSubscription(stripeSubId: string, newEndDate: Date) {
          return Subscription.findOneAndUpdate(
               { stripeSubscriptionId: stripeSubId },
               { endDate: newEndDate, status: 'active' },
               { new: true }
          );
     }

     async expireOldSubscriptions() {
          return Subscription.updateMany(
               { status: 'active', endDate: { $lt: new Date() } },
               { status: 'expired' }
          );
     }
}