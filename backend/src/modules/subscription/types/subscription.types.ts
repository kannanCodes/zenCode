export interface CreateSubscriptionInput {
     userId: string;
     planId: string;
     stripeCustomerId: string;
     stripeSubscriptionId: string;
     status: 'active' | 'cancelled' | 'expired';
     startDate: Date;
     endDate: Date;
}

export type PlanFeature = "mentorBooking" | "premiumProblems" | "aiHints";
