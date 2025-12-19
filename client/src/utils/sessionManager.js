// Session Management Utility
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export const SessionManager = {
  // Set user session with timestamp
  setUserSession: (userType, userData) => {
    console.log(`🔧 Setting ${userType} session with data:`, userData);
    
    const sessionData = {
      user: userData,
      loginTime: Date.now(),
      expiresAt: Date.now() + SESSION_DURATION
    };
    
    const sessionString = JSON.stringify(sessionData);
    console.log(`🔧 Storing session data:`, sessionString);
    
    localStorage.setItem(`${userType}User`, sessionString);
    sessionStorage.setItem(`${userType}User`, sessionString);
    
    console.log(`🔧 ${userType} session set, expires at:`, new Date(sessionData.expiresAt));
  },

  // Get user session and check if valid
  getUserSession: (userType) => {
    try {
      console.log(`🔧 Getting ${userType} session...`);
      
      // Try localStorage first, then sessionStorage
      let sessionData = localStorage.getItem(`${userType}User`);
      if (!sessionData) {
        sessionData = sessionStorage.getItem(`${userType}User`);
      }
      
      console.log(`🔧 Raw session data for ${userType}:`, sessionData);
      
      if (!sessionData) {
        console.log(`🔧 No session data found for ${userType}`);
        return null;
      }

      const parsedData = JSON.parse(sessionData);
      console.log(`🔧 Parsed session data for ${userType}:`, parsedData);

      // Check if session has expired
      if (Date.now() > parsedData.expiresAt) {
        console.log(`🔧 ${userType} session expired, auto-logging out`);
        SessionManager.clearUserSession(userType);
        return null;
      }

      console.log(`🔧 Valid ${userType} session found:`, parsedData.user);
      return parsedData.user;
    } catch (error) {
      console.error(`🔧 Error reading ${userType} session:`, error);
      SessionManager.clearUserSession(userType);
      return null;
    }
  },

  // Clear user session
  clearUserSession: (userType) => {
    localStorage.removeItem(`${userType}User`);
    sessionStorage.removeItem(`${userType}User`);
    console.log(`${userType} session cleared`);
  },

  // Check if session is about to expire (within 1 hour)
  isSessionExpiringSoon: (userType) => {
    try {
      const sessionData = JSON.parse(localStorage.getItem(`${userType}User`)) || 
                         JSON.parse(sessionStorage.getItem(`${userType}User`));
      
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
      const sessionData = JSON.parse(localStorage.getItem(`${userType}User`)) || 
                         JSON.parse(sessionStorage.getItem(`${userType}User`));
      
      if (sessionData) {
        sessionData.expiresAt = Date.now() + SESSION_DURATION;
        localStorage.setItem(`${userType}User`, JSON.stringify(sessionData));
        sessionStorage.setItem(`${userType}User`, JSON.stringify(sessionData));
        console.log(`${userType} session extended`);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error extending session:', error);
      return false;
    }
  },

  // Get time remaining in session
  getTimeRemaining: (userType) => {
    try {
      const sessionData = JSON.parse(localStorage.getItem(`${userType}User`)) || 
                         JSON.parse(sessionStorage.getItem(`${userType}User`));
      
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
    const userTypes = ['farmer', 'driver', 'admin'];
    
    userTypes.forEach(userType => {
      const user = SessionManager.getUserSession(userType);
      if (!user && (localStorage.getItem(`${userType}User`) || sessionStorage.getItem(`${userType}User`))) {
        // Session expired
        SessionManager.clearUserSession(userType);
        if (onSessionExpired) {
          onSessionExpired(userType);
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