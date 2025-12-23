import { z } from 'zod';
import {
  uploadImageResponseSchema,
} from './schemas';

// Response types (from API)
export type UploadImageResponse = z.infer<typeof uploadImageResponseSchema>;

// DTO types (same as response for this service)
export type UploadImageResponseDto = UploadImageResponse;

// Re-export input types from input.ts
export type {
  UploadImageInput,
} from './input';


