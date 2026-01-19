/**
 * User Session Utility
 * Provides consistent session management across all components
 */

export const UserSession = {
  /**
   * Get current user session data
   * @param {string} userType - 'farmer', 'buyer', 'commercial-buyer', 'public-buyer', 'admin', or 'driver'
   * @returns {Object|null} User data or null if no session
   */
  getCurrentUser: (userType = 'farmer') => {
    try {
      // For backward compatibility, map 'buyer' to check both buyer types
      if (userType === 'buyer') {
        // Check commercial buyer first, then public buyer
        const commercialBuyer = UserSession.getCurrentUser('commercial-buyer');
        if (commercialBuyer) return commercialBuyer;
        
        const publicBuyer = UserSession.getCurrentUser('public-buyer');
        if (publicBuyer) return publicBuyer;
        
        // Also check legacy 'buyer' key for existing sessions
        const legacyBuyer = UserSession._getLegacyBuyerSession();
        if (legacyBuyer) return legacyBuyer;
        
        return null;
      }
      
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
   * Get legacy buyer session for backward compatibility
   * @private
   */
  _getLegacyBuyerSession: () => {
    try {
      let sessionData = localStorage.getItem('buyerUser');
      if (!sessionData) {
        sessionData = sessionStorage.getItem('buyerUser');
      }
      
      if (!sessionData) return null;

      const parsedData = JSON.parse(sessionData);
      
      if (Date.now() > parsedData.expiresAt) {
        UserSession.clearSession('buyer');
        return null;
      }

      return parsedData.user;
    } catch (error) {
      return null;
    }
  },

  /**
   * Get current buyer session with type detection
   * @param {string} buyerType - 'commercial' or 'public' or null for any
   * @returns {Object|null} Buyer data with type info or null if no session
   */
  getCurrentBuyer: (buyerType = null) => {
    if (buyerType === 'commercial') {
      return UserSession.getCurrentUser('commercial-buyer');
    } else if (buyerType === 'public') {
      return UserSession.getCurrentUser('public-buyer');
    } else {
      // Return any buyer session with type info
      const commercialBuyer = UserSession.getCurrentUser('commercial-buyer');
      if (commercialBuyer) {
        return { ...commercialBuyer, sessionType: 'commercial' };
      }
      
      const publicBuyer = UserSession.getCurrentUser('public-buyer');
      if (publicBuyer) {
        return { ...publicBuyer, sessionType: 'public' };
      }
      
      // Check legacy session
      const legacyBuyer = UserSession._getLegacyBuyerSession();
      if (legacyBuyer) {
        return { ...legacyBuyer, sessionType: legacyBuyer.buyerType || 'unknown' };
      }
      
      return null;
    }
  },

  /**
   * Set buyer session with proper type separation
   * @param {Object} userData - User data to store
   * @param {number} expiresAt - Expiration timestamp
   * @param {string} buyerType - 'commercial' or 'public'
   */
  setBuyerSession: (userData, expiresAt, buyerType = 'commercial') => {
    const sessionKey = buyerType === 'commercial' ? 'commercial-buyer' : 'public-buyer';
    const sessionData = {
      user: userData,
      expiresAt: expiresAt
    };
    
    try {
      localStorage.setItem(`${sessionKey}User`, JSON.stringify(sessionData));
      console.log(`✅ ${buyerType} buyer session saved`);
    } catch (error) {
      console.error(`❌ Failed to save ${buyerType} buyer session:`, error);
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
   * Get buyerId from current buyer session
   * @returns {string|null} buyerId or null if no session
   */
  getBuyerId: () => {
    const user = UserSession.getCurrentUser('buyer');
    return user?.buyerId || null;
  },

  /**
   * Get buyer ID with type detection
   * @param {string} buyerType - 'commercial', 'public', or null for any
   * @returns {string|null} buyerId or null if no session
   */
  getBuyerIdByType: (buyerType = null) => {
    const buyer = UserSession.getCurrentBuyer(buyerType);
    return buyer?.buyerId || null;
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
   * Get buyer name from current buyer session
   * @returns {string|null} buyer name or null if no session
   */
  getBuyerName: () => {
    const user = UserSession.getCurrentUser('buyer');
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
   * Get buyer location data from current session
   * @returns {Object|null} location data or null if no session
   */
  getBuyerLocation: () => {
    const user = UserSession.getCurrentUser('buyer');
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
   * @param {string} userType - 'farmer', 'buyer', 'commercial-buyer', 'public-buyer', 'admin', or 'driver'
   */
  clearSession: (userType = 'farmer') => {
    if (userType === 'buyer') {
      // Clear all buyer sessions
      localStorage.removeItem('buyerUser');
      sessionStorage.removeItem('buyerUser');
      localStorage.removeItem('commercial-buyerUser');
      sessionStorage.removeItem('commercial-buyerUser');
      localStorage.removeItem('public-buyerUser');
      sessionStorage.removeItem('public-buyerUser');
      console.log('🧹 All buyer sessions cleared');
    } else {
      localStorage.removeItem(`${userType}User`);
      sessionStorage.removeItem(`${userType}User`);
      console.log(`🧹 ${userType} session cleared`);
    }
  },

  /**
   * Clear specific buyer type session
   * @param {string} buyerType - 'commercial' or 'public'
   */
  clearBuyerSession: (buyerType) => {
    const sessionKey = buyerType === 'commercial' ? 'commercial-buyer' : 'public-buyer';
    localStorage.removeItem(`${sessionKey}User`);
    sessionStorage.removeItem(`${sessionKey}User`);
    console.log(`🧹 ${buyerType} buyer session cleared`);
  },

  /**
   * Check if user is logged in
   * @param {string} userType - 'farmer', 'buyer', 'commercial-buyer', 'public-buyer', 'admin', or 'driver'
   * @returns {boolean} true if logged in, false otherwise
   */
  isLoggedIn: (userType = 'farmer') => {
    return UserSession.getCurrentUser(userType) !== null;
  },

  /**
   * Check if specific buyer type is logged in
   * @param {string} buyerType - 'commercial' or 'public'
   * @returns {boolean} true if logged in, false otherwise
   */
  isBuyerLoggedIn: (buyerType) => {
    return UserSession.getCurrentBuyer(buyerType) !== null;
  },

  /**
   * Get session expiry time
   * @param {string} userType - 'farmer', 'buyer', 'commercial-buyer', 'public-buyer', 'admin', or 'driver'
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
   * @param {string} userType - 'farmer', 'buyer', 'commercial-buyer', 'public-buyer', 'admin', or 'driver'
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