const axios = require('axios');

const testUserSession = async () => {
  try {
    console.log('🔍 Testing user session and profile loading...\n');
    
    // Test the profile endpoint
    const API_URL = 'http://localhost:5050';
    const farmerId = 'FAR-369';
    
    console.log(`📡 Testing profile endpoint: ${API_URL}/api/auth/profile/${farmerId}`);
    const response = await axios.get(`${API_URL}/api/auth/profile/${farmerId}`);
    
    console.log('✅ Profile data retrieved successfully:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Name: ${response.data.name}`);
    console.log(`Farmer ID: ${response.data.farmerId}`);
    console.log(`Email: ${response.data.email}`);
    console.log(`Phone: ${response.data.phone}`);
    console.log(`State: ${response.data.state}`);
    console.log(`District: ${response.data.district}`);
    console.log(`City: ${response.data.city}`);
    console.log(`PIN Code: ${response.data.pinCode}`);
    console.log(`Land Size: ${response.data.landSize}`);
    console.log(`Crop Types: ${response.data.cropTypes?.join(', ') || 'None'}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // Test login endpoint to get fresh session data
    console.log('\n🔐 Testing login to get fresh session...');
    const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
      farmerId: 'FAR-369',
      pin: '1234' // You might need to adjust this PIN
    });
    
    console.log('✅ Login successful:');
    console.log(`Session data: ${JSON.stringify(loginResponse.data, null, 2)}`);
    
  } catch (error) {
    console.error('❌ Error testing user session:', error.response?.data || error.message);
  }
};

testUserSession();