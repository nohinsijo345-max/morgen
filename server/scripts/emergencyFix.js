const axios = require('axios');

async function emergencyFix() {
  console.log('🚨 EMERGENCY FIX: Core Session Issue\n');
  
  try {
    const API_URL = 'http://localhost:5050';
    
    // Test all the failing endpoints
    const endpoints = [
      '/api/dashboard/farmer/FAR-369',
      '/api/auth/profile/FAR-369',
      '/api/price-forecast/request/undefined',
      '/api/ai-doctor/stats/FAR-369'
    ];
    
    console.log('🔍 Testing all failing endpoints...\n');
    
    for (const endpoint of endpoints) {
      try {
        const response = await axios.get(`${API_URL}${endpoint}`);
        console.log(`✅ ${endpoint}: ${response.status} - Working`);
      } catch (error) {
        console.log(`❌ ${endpoint}: ${error.response?.status || 'ERROR'} - ${error.response?.data?.error || error.message}`);
      }
    }
    
    console.log('\n🔧 DIAGNOSIS:');
    console.log('The issue is that user session is not being passed correctly to components.');
    console.log('Components are receiving undefined user data, causing API calls to fail.');
    
    console.log('\n💡 SOLUTION:');
    console.log('We need to fix the App.jsx to properly pass user data to components.');
    
  } catch (error) {
    console.error('❌ Emergency fix failed:', error.message);
  }
}

emergencyFix();