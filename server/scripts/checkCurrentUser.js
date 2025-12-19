const axios = require('axios');

async function checkCurrentUser() {
  try {
    console.log('🔍 Checking current user session and farmer data...\n');

    const API_URL = 'http://localhost:5050';
    
    // Get all users to see what farmer IDs exist
    try {
      // We need to check the auth routes to see available farmers
      console.log('📊 Available farmers in the system:');
      
      // Let's try to get farmer data by checking the dashboard endpoint with the known farmer ID
      const knownFarmerId = 'FAR-369';
      const dashboardResponse = await axios.get(`${API_URL}/api/dashboard/farmer/${knownFarmerId}`);
      
      console.log('✅ Found farmer data:');
      console.log('Farmer ID:', dashboardResponse.data.farmer?.farmerId);
      console.log('Farmer Name:', dashboardResponse.data.farmer?.name);
      console.log('Farmer Email:', dashboardResponse.data.farmer?.email);
      
      // Check if this farmer has bookings
      const bookingsResponse = await axios.get(`${API_URL}/api/transport/bookings/farmer/${knownFarmerId}`);
      console.log(`\n📦 Bookings for ${knownFarmerId}: ${bookingsResponse.data.length}`);
      
      if (bookingsResponse.data.length > 0) {
        console.log('\n📋 Recent bookings:');
        bookingsResponse.data.slice(0, 3).forEach((booking, index) => {
          console.log(`${index + 1}. ${booking.bookingId} - ${booking.status}`);
          console.log(`   From: ${booking.fromLocation?.city} to ${booking.toLocation?.city}`);
          console.log(`   Date: ${new Date(booking.createdAt).toLocaleDateString()}`);
        });
      }
      
    } catch (error) {
      console.log('❌ Failed to fetch farmer data');
      console.log('Error:', error.response?.data || error.message);
    }

    // Test the session format that should be used
    console.log('\n🔍 Expected session format:');
    console.log('The UserSession.getCurrentUser("farmer") should return:');
    console.log('{');
    console.log('  farmerId: "FAR-369",');
    console.log('  name: "Nohin Sijo",');
    console.log('  email: "farmer@example.com",');
    console.log('  // ... other fields');
    console.log('}');
    
    console.log('\n💡 Solution:');
    console.log('1. Make sure the login process stores the correct farmerId in session');
    console.log('2. Verify UserSession.getCurrentUser("farmer") returns the right farmerId');
    console.log('3. The farmerId should be "FAR-369" to match the existing bookings');

  } catch (error) {
    console.error('❌ Error checking current user:', error.message);
  }
}

checkCurrentUser();