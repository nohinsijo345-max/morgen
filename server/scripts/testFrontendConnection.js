const axios = require('axios');

async function testFrontendConnection() {
  try {
    console.log('🧪 Testing frontend connection to backend...');
    
    const API_URL = 'http://localhost:5050';
    
    // Test basic connection
    console.log('1️⃣ Testing basic connection...');
    const healthResponse = await axios.get(`${API_URL}/api/auth/next-farmer-id`);
    console.log('✅ Basic connection works:', healthResponse.status);
    
    // Test CORS
    console.log('2️⃣ Testing CORS headers...');
    const corsResponse = await axios.options(`${API_URL}/api/auth/profile-image/TEST`, {
      headers: {
        'Origin': 'http://localhost:5173',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });
    console.log('✅ CORS test passed:', corsResponse.status);
    
    console.log('🎉 All tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    }
  }
}

testFrontendConnection();