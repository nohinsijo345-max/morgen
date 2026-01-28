// Session Management Utility
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export const SessionManager = {
  // Set user session with timestamp
  setUserSession: (userType, userData) => {
    console.log(`🔧 Setting ${userType} session with data:`, userData);
    
    // For buyers, determine the specific session type based on buyerType
    let sessionKey = userType;
    if (userType === 'buyer' && userData.buyerType) {
      sessionKey = userData.buyerType === 'commercial' ? 'commercial-buyer' : 'public-buyer';
      console.log(`🔧 Using specific buyer session key: ${sessionKey}`);
    }
    
    const sessionData = {
      user: userData,
      loginTime: Date.now(),
      expiresAt: Date.now() + SESSION_DURATION
    };
    
    const sessionString = JSON.stringify(sessionData);
    console.log(`🔧 Storing session data for ${sessionKey}:`, sessionString);
    
    localStorage.setItem(`${sessionKey}User`, sessionString);
    sessionStorage.setItem(`${sessionKey}User`, sessionString);
    
    console.log(`🔧 ${sessionKey} session set, expires at:`, new Date(sessionData.expiresAt));
  },

  // Get user session and check if valid
  getUserSession: (userType) => {
    try {
      console.log(`🔧 Getting ${userType} session...`);
      
      // For buyer type, check both commercial and public sessions
      if (userType === 'buyer') {
        // Check commercial buyer first
        const commercialBuyer = SessionManager._getSpecificSession('commercial-buyer');
        if (commercialBuyer) {
          console.log('🔧 Found commercial buyer session');
          return commercialBuyer;
        }
        
        // Check public buyer
        const publicBuyer = SessionManager._getSpecificSession('public-buyer');
        if (publicBuyer) {
          console.log('🔧 Found public buyer session');
          return publicBuyer;
        }
        
        // Check legacy buyer session for backward compatibility
        const legacyBuyer = SessionManager._getSpecificSession('buyer');
        if (legacyBuyer) {
          console.log('🔧 Found legacy buyer session');
          return legacyBuyer;
        }
        
        console.log('🔧 No buyer session found');
        return null;
      }
      
      // For other user types, use the standard method
      return SessionManager._getSpecificSession(userType);
    } catch (error) {
      console.error(`🔧 Error reading ${userType} session:`, error);
      SessionManager.clearUserSession(userType);
      return null;
    }
  },

  // Internal method to get specific session
  _getSpecificSession: (sessionKey) => {
    try {
      // Try localStorage first, then sessionStorage
      let sessionData = localStorage.getItem(`${sessionKey}User`);
      if (!sessionData) {
        sessionData = sessionStorage.getItem(`${sessionKey}User`);
      }
      
      console.log(`🔧 Raw session data for ${sessionKey}:`, sessionData);
      
      if (!sessionData) {
        console.log(`🔧 No session data found for ${sessionKey}`);
        return null;
      }

      const parsedData = JSON.parse(sessionData);
      console.log(`🔧 Parsed session data for ${sessionKey}:`, parsedData);

      // Check if session has expired
      if (Date.now() > parsedData.expiresAt) {
        console.log(`🔧 ${sessionKey} session expired, auto-logging out`);
        SessionManager._clearSpecificSession(sessionKey);
        return null;
      }

      console.log(`🔧 Valid ${sessionKey} session found:`, parsedData.user);
      return parsedData.user;
    } catch (error) {
      console.error(`🔧 Error reading ${sessionKey} session:`, error);
      SessionManager._clearSpecificSession(sessionKey);
      return null;
    }
  },

  // Get specific buyer session by type
  getBuyerSession: (buyerType) => {
    const sessionKey = buyerType === 'commercial' ? 'commercial-buyer' : 'public-buyer';
    return SessionManager._getSpecificSession(sessionKey);
  },

  // Set specific buyer session
  setBuyerSession: (userData, buyerType) => {
    const sessionKey = buyerType === 'commercial' ? 'commercial-buyer' : 'public-buyer';
    
    const sessionData = {
      user: userData,
      loginTime: Date.now(),
      expiresAt: Date.now() + SESSION_DURATION
    };
    
    const sessionString = JSON.stringify(sessionData);
    console.log(`🔧 Storing ${buyerType} buyer session:`, sessionString);
    
    localStorage.setItem(`${sessionKey}User`, sessionString);
    sessionStorage.setItem(`${sessionKey}User`, sessionString);
    
    console.log(`🔧 ${buyerType} buyer session set, expires at:`, new Date(sessionData.expiresAt));
  },

  // Clear user session
  clearUserSession: (userType) => {
    if (userType === 'buyer') {
      // Clear all buyer sessions
      SessionManager._clearSpecificSession('buyer');
      SessionManager._clearSpecificSession('commercial-buyer');
      SessionManager._clearSpecificSession('public-buyer');
      console.log('All buyer sessions cleared');
    } else {
      SessionManager._clearSpecificSession(userType);
    }
  },

  // Clear specific session
  _clearSpecificSession: (sessionKey) => {
    localStorage.removeItem(`${sessionKey}User`);
    sessionStorage.removeItem(`${sessionKey}User`);
    console.log(`${sessionKey} session cleared`);
  },

  // Clear specific buyer session
  clearBuyerSession: (buyerType) => {
    const sessionKey = buyerType === 'commercial' ? 'commercial-buyer' : 'public-buyer';
    SessionManager._clearSpecificSession(sessionKey);
  },

  // Check if session is about to expire (within 1 hour)
  isSessionExpiringSoon: (userType) => {
    try {
      let sessionData = null;
      
      if (userType === 'buyer') {
        // Check any buyer session
        sessionData = JSON.parse(localStorage.getItem('commercial-buyerUser')) || 
                     JSON.parse(sessionStorage.getItem('commercial-buyerUser')) ||
                     JSON.parse(localStorage.getItem('public-buyerUser')) || 
                     JSON.parse(sessionStorage.getItem('public-buyerUser')) ||
                     JSON.parse(localStorage.getItem('buyerUser')) || 
                     JSON.parse(sessionStorage.getItem('buyerUser'));
      } else {
        sessionData = JSON.parse(localStorage.getItem(`${userType}User`)) || 
                     JSON.parse(sessionStorage.getItem(`${userType}User`));
      }
      
      if (!sessionData) return false;

      const oneHour = 60 * 60 * 1000;
      return (sessionData.expiresAt - Date.now()) < oneHour;
    } catch (error) {
      return false;
    }
  },

  // Extend session (refresh the expiry time)
  extendSession: (userType) => {
    try {
      if (userType === 'buyer') {
        // Extend any active buyer session
        const commercialExtended = SessionManager._extendSpecificSession('commercial-buyer');
        const publicExtended = SessionManager._extendSpecificSession('public-buyer');
        const legacyExtended = SessionManager._extendSpecificSession('buyer');
        
        return commercialExtended || publicExtended || legacyExtended;
      } else {
        return SessionManager._extendSpecificSession(userType);
      }
    } catch (error) {
      console.error('Error extending session:', error);
      return false;
    }
  },

  // Extend specific session
  _extendSpecificSession: (sessionKey) => {
    try {
      const sessionData = JSON.parse(localStorage.getItem(`${sessionKey}User`)) || 
                         JSON.parse(sessionStorage.getItem(`${sessionKey}User`));
      
      if (sessionData) {
        sessionData.expiresAt = Date.now() + SESSION_DURATION;
        localStorage.setItem(`${sessionKey}User`, JSON.stringify(sessionData));
        sessionStorage.setItem(`${sessionKey}User`, JSON.stringify(sessionData));
        console.log(`${sessionKey} session extended`);
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  },

  // Get time remaining in session
  getTimeRemaining: (userType) => {
    try {
      let sessionData = null;
      
      if (userType === 'buyer') {
        // Check any buyer session
        sessionData = JSON.parse(localStorage.getItem('commercial-buyerUser')) || 
                     JSON.parse(sessionStorage.getItem('commercial-buyerUser')) ||
                     JSON.parse(localStorage.getItem('public-buyerUser')) || 
                     JSON.parse(sessionStorage.getItem('public-buyerUser')) ||
                     JSON.parse(localStorage.getItem('buyerUser')) || 
                     JSON.parse(sessionStorage.getItem('buyerUser'));
      } else {
        sessionData = JSON.parse(localStorage.getItem(`${userType}User`)) || 
                     JSON.parse(sessionStorage.getItem(`${userType}User`));
      }
      
      if (!sessionData) return 0;

      const remaining = sessionData.expiresAt - Date.now();
      return Math.max(0, remaining);
    } catch (error) {
      return 0;
    }
  }
};

// Auto-logout checker - runs every minute
export const startSessionMonitoring = (onSessionExpired) => {
  const checkSessions = () => {
    const userTypes = ['farmer', 'buyer', 'driver', 'admin', 'government'];
    
    userTypes.forEach(userType => {
      if (userType === 'buyer') {
        // Check both commercial and public buyer sessions
        const commercialBuyer = SessionManager._getSpecificSession('commercial-buyer');
        const publicBuyer = SessionManager._getSpecificSession('public-buyer');
        const legacyBuyer = SessionManager._getSpecificSession('buyer');
        
        // Check if any buyer session exists but is expired
        const hasCommercialStorage = localStorage.getItem('commercial-buyerUser') || sessionStorage.getItem('commercial-buyerUser');
        const hasPublicStorage = localStorage.getItem('public-buyerUser') || sessionStorage.getItem('public-buyerUser');
        const hasLegacyStorage = localStorage.getItem('buyerUser') || sessionStorage.getItem('buyerUser');
        
        if ((hasCommercialStorage && !commercialBuyer) || 
            (hasPublicStorage && !publicBuyer) || 
            (hasLegacyStorage && !legacyBuyer)) {
          // At least one buyer session expired
          SessionManager.clearUserSession('buyer');
          if (onSessionExpired) {
            onSessionExpired('buyer');
          }
        }
      } else {
        const user = SessionManager.getUserSession(userType);
        if (!user && (localStorage.getItem(`${userType}User`) || sessionStorage.getItem(`${userType}User`))) {
          // Session expired
          SessionManager.clearUserSession(userType);
          if (onSessionExpired) {
            onSessionExpired(userType);
          }
        }
      }
    });
  };

  // Check immediately
  checkSessions();
  
  // Then check every minute
  const interval = setInterval(checkSessions, 60000);
  
  return () => clearInterval(interval);
};