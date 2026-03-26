import { z } from "zod";

const featureSchema = z.object({
     name: z.string().min(1, 'Feature name is required'),
     description: z.string().optional(),
     enabled: z.boolean().default(true)
});

const accessSchema = z.object({
     mentorBooking: z.boolean().optional(),
     premiumProblems: z.boolean().optional(),
     aiHints: z.boolean().optional()
});

export const updatePlanValidator = z.object({
     body: z.object({
          name: z.string().min(3).optional(),
          price: z.number().min(0).optional(),
          billingCycle: z.enum(['monthly', 'yearly']).optional(),
          intervalCount: z.number().min(1).optional(),
          description: z.string().min(10).optional(),
          features: z.array(featureSchema).optional(),
          access: accessSchema.optional(),
          stripeProductId: z.string().optional(),
          stripePriceId: z.string().optional(),
          isActive: z.boolean().optional(),
          isArchived: z.boolean().optional()
     })
});