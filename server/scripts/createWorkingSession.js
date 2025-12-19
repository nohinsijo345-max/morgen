const axios = require('axios');

async function createWorkingSession() {
  console.log('🔧 Creating Working Session Data...\n');
  
  try {
    const API_URL = 'http://localhost:5050';
    
    // Get fresh user data
    const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
      farmerId: 'FAR-369',
      pin: '1234'
    });
    
    console.log('✅ Login successful');
    console.log('User data:', JSON.stringify(loginResponse.data, null, 2));
    
    // Create proper session data
    const sessionData = {
      user: loginResponse.data,
      loginTime: Date.now(),
      expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    };
    
    console.log('\n🔧 BROWSER FIX COMMANDS:');
    console.log('Copy and paste these commands in browser console:\n');
    
    console.log('// Clear all storage');
    console.log('localStorage.clear();');
    console.log('sessionStorage.clear();\n');
    
    console.log('// Set working session');
    console.log(`localStorage.setItem('farmerUser', '${JSON.stringify(sessionData)}');\n`);
    
    console.log('// Verify session');
    console.log('console.log("Session set:", JSON.parse(localStorage.getItem("farmerUser")));\n');
    
    console.log('// Refresh page');
    console.log('window.location.reload();\n');
    
    console.log('🎯 After running these commands:');
    console.log('✅ Account Centre should work');
    console.log('✅ Farmer Dashboard should show user data');
    console.log('✅ Weather should use user location');
    console.log('✅ All components should have session data');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

createWorkingSession();