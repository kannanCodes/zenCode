import { z } from 'zod';

export const mentorLoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});