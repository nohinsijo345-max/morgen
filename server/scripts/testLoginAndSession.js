const axios = require('axios');

const testLoginAndSession = async () => {
  try {
    console.log('🔍 Testing login and session management...\n');
    
    const API_URL = 'http://localhost:5050';
    
    // Test login with different PINs
    const testPins = ['1234', '0000', '1111', '2222', '3333', '4444'];
    
    for (const pin of testPins) {
      try {
        console.log(`🔐 Trying login with PIN: ${pin}`);
        const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
          farmerId: 'FAR-369',
          pin: pin
        });
        
        console.log('✅ Login successful!');
        console.log('Session data:');
        console.log(JSON.stringify(loginResponse.data, null, 2));
        
        // Test profile access with this session
        console.log('\n📡 Testing profile access...');
        const profileResponse = await axios.get(`${API_URL}/api/auth/profile/${loginResponse.data.farmerId}`);
        console.log('✅ Profile data retrieved successfully');
        
        break; // Exit loop on successful login
        
      } catch (error) {
        console.log(`❌ PIN ${pin} failed: ${error.response?.data?.error || error.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
};

testLoginAndSession();