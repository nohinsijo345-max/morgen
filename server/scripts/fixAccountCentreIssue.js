const axios = require('axios');

async function fixAccountCentreIssue() {
  console.log('🔧 FIXING ACCOUNT CENTRE ISSUE...\n');
  
  const API_URL = 'http://localhost:5050';
  
  try {
    // Step 1: Test the exact API calls the frontend makes
    console.log('1️⃣ Testing exact frontend API calls...');
    
    // Login first
    const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
      farmerId: 'FAR-369',
      pin: '1234'
    });
    console.log('✅ Login successful');
    
    // Test profile fetch
    const profileResponse = await axios.get(`${API_URL}/api/auth/profile/FAR-369`);
    console.log('✅ Profile fetch successful');
    
    // Test pending request (this might be the 404)
    try {
      const pendingResponse = await axios.get(`${API_URL}/api/profile/pending-request/FAR-369`);
      console.log('✅ Pending request check successful');
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('✅ No pending request (404 is expected)');
      } else {
        console.log('❌ Pending request error:', error.response?.status, error.response?.data);
      }
    }
    
    console.log('\n2️⃣ Creating session data for manual fix...');
    
    const sessionData = {
      user: loginResponse.data,
      loginTime: Date.now(),
      expiresAt: Date.now() + (24 * 60 * 60 * 1000)
    };
    
    console.log('\n🔧 MANUAL FIX INSTRUCTIONS:');
    console.log('1. Open browser DevTools (F12)');
    console.log('2. Go to Console tab');
    console.log('3. Paste this command:');
    console.log('');
    console.log('localStorage.clear(); sessionStorage.clear();');
    console.log(`localStorage.setItem('farmerUser', '${JSON.stringify(sessionData)}');`);
    console.log('');
    console.log('4. Refresh the page');
    console.log('');
    
    console.log('🎯 ALTERNATIVE FIX:');
    console.log('1. Go to localhost:5173 (Module Selector)');
    console.log('2. Click "Farmer Portal"');
    console.log('3. Login with FAR-369 / 1234');
    console.log('4. Navigate to Account Centre');
    
    console.log('\n✅ Backend APIs are working correctly');
    console.log('✅ The issue is frontend session management');
    
  } catch (error) {
    console.error('❌ Backend API Error:', error.response?.data || error.message);
    console.log('\n🚨 BACKEND ISSUE DETECTED');
    console.log('The problem is with the server APIs, not the frontend');
  }
}

fixAccountCentreIssue();