import { Request, Response, NextFunction } from "express";
import { SubscriptionService } from "./subscription.service";
import { PlanRepository } from "../admin/plan/plan.repository";
import { AuthenticatedRequest } from "../../shared/types/authenticated-request";
import { AppError } from "../../shared/utils/AppError";
import { STATUS_CODES } from "../../shared/constants/status";

const subscriptionService = new SubscriptionService();
const planRepo = new PlanRepository();

import { PlanFeature } from "./types/subscription.types";

export const requireFeatureAccess = (feature: PlanFeature) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const userId = (req as AuthenticatedRequest).user.id;

      const subscription = await subscriptionService.getActiveSubscription(userId);

      if (!subscription) {
        throw new AppError(
          "You need an active subscription to access this feature",
          STATUS_CODES.FORBIDDEN
        );
      }

      if (new Date(subscription.endDate) < new Date()) {
        throw new AppError(
          "Your subscription has expired. Please renew to continue.",
          STATUS_CODES.FORBIDDEN
        );
      }

      // subscription.planId is populated (see SubscriptionRepository.findActiveByUser)
      const planId =
        typeof subscription.planId === "object" && "_id" in (subscription.planId as any)
          ? (subscription.planId as any)._id.toString()
          : subscription.planId.toString();

      const plan = await planRepo.findById(planId);

      if (!plan) {
        throw new AppError("Plan not found", STATUS_CODES.NOT_FOUND);
      }

      if (!plan.access?.[feature]) {
        throw new AppError(
          `Your current plan does not include access to this feature`,
          STATUS_CODES.FORBIDDEN
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
