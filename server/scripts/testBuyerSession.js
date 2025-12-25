const axios = require('axios');

const testBuyerSession = async () => {
  try {
    const API_URL = 'http://localhost:5050';
    
    console.log('🔍 Testing buyer profile access...');
    
    // Test the generic profile endpoint with buyer ID
    const response = await axios.get(`${API_URL}/api/auth/profile/MGB002`);
    console.log('✅ Buyer profile found:', response.data);
    
    // Test pending request endpoint
    try {
      const pendingResponse = await axios.get(`${API_URL}/api/profile/pending-request/MGB002`);
      console.log('✅ Pending request found:', pendingResponse.data);
    } catch (pendingError) {
      if (pendingError.response?.status === 404) {
        console.log('✅ No pending request (expected)');
      } else {
        console.log('❌ Pending request error:', pendingError.response?.data || pendingError.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
};

testBuyerSession();