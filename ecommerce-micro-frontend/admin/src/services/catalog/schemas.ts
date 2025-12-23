import { z } from 'zod';

export const uploadImageResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  imageUrl: z.string().optional(),
});


