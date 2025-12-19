const axios = require('axios');

const API_URL = 'http://localhost:5050';

async function debugFrontendFlow() {
  console.log('🔍 Debugging Frontend Account Centre Flow...\n');
  
  try {
    // Step 1: Simulate login to get session data
    console.log('1️⃣ Simulating login flow...');
    const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
      farmerId: 'FAR-369',
      pin: '1234'
    });
    
    console.log('✅ Login successful');
    console.log('Session data that should be stored:', JSON.stringify(loginResponse.data, null, 2));
    
    // Step 2: Test the exact API call AccountCentre makes
    console.log('\n2️⃣ Testing AccountCentre profile fetch...');
    const profileResponse = await axios.get(`${API_URL}/api/auth/profile/${loginResponse.data.farmerId}`);
    
    console.log('✅ Profile fetch successful');
    console.log('Profile data:', JSON.stringify(profileResponse.data, null, 2));
    
    // Step 3: Check for any missing fields that might cause frontend issues
    console.log('\n3️⃣ Checking for potential frontend issues...');
    
    const requiredFields = ['name', 'farmerId', 'email', 'phone', 'state', 'district', 'city', 'pinCode', 'landSize', 'cropTypes'];
    const missingFields = [];
    
    requiredFields.forEach(field => {
      if (!profileResponse.data[field] && profileResponse.data[field] !== 0) {
        missingFields.push(field);
      }
    });
    
    if (missingFields.length > 0) {
      console.log('⚠️  Missing or null fields:', missingFields);
    } else {
      console.log('✅ All required fields present');
    }
    
    // Step 4: Test pending request check
    console.log('\n4️⃣ Testing pending request check...');
    try {
      const pendingResponse = await axios.get(`${API_URL}/api/profile/pending-request/${loginResponse.data.farmerId}`);
      console.log('✅ Pending request found:', pendingResponse.data);
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('✅ No pending requests (expected)');
      } else {
        console.log('❌ Pending request check failed:', error.response?.data);
      }
    }
    
    // Step 5: Check CORS and headers
    console.log('\n5️⃣ Checking response headers...');
    console.log('Content-Type:', profileResponse.headers['content-type']);
    console.log('Access-Control-Allow-Origin:', profileResponse.headers['access-control-allow-origin'] || 'Not set');
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎯 DIAGNOSIS COMPLETE');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    if (missingFields.length === 0) {
      console.log('✅ Backend APIs are working correctly');
      console.log('✅ All required data is present');
      console.log('✅ User FAR-369 exists and is complete');
      console.log('');
      console.log('🔧 FRONTEND DEBUGGING STEPS:');
      console.log('1. Open browser DevTools (F12)');
      console.log('2. Go to Application/Storage tab');
      console.log('3. Check localStorage for "farmerUser" key');
      console.log('4. Go to Network tab and refresh Account Centre page');
      console.log('5. Look for failed API calls or CORS errors');
      console.log('6. Check Console tab for JavaScript errors');
      console.log('');
      console.log('🔑 Expected localStorage value:');
      const sessionData = {
        user: loginResponse.data,
        loginTime: Date.now(),
        expiresAt: Date.now() + (24 * 60 * 60 * 1000)
      };
      console.log('localStorage.setItem("farmerUser", ' + JSON.stringify(JSON.stringify(sessionData)) + ');');
    } else {
      console.log('❌ Backend data issues found');
      console.log('Missing fields need to be populated:', missingFields);
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error.response?.data || error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('🚨 SERVER NOT RUNNING!');
      console.error('Start server: cd server && npm run dev');
    }
  }
}

debugFrontendFlow();