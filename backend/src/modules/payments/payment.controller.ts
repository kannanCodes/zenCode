import { Request, Response, NextFunction } from 'express';
import { StripeService } from './stripe.service';
import { PlanService } from '../admin/plan/plan.service';
import { sendSuccess } from '../../shared/utils/response.util';
import { AuthenticatedRequest } from '../../shared/types/authenticated-request';

export class PaymentController {
  private stripeService = new StripeService();
  private planService = new PlanService();


  createCheckout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { planId } = req.body;
      const userId = (req as AuthenticatedRequest).user.id;

      const plan = await this.planService.getPlanById(planId);

      if (!plan.stripePriceId) {
        throw new Error('This plan does not have a Stripe price configured');
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
