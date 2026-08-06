/**
 * Token Manager - Centralized token management
 * Single source of truth for all token operations
 * Standardized key names: accessToken, refreshToken
 */

const TOKEN_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
} as const;

export const tokenManager = {
  /**
   * Get access token from localStorage
   */
  getAccessToken: (): string | null => {
    try {
      return localStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
    } catch (err) {
      console.error('Error reading access token:', err);
      return null;
    }
  },

  /**
   * Get refresh token from localStorage
   */
  getRefreshToken: (): string | null => {
    try {
      return localStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN);
    } catch (err) {
      console.error('Error reading refresh token:', err);
      return null;
    }
  },

  /**
   * Get stored user from localStorage
   */
  getStoredUser: (): any | null => {
    try {
      const user = localStorage.getItem(TOKEN_KEYS.USER);
      return user ? JSON.parse(user) : null;
    } catch (err) {
      console.error('Error reading stored user:', err);
      return null;
    }
  },

  /**
   * Set both tokens in localStorage
   * @param accessToken - JWT access token
   * @param refreshToken - JWT refresh token
   */
  setTokens: (accessToken: string | undefined, refreshToken: string | undefined): void => {
    if (!accessToken || !refreshToken) {
      throw new Error('[TokenManager] setTokens: accessToken and refreshToken are required');
    }
    try {
      localStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, accessToken);
      localStorage.setItem(TOKEN_KEYS.REFRESH_TOKEN, refreshToken);
      console.log(
        '[TokenManager] Tokens saved successfully',
        { accessTokenLength: accessToken.length, refreshTokenLength: refreshToken.length }
      );
    } catch (err) {
      console.error('[TokenManager] Error saving tokens:', err);
      throw err;
    }
  },

  /**
   * Set user in localStorage
   * @param user - User object to store
   */
  setUser: (user: any): void => {
    try {
      localStorage.setItem(TOKEN_KEYS.USER, JSON.stringify(user));
      console.log('[TokenManager] User saved successfully', { userId: user?.id });
    } catch (err) {
      console.error('[TokenManager] Error saving user:', err);
      throw err;
    }
  },

  /**
   * Clear all auth-related data from localStorage
   */
  clearTokens: (): void => {
    try {
      localStorage.removeItem(TOKEN_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(TOKEN_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(TOKEN_KEYS.USER);
      console.log('[TokenManager] All tokens and user data cleared');
    } catch (err) {
      console.error('[TokenManager] Error clearing tokens:', err);
    }
  },

  /**
   * Check if user is authenticated (has both tokens)
   */
  isAuthenticated: (): boolean => {
    const accessToken = tokenManager.getAccessToken();
    const refreshToken = tokenManager.getRefreshToken();
    return !!accessToken && !!refreshToken;
  },

  /**
   * Get all auth data for debugging
   */
  debug: () => {
    return {
      hasAccessToken: !!tokenManager.getAccessToken(),
      hasRefreshToken: !!tokenManager.getRefreshToken(),
      hasUser: !!tokenManager.getStoredUser(),
      isAuthenticated: tokenManager.isAuthenticated(),
    };
  },
};
