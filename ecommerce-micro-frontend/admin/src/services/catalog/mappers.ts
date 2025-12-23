import { createMapper } from '../factory/createMapper';
import {
  UploadImageResponse,
} from './types';
import {
  uploadImageResponseSchema,
} from './schemas';

// Mapper for upload image response
export const uploadImageMapper = createMapper<UploadImageResponse, UploadImageResponse>(
  (response) => {
    return {
      success: response.success,
      message: response.message,
      imageUrl: response.imageUrl ?? undefined,
    };
  },
  uploadImageResponseSchema
);

