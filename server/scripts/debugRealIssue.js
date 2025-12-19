const axios = require('axios');

async function debugRealIssue() {
  console.log('🔍 Debugging the REAL issue...\n');
  
  try {
    const API_URL = 'http://localhost:5050';
    
    // Step 1: Check if server is responding
    console.log('1️⃣ Testing server health...');
    try {
      const health = await axios.get(`${API_URL}/api/auth/next-farmer-id`);
      console.log('✅ Server is responding');
    } catch (err) {
      console.log('❌ Server not responding:', err.message);
      return;
    }
    
    // Step 2: Test login
    console.log('\n2️⃣ Testing login...');
    let loginData;
    try {
      const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
        farmerId: 'FAR-369',
        pin: '1234'
      });
      loginData = loginResponse.data;
      console.log('✅ Login successful');
      console.log('Login response:', JSON.stringify(loginData, null, 2));
    } catch (err) {
      console.log('❌ Login failed:', err.response?.data || err.message);
      return;
    }
    
    // Step 3: Test profile fetch with exact farmerId from login
    console.log('\n3️⃣ Testing profile fetch...');
    try {
      const profileResponse = await axios.get(`${API_URL}/api/auth/profile/${loginData.farmerId}`);
      console.log('✅ Profile fetch successful');
      console.log('Profile data:', JSON.stringify(profileResponse.data, null, 2));
    } catch (err) {
      console.log('❌ Profile fetch failed:', err.response?.data || err.message);
      console.log('Status:', err.response?.status);
      console.log('Headers:', err.response?.headers);
    }
    
    // Step 4: Check what localStorage should contain
    console.log('\n4️⃣ Expected localStorage data:');
    const sessionData = {
      user: loginData,
      loginTime: Date.now(),
      expiresAt: Date.now() + (24 * 60 * 60 * 1000)
    };
    console.log('Key: farmerUser');
    console.log('Value:', JSON.stringify(sessionData));
    
    console.log('\n5️⃣ Browser console command to set session:');
    console.log(`localStorage.setItem('farmerUser', '${JSON.stringify(sessionData)}');`);
    console.log('Then refresh the Account Centre page.');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

debugRealIssue();