export interface PlanFeature {
     name: string;
     description?: string;
     enabled: boolean;
}

export interface CreatePlanInput {
     name: string;
     price: number;
     billingCycle: 'monthly' | 'yearly';
     intervalCount: number;
     description: string;
     features: PlanFeature[];
     access: {
          mentorBooking: boolean;
          premiumProblems: boolean;
          aiHints: boolean;
     };
     stripeProductId: string;
     stripePriceId: string;
}