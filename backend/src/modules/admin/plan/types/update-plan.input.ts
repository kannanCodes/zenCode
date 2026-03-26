import { PlanFeature } from './create-plan.input';

export interface UpdatePlanInput {
     name?: string;
     price?: number;
     billingCycle?: 'monthly' | 'yearly';
     intervalCount?: number;
     description?: string;
     features?: PlanFeature[];
     access?: {
          mentorBooking?: boolean;
          premiumProblems?: boolean;
          aiHints?: boolean;
     };
     stripeProductId?: string;
     stripePriceId?: string;
     isActive?: boolean;
     isArchived?: boolean;
}