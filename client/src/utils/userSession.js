/**
 * User Session Utility
 * Provides consistent session management across all components
 */

export const UserSession = {
  /**
   * Get current user session data
   * @param {string} userType - 'farmer', 'admin', or 'driver'
   * @returns {Object|null} User data or null if no session
   */
  getCurrentUser: (userType = 'farmer') => {
    try {
      // Try localStorage first, then sessionStorage
      let sessionData = localStorage.getItem(`${userType}User`);
      if (!sessionData) {
        sessionData = sessionStorage.getItem(`${userType}User`);
      }
      
      if (!sessionData) {
        console.log(`⚠️ No ${userType} session found`);
        return null;
      }

      const parsedData = JSON.parse(sessionData);
      
      // Check if session has expired
      if (Date.now() > parsedData.expiresAt) {
        console.log(`⚠️ ${userType} session expired`);
        UserSession.clearSession(userType);
        return null;
      }

      console.log(`✅ Valid ${userType} session found:`, parsedData.user);
      return parsedData.user;
    } catch (error) {
      console.error(`❌ Error reading ${userType} session:`, error);
      UserSession.clearSession(userType);
      return null;
    }
  },

  /**
   * Get farmerId from current farmer session
   * @returns {string|null} farmerId or null if no session
   */
  getFarmerId: () => {
    const user = UserSession.getCurrentUser('farmer');
    return user?.farmerId || null;
  },

  /**
   * Get farmer name from current farmer session
   * @returns {string|null} farmer name or null if no session
   */
  getFarmerName: () => {
    const user = UserSession.getCurrentUser('farmer');
    return user?.name || null;
  },

  /**
   * Get farmer location data from current session
   * @returns {Object|null} location data or null if no session
   */
  getFarmerLocation: () => {
    const user = UserSession.getCurrentUser('farmer');
    if (!user) return null;
    
    return {
      state: user.state,
      district: user.district,
      city: user.city,
      pinCode: user.pinCode
    };
  },

  /**
   * Clear user session
   * @param {string} userType - 'farmer', 'admin', or 'driver'
   */
  clearSession: (userType = 'farmer') => {
    localStorage.removeItem(`${userType}User`);
    sessionStorage.removeItem(`${userType}User`);
    console.log(`🧹 ${userType} session cleared`);
  },

  /**
   * Check if user is logged in
   * @param {string} userType - 'farmer', 'admin', or 'driver'
   * @returns {boolean} true if logged in, false otherwise
   */
  isLoggedIn: (userType = 'farmer') => {
    return UserSession.getCurrentUser(userType) !== null;
  },

  /**
   * Get session expiry time
   * @param {string} userType - 'farmer', 'admin', or 'driver'
   * @returns {Date|null} expiry date or null if no session
   */
  getSessionExpiry: (userType = 'farmer') => {
    try {
      let sessionData = localStorage.getItem(`${userType}User`);
      if (!sessionData) {
        sessionData = sessionStorage.getItem(`${userType}User`);
      }
      
      if (!sessionData) return null;

      const parsedData = JSON.parse(sessionData);
      return new Date(parsedData.expiresAt);
    } catch (error) {
      return null;
    }
  },

  /**
   * Get time remaining in session (in milliseconds)
   * @param {string} userType - 'farmer', 'admin', or 'driver'
   * @returns {number} milliseconds remaining or 0 if expired/no session
   */
  getTimeRemaining: (userType = 'farmer') => {
    const expiry = UserSession.getSessionExpiry(userType);
    if (!expiry) return 0;
    
    const remaining = expiry.getTime() - Date.now();
    return Math.max(0, remaining);
  }
};

export default UserSession;