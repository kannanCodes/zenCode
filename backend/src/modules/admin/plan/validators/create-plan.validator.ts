import { z } from "zod";

export const createPlanValidator = z.object({
     name: z.string().min(3),
     price: z.number().min(0),
     durationInDays: z.number().min(1),
     features: z.array(z.string()).optional()
});