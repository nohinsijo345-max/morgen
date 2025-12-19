const axios = require('axios');

async function testOrderTrackingAPI() {
  try {
    console.log('🔍 Testing Order Tracking API...\n');

    const API_URL = 'http://localhost:5050';
    
    // Test 1: Check if server is running
    try {
      const healthResponse = await axios.get(`${API_URL}/api/health`);
      console.log('✅ Server is running');
      console.log('Health check:', healthResponse.data);
    } catch (error) {
      console.log('❌ Server is not running or health endpoint not available');
      console.log('Error:', error.message);
      return;
    }

    // Test 2: Get all bookings (admin endpoint)
    try {
      const allBookingsResponse = await axios.get(`${API_URL}/api/transport/bookings`);
      console.log(`\n📊 Total bookings in system: ${allBookingsResponse.data.length}`);
      
      if (allBookingsResponse.data.length > 0) {
        console.log('\n📋 Sample bookings:');
        allBookingsResponse.data.slice(0, 3).forEach((booking, index) => {
          console.log(`${index + 1}. Booking ID: ${booking.bookingId}`);
          console.log(`   Farmer ID: ${booking.farmerId}`);
          console.log(`   Farmer Name: ${booking.farmerName}`);
          console.log(`   Status: ${booking.status}`);
          console.log(`   From: ${booking.fromLocation?.city}, ${booking.fromLocation?.district}`);
          console.log(`   To: ${booking.toLocation?.city}, ${booking.toLocation?.district}`);
          console.log('   ---');
        });
      }
    } catch (error) {
      console.log('❌ Failed to fetch all bookings');
      console.log('Error:', error.response?.data || error.message);
    }

    // Test 3: Test farmer-specific endpoint with different farmer IDs
    const testFarmerIds = ['FARM001', 'FARM002', 'farmer123', 'test-farmer'];
    
    console.log('\n🔍 Testing farmer-specific endpoints:');
    for (const farmerId of testFarmerIds) {
      try {
        const farmerBookingsResponse = await axios.get(`${API_URL}/api/transport/bookings/farmer/${farmerId}`);
        console.log(`✅ Farmer ${farmerId}: ${farmerBookingsResponse.data.length} bookings`);
        
        if (farmerBookingsResponse.data.length > 0) {
          farmerBookingsResponse.data.forEach((booking, index) => {
            console.log(`  ${index + 1}. ${booking.bookingId} - ${booking.status}`);
          });
        }
      } catch (error) {
        console.log(`❌ Farmer ${farmerId}: ${error.response?.status} - ${error.response?.data?.error || error.message}`);
      }
    }

    // Test 4: Check if there are any bookings with common farmer ID patterns
    try {
      const allBookingsResponse = await axios.get(`${API_URL}/api/transport/bookings`);
      const uniqueFarmerIds = [...new Set(allBookingsResponse.data.map(b => b.farmerId))];
      
      console.log('\n🔍 Unique farmer IDs in bookings:');
      uniqueFarmerIds.forEach((id, index) => {
        const count = allBookingsResponse.data.filter(b => b.farmerId === id).length;
        console.log(`${index + 1}. ${id}: ${count} bookings`);
      });
      
      // Test with actual farmer IDs found
      if (uniqueFarmerIds.length > 0) {
        console.log('\n🔍 Testing with actual farmer IDs:');
        for (const farmerId of uniqueFarmerIds.slice(0, 3)) {
          try {
            const response = await axios.get(`${API_URL}/api/transport/bookings/farmer/${farmerId}`);
            console.log(`✅ Farmer ${farmerId}: ${response.data.length} bookings found`);
          } catch (error) {
            console.log(`❌ Farmer ${farmerId}: Error - ${error.message}`);
          }
        }
      }
      
    } catch (error) {
      console.log('❌ Failed to analyze farmer IDs');
    }

  } catch (error) {
    console.error('❌ Error testing order tracking API:', error.message);
  }
}

testOrderTrackingAPI();