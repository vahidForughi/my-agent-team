import { z } from 'zod';

import { SortOrder } from '../types';

/**
 * Create API Input Factory
 *
 * Wraps input schemas with common pagination and sorting fields.
 * Backend expects PageIndex and PageSize (capital P, capital I/S).
 */
export const createApiInputFactory = <T extends z.ZodRawShape>(
  dataSchema: z.ZodObject<T>,
) => {
  return z.object({
    ...dataSchema.shape,
    PageIndex: z.number().optional(),
    PageSize: z.number().optional(),
    orderBy: z.record(z.string(), z.nativeEnum(SortOrder)).optional(),
  });
};

