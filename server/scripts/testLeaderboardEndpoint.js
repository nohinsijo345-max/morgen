const axios = require('axios');

const testLeaderboardEndpoint = async () => {
  try {
    console.log('🧪 Testing leaderboard endpoint...\n');
    
    const API_URL = 'http://localhost:5050';
    
    // Test the /api/leaderboard/top endpoint
    console.log('📡 Calling /api/leaderboard/top...');
    const response = await axios.get(`${API_URL}/api/leaderboard/top?limit=10`);
    
    console.log('📊 Response status:', response.status);
    console.log('📊 Response data:', JSON.stringify(response.data, null, 2));
    
    if (response.data.success) {
      console.log(`✅ Success! Found ${response.data.data.length} farmers`);
      response.data.data.forEach((farmer, index) => {
        console.log(`${index + 1}. ${farmer.name} (${farmer._id}) - Sales: ${farmer.totalSales}, Revenue: ₹${farmer.totalRevenue}`);
      });
    } else {
      console.log('❌ API returned success: false');
    }
    
  } catch (error) {
    console.error('❌ Error testing endpoint:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
};

testLeaderboardEndpoint();