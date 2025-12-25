const axios = require('axios');

const testBuyerLoginFlow = async () => {
  try {
    const API_URL = 'http://localhost:5050';
    
    console.log('🔍 Testing complete buyer login flow...');
    
    // Step 1: Test buyer login API
    console.log('\n1. Testing buyer login API...');
    const loginResponse = await axios.post(`${API_URL}/api/auth/buyer/login`, {
      buyerId: 'MGB002',
      pin: '1234'
    });
    console.log('✅ Login API response:', {
      name: loginResponse.data.name,
      buyerId: loginResponse.data.buyerId,
      role: loginResponse.data.role
    });
    
    // Step 2: Test profile endpoint
    console.log('\n2. Testing profile endpoint...');
    const profileResponse = await axios.get(`${API_URL}/api/auth/profile/MGB002`);
    console.log('✅ Profile API response:', {
      name: profileResponse.data.name,
      buyerId: profileResponse.data.buyerId,
      role: profileResponse.data.role
    });
    
    console.log('\n🎉 Backend APIs are working correctly!');
    console.log('\n📝 Frontend Session Debug Instructions:');
    console.log('1. Open browser console on the Account Centre page');
    console.log('2. Run: localStorage.getItem("buyerUser")');
    console.log('3. Run: sessionStorage.getItem("buyerUser")');
    console.log('4. Check if session data exists and is valid');
    console.log('\n💡 If no session data, the issue is in the login flow');
    console.log('💡 If session data exists but Account Centre fails, the issue is in session reading');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
};

testBuyerLoginFlow();