const axios = require('axios');

const refreshLeaderboard = async () => {
  try {
    console.log('🔄 Force refreshing leaderboard...\n');
    
    const API_URL = 'http://localhost:5050';
    
    // Call the refresh endpoint
    console.log('📡 Calling /api/leaderboard/refresh...');
    const response = await axios.post(`${API_URL}/api/leaderboard/refresh`);
    
    console.log('📊 Response status:', response.status);
    console.log('📊 Response data:', JSON.stringify(response.data, null, 2));
    
    // Now test the top endpoint again
    console.log('\n📡 Testing /api/leaderboard/top after refresh...');
    const topResponse = await axios.get(`${API_URL}/api/leaderboard/top?limit=10`);
    
    console.log('📊 Top response status:', topResponse.status);
    console.log('📊 Top response data:', JSON.stringify(topResponse.data, null, 2));
    
    if (topResponse.data.success) {
      console.log(`✅ Success! Found ${topResponse.data.data.length} farmers after refresh`);
      topResponse.data.data.forEach((farmer, index) => {
        console.log(`${index + 1}. ${farmer.name} (${farmer._id}) - Sales: ${farmer.totalSales}, Revenue: ₹${farmer.totalRevenue}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
};

refreshLeaderboard();