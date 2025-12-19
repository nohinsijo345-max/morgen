/**
 * API Error Handler Utility
 * Provides consistent error handling to prevent console spam
 */

export const handleApiError = (error, context = 'API call') => {
  // Handle different types of errors gracefully
  if (error.response) {
    // Server responded with error status
    const status = error.response.status;
    const message = error.response.data?.message || error.message;
    
    switch (status) {
      case 404:
        // 404 errors are often expected (no data found)
        console.log(`ℹ️ ${context}: No data found (404)`);
        return { success: false, data: null, status: 404 };
      
      case 401:
        console.log(`⚠️ ${context}: Authentication required (401)`);
        return { success: false, data: null, status: 401 };
      
      case 403:
        console.log(`⚠️ ${context}: Access forbidden (403)`);
        return { success: false, data: null, status: 403 };
      
      case 500:
        console.log(`❌ ${context}: Server error (500)`);
        return { success: false, data: null, status: 500 };
      
      default:
        console.log(`⚠️ ${context}: Error ${status} - ${message}`);
        return { success: false, data: null, status };
    }
  } else if (error.request) {
    // Network error - server not reachable
    console.log(`🌐 ${context}: Server unavailable (network error)`);
    return { success: false, data: null, status: 'network_error' };
  } else {
    // Other error
    console.log(`❌ ${context}: ${error.message}`);
    return { success: false, data: null, status: 'unknown_error' };
  }
};

export const safeApiCall = async (apiFunction, context = 'API call') => {
  try {
    const response = await apiFunction();
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return handleApiError(error, context);
  }
};

export default { handleApiError, safeApiCall };