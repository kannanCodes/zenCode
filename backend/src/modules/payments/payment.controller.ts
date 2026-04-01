import { Request, Response, NextFunction } from 'express';
import { StripeService } from './stripe.service';
import { PlanService } from '../admin/plan/plan.service';
import { SubscriptionService } from '../subscription/subscription.service';
import { sendSuccess } from '../../shared/utils/response.util';
import { AuthenticatedRequest } from '../../shared/types/authenticated-request';
import { AppError } from '../../shared/utils/AppError';
import { STATUS_CODES } from '../../shared/constants/status';

export class PaymentController {
  private stripeService = new StripeService();
  private planService = new PlanService();
  private subscriptionService = new SubscriptionService();

  createCheckout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { planId } = req.body;
      const userId = (req as AuthenticatedRequest).user.id;

      // Block duplicate active subscriptions
      const hasActive = await this.subscriptionService.hasActiveSubscription(userId);
      if (hasActive) {
        throw new AppError(
          "You already have an active subscription. Use plan change to switch plans.",
          STATUS_CODES.BAD_REQUEST
        );
      }

      const plan = await this.planService.getPlanById(planId);

      if (!plan.stripePriceId) {
        throw new AppError('This plan does not have a Stripe price configured', STATUS_CODES.INTERNAL_SERVER_ERROR);
      }

      const session = await this.stripeService.createCheckoutSession(
        plan.stripePriceId,
        userId
      );

      sendSuccess(res, {
        message: 'Checkout session created',
        data: {
          sessionId: session.sessionId,
          url: session.url,
        },
      });
    } catch (error) {
      next(error);
    }
  };
}
