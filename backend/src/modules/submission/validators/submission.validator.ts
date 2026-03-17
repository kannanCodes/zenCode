import { z } from 'zod';

export const createSubmissionSchema = z.object({
     problemId: z.string().min(1, 'Problem ID is required'),
     language: z.string().min(1, 'Language is required'),
     sourceCode: z.string().min(1, 'Source code is required'),
});

export type CreateSubmissionInput = z.infer<typeof createSubmissionSchema>;
