import { Request, Response, NextFunction } from "express";
import { SubscriptionService } from "./subscription.service";
import { AuthenticatedRequest } from "../../shared/types/authenticated-request";
import { AppError } from "../../shared/utils/AppError";
import { STATUS_CODES } from "../../shared/constants/status";

const subscriptionService = new SubscriptionService();


export const requireSubscription = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
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

    next();
  } catch (error) {
    next(error);
  }
};
