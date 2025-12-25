/**
 * User API Service
 * Integrates with backend User API endpoints via Azure AD B2C MSAL
 *
 * Since the backend doesn't have a dedicated User Profile API endpoint,
 * user information is obtained from the Azure MSAL authentication state.
 */

import { getStoredUser } from '@ecommerce-platform/auth-provider';
import { mapUser } from './mappers';
import type {
  GetUserProfileRequest,
  UpdateUserProfileRequest,
  UserResponse,
  User,
} from './types';

/**
 * Get user profile for current user
 * Uses auth-provider to get authenticated user info from Azure MSAL
 * @param request - Request object with user info. If not provided, gets from stored user
 */
export async function getUserProfile(request?: {
  params?: GetUserProfileRequest & { user?: ReturnType<typeof getStoredUser> };
}): Promise<{ data: User } | null> {
  try {
    // Get current authenticated user from auth-provider (MSAL)
    const currentUser = request?.params?.user || getStoredUser();

    if (!currentUser) {
      console.log('[User API] No authenticated user found');
      return null;
    }

    // Transform auth-provider user to UserResponse format
    const userResponse: UserResponse = {
      id: currentUser.id || currentUser.username || currentUser.email || '', // Use id, username, or email as ID
      userName: currentUser.username || currentUser.email || currentUser.id || '',
      firstName: currentUser.displayName?.split(' ')[0] || currentUser.username || currentUser.email || '',
      lastName: currentUser.displayName?.split(' ').slice(1).join(' ') || '',
      email: currentUser.email || `${currentUser.username || currentUser.id}@example.com`,
      phone: undefined,
      role: 'customer',
      avatar: undefined,
    };

    // Map to frontend User type
    const user = mapUser(userResponse);

    if (!user) {
      console.warn('[User API] Failed to map user response');
      return null;
    }

    return { data: user };
  } catch (error) {
    console.error('[User API] Error getting user profile:', error);
    return null;
  }
}

/**
 * Update user profile
 * Note: Currently not supported as there's no backend endpoint.
 * User profile updates would typically be handled via Azure AD B2C portal.
 */
export async function updateUserProfile(request: {
  payload: UpdateUserProfileRequest;
}): Promise<{ data: User } | null> {
  console.warn(
    '[User API] updateUserProfile is not currently supported.',
    'Profile updates should be done via Azure AD B2C portal.',
    request.payload
  );

  // Return current profile to indicate success (no actual update)
  return getUserProfile();
}
