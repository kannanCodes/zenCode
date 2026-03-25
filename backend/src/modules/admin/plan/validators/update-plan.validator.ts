import { z } from "zod";

export const updatePlanValidator = z.object({
     name: z.string().min(3).optional(),
     price: z.number().min(0).optional(),
     durationInDays: z.number().min(1).optional(),
     features: z.array(z.string()).optional(),
     isActive: z.boolean().optional()
});