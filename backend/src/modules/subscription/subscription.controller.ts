import { Request, Response, NextFunction } from "express";
import { SubscriptionService } from "./subscription.service";
import { sendSuccess } from "../../shared/utils/response.util";
import { AuthenticatedRequest } from "../../shared/types/authenticated-request";

export class SubscriptionController {
  private subscriptionService = new SubscriptionService();

  // GET /api/subscriptions/me
  getMySubscription = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as AuthenticatedRequest).user.id;

      const subscription = await this.subscriptionService.getUserSubscriptionDetails(userId);

      sendSuccess(res, {
        message: subscription ? "Subscription fetched" : "No subscription found",
        data: subscription,
      });
    } catch (error) {
      next(error);
    }
  };

  // DELETE /api/subscriptions/cancel
  cancelSubscription = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as AuthenticatedRequest).user.id;

      await this.subscriptionService.cancelUserSubscription(userId);

      sendSuccess(res, {
        message: "Subscription will be cancelled at the end of the current billing period",
      });
    } catch (error) {
      next(error);
    }
  };

  // PATCH /api/subscriptions/change-plan
  changePlan = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as AuthenticatedRequest).user.id;
      const { planId } = req.body;

      const updated = await this.subscriptionService.changePlan(userId, planId);

      sendSuccess(res, {
        message: "Plan changed successfully",
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  };
}
