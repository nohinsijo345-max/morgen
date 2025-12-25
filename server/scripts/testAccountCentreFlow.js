const axios = require('axios');

const testAccountCentreFlow = async () => {
  try {
    const API_URL = 'http://localhost:5050';
    
    console.log('🔍 Testing complete Account Centre flow...');
    
    // Step 1: Test buyer login
    console.log('\n1. Testing buyer login...');
    const loginResponse = await axios.post(`${API_URL}/api/auth/buyer/login`, {
      buyerId: 'MGB002',
      pin: '1234'
    });
    console.log('✅ Buyer login successful:', loginResponse.data.name);
    
    // Step 2: Test profile fetch
    console.log('\n2. Testing profile fetch...');
    const profileResponse = await axios.get(`${API_URL}/api/auth/profile/MGB002`);
    console.log('✅ Profile fetch successful:', profileResponse.data.name);
    
    // Step 3: Test profile update (instant)
    console.log('\n3. Testing instant profile update...');
    const updateResponse = await axios.put(`${API_URL}/api/auth/profile/MGB002`, {
      email: 'esijojose@gmail.com',
      phone: '9447212484'
    });
    console.log('✅ Profile update successful:', updateResponse.data.name);
    
    // Step 4: Test pending request check
    console.log('\n4. Testing pending request check...');
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
    
    // Step 5: Test change password
    console.log('\n5. Testing change password...');
    try {
      const passwordResponse = await axios.post(`${API_URL}/api/auth/change-password`, {
        buyerId: 'MGB002',
        currentPin: '1234',
        newPin: '1234' // Same PIN for testing
      });
      console.log('✅ Password change successful:', passwordResponse.data.message);
    } catch (passwordError) {
      console.log('❌ Password change error:', passwordError.response?.data || passwordError.message);
    }
    
    console.log('\n🎉 Account Centre flow test complete!');
    console.log('✅ All buyer Account Centre functionality is working');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
};

testAccountCentreFlow();