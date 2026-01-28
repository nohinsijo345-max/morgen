const axios = require('axios');

const testGovernmentLogin = async () => {
  try {
    const API_URL = 'http://localhost:5050';
    console.log('🏛️ Testing government login...');
    
    const response = await axios.post(`${API_URL}/api/government/login`, {
      govId: 'GOV001',
      password: 'admin123'
    });
    
    console.log('✅ Government login response:', response.data);
    
    if (response.data.success) {
      console.log('✅ Government login successful!');
      console.log('User data:', response.data.user);
    } else {
      console.log('❌ Government login failed:', response.data.message);
    }
  } catch (error) {
    console.error('❌ Government login error:', error.response?.data || error.message);
  }
};

testGovernmentLogin();