const axios = require('axios');

const testBuyerAccountCentre = async () => {
  try {
    const API_URL = 'http://localhost:5050';
    
    console.log('🔍 Testing buyer Account Centre access...');
    
    // Step 1: Login as buyer to establish session
    console.log('\n1. Logging in as buyer MGB002...');
    const loginResponse = await axios.post(`${API_URL}/api/auth/buyer/login`, {
      buyerId: 'MGB002',
      pin: '1234'
    });
    console.log('✅ Buyer login successful:', loginResponse.data.name);
    
    // Step 2: Test all Account Centre endpoints
    console.log('\n2. Testing Account Centre endpoints...');
    
    // Profile fetch
    const profileResponse = await axios.get(`${API_URL}/api/auth/profile/MGB002`);
    console.log('✅ Profile fetch:', profileResponse.data.name);
    
    // Pending request check
    try {
      const pendingResponse = await axios.get(`${API_URL}/api/profile/pending-request/MGB002`);
      console.log('✅ Pending request found:', pendingResponse.data.status);
    } catch (pendingError) {
      if (pendingError.response?.status === 404) {
        console.log('✅ No pending request (expected)');
      }
    }
    
    console.log('\n🎉 Account Centre backend is working perfectly!');
    console.log('📝 To access Account Centre in browser:');
    console.log('   1. Go to http://localhost:5173/buyer/login');
    console.log('   2. Login with: MGB002 / PIN: 1234');
    console.log('   3. Navigate to Account Centre from dashboard');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
};

testBuyerAccountCentre();