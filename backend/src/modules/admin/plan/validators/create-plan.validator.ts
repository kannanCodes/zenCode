import { z } from "zod";

const featureSchema = z.object({
     name: z.string().min(1, 'Feature name is required'),
     description: z.string().optional(),
     enabled: z.boolean().default(true)
});

const accessSchema = z.object({
     mentorBooking: z.boolean().default(false),
     premiumProblems: z.boolean().default(false),
     aiHints: z.boolean().default(false)
});

export const createPlanValidator = z.object({
     body: z.object({
          name: z.string().min(3, 'Plan name must be at least 3 characters'),
          price: z.number().min(0, 'Price must be non-negative'),
          billingCycle: z.enum(['monthly', 'yearly'], {
               message: 'Billing cycle must be monthly or yearly'
          }),
          intervalCount: z.number().min(1).default(1),
          description: z.string().min(10, 'Description must be at least 10 characters'),
          features: z.array(featureSchema).min(1, 'At least one feature is required'),
          access: accessSchema,
          stripeProductId: z.string().min(1, 'Stripe Product ID is required'),
          stripePriceId: z.string().min(1, 'Stripe Price ID is required')
     })
});