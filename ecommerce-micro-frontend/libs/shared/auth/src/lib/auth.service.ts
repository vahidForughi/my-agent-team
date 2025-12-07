/**
 * Authentication Service
 * Provides centralized authentication logic for all micro-frontends
 *
 * Since the backend doesn't have Identity Server configured yet,
 * this implements a simple username-based authentication that works
 * with the existing Basket/Order APIs that use userName parameter.
 */

import { AuthStorage } from './auth.storage';
import type { User, AuthState, LoginRequest, LoginResponse } from './auth.types';

export class AuthService {
  private static listeners = new Set<(state: AuthState) => void>();

  /**
   * Get current authentication state
   */
  static getAuthState(): AuthState {
    const user = AuthStorage.getUser();
    return {
      user,
      isAuthenticated: user !== null,
      isLoading: false,
    };
  }

  /**
   * Login with username (simple authentication for demo)
   * In production, this would call an authentication API
   */
  static async login(request: LoginRequest): Promise<LoginResponse> {
    // Validate username
    if (!request.username || request.username.trim().length < 3) {
      throw new Error('Username must be at least 3 characters');
    }

    const username = request.username.trim();

    // Create user object
    const user: User = {
      username,
      displayName: username,
      email: `${username}@example.com`,
    };

    // Store user in localStorage
    AuthStorage.setUser(user);

    // Notify listeners
    this.notifyListeners();

    return {
      user,
      token: `demo-token-${username}`, // Mock token for demo
    };
  }

  /**
   * Logout current user
   */
  static logout(): void {
    AuthStorage.clear();
    this.notifyListeners();
  }

  /**
   * Get current user
   */
  static getCurrentUser(): User | null {
    return AuthStorage.getUser();
  }

  /**
   * Get current username (used for API calls)
   */
  static getCurrentUsername(): string {
    return AuthStorage.getCurrentUsername() || 'guest';
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    return AuthStorage.isAuthenticated();
  }

  /**
   * Subscribe to authentication state changes
   */
  static subscribe(listener: (state: AuthState) => void): () => void {
    this.listeners.add(listener);
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify all listeners of state change
   */
  private static notifyListeners(): void {
    const state = this.getAuthState();
    this.listeners.forEach(listener => {
      try {
        listener(state);
      } catch (error) {
        console.error('Error in auth state listener:', error);
      }
    });
  }

  /**
   * Require authentication - throws if not authenticated
   */
  static requireAuth(): User {
    const user = this.getCurrentUser();
    if (!user) {
      throw new Error('Authentication required');
    }
    return user;
  }
}
