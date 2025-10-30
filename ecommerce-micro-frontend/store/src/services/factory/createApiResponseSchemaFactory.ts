import { z, ZodType } from 'zod';

/**
 * Create API response schema factory
 * Wraps the data schema with ApiResponse structure
 */
export function createApiResponseSchemaFactory<T>(
  dataSchema: ZodType<T>
): z.ZodObject<any> {
  return z.object({
    data: dataSchema,
    meta: z
      .object({
        currentPage: z.number().optional(),
        totalPages: z.number().optional(),
        totalItems: z.number().optional(),
        itemsPerPage: z.number().optional(),
      })
      .optional(),
  });
}

