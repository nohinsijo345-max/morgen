const axios = require('axios');

async function testCurrentSession() {
  try {
    console.log('🔍 Testing current session and creating working session...\n');

    const API_URL = 'http://localhost:5050';
    
    // First, let's try to login with the known farmer credentials
    console.log('🔐 Attempting login with FAR-369...');
    
    try {
      const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
        farmerId: 'FAR-369',
        pin: '1234' // Common test PIN
      });
      
      console.log('✅ Login successful!');
      console.log('📋 User data returned from login:');
      console.log(JSON.stringify(loginResponse.data, null, 2));
      
      // Test if this user data has the correct farmerId
      if (loginResponse.data.farmerId === 'FAR-369') {
        console.log('✅ farmerId matches expected value');
        
        // Now test fetching bookings with this farmerId
        const bookingsResponse = await axios.get(`${API_URL}/api/transport/bookings/farmer/${loginResponse.data.farmerId}`);
        console.log(`\n📦 Bookings found: ${bookingsResponse.data.length}`);
        
        if (bookingsResponse.data.length > 0) {
          console.log('✅ Bookings are accessible with this farmerId');
          console.log('\n🎯 SOLUTION: The login process works correctly.');
          console.log('The issue is likely that the frontend session is not being set properly.');
          console.log('\nNext steps:');
          console.log('1. Check if the user is actually logged in with FAR-369');
          console.log('2. Verify the session storage contains the correct farmerId');
          console.log('3. Make sure UserSession.getCurrentUser("farmer") returns the right data');
        }
      } else {
        console.log('❌ farmerId mismatch:', loginResponse.data.farmerId);
      }
      
    } catch (loginError) {
      console.log('❌ Login failed:', loginError.response?.data?.error || loginError.message);
      console.log('\n🔍 Let\'s check what farmers exist in the database...');
      
      // If login fails, let's see what users exist
      try {
        const dashboardResponse = await axios.get(`${API_URL}/api/dashboard/farmer/FAR-369`);
        console.log('✅ Farmer FAR-369 exists in database');
        console.log('📋 Farmer data:', dashboardResponse.data.farmer);
        
        console.log('\n💡 The farmer exists but login failed.');
        console.log('This could mean:');
        console.log('1. The PIN is not "1234"');
        console.log('2. The PIN is not hashed correctly');
        console.log('3. There\'s an issue with the login endpoint');
        
      } catch (dashboardError) {
        console.log('❌ Farmer FAR-369 not found in database');
        console.log('Error:', dashboardError.response?.data || dashboardError.message);
      }
    }

  } catch (error) {
    console.error('❌ Error testing session:', error.message);
  }
}

testCurrentSession();