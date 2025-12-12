const axios = require('axios');

const API_URL = 'http://localhost:5050';

async function testDriverDashboard() {
  console.log('🧪 Testing Driver Dashboard - Vehicle Assignment');
  console.log('=' .repeat(50));

  try {
    // Test different drivers
    const drivers = ['DRV001', 'DRV002', 'DRV003', 'DRV004', 'DRV005'];
    
    for (const driverId of drivers) {
      console.log(`\n👨‍💼 Testing driver: ${driverId}`);
      
      try {
        const response = await axios.get(`${API_URL}/api/driver/dashboard/${driverId}`);
        
        console.log(`✅ Dashboard loaded for ${response.data.driver?.name || 'Unknown'}`);
        console.log(`📊 Stats:`);
        console.log(`   Total trips: ${response.data.stats?.totalTrips || 0}`);
        console.log(`   Total earnings: ₹${response.data.stats?.totalEarnings || 0}`);
        console.log(`   Pending bookings: ${response.data.stats?.pendingBookings || 0}`);
        
        const vehicles = response.data.vehicles || [];
        console.log(`🚛 Assigned vehicles: ${vehicles.length}`);
        
        if (vehicles.length > 0) {
          vehicles.forEach((vehicle, index) => {
            console.log(`   ${index + 1}. ${vehicle.name} (${vehicle.type})`);
            console.log(`      Available: ${vehicle.availability ? 'Yes' : 'No'}`);
            console.log(`      Price options: ${vehicle.priceOptions?.length || 0}`);
          });
        } else {
          console.log('   No vehicles assigned');
        }
        
        const bookings = response.data.recentBookings || [];
        console.log(`📋 Recent bookings: ${bookings.length}`);
        
        if (bookings.length > 0) {
          bookings.slice(0, 2).forEach((booking, index) => {
            console.log(`   ${index + 1}. ${booking.bookingId} - ${booking.status} - ₹${booking.finalAmount}`);
          });
        }
        
      } catch (error) {
        console.log(`❌ Failed to load dashboard for ${driverId}:`, error.response?.data?.error || error.message);
      }
    }

    // Specifically test Rajesh (DRV003) after assignment
    console.log(`\n🔍 Detailed check for Rajesh (DRV003):`);
    
    try {
      const rajeshResponse = await axios.get(`${API_URL}/api/driver/dashboard/DRV003`);
      const rajeshVehicles = rajeshResponse.data.vehicles || [];
      
      console.log(`👨‍💼 Driver: ${rajeshResponse.data.driver?.name}`);
      console.log(`🚛 Vehicles: ${rajeshVehicles.length}`);
      
      if (rajeshVehicles.length > 0) {
        console.log('✅ Rajesh has vehicles assigned!');
        rajeshVehicles.forEach((vehicle, index) => {
          console.log(`   ${index + 1}. ${vehicle.name}`);
          console.log(`      Type: ${vehicle.type}`);
          console.log(`      Model: ${vehicle.model || 'N/A'}`);
          console.log(`      Available: ${vehicle.availability}`);
          console.log(`      Driver ID: ${vehicle.driverId}`);
        });
      } else {
        console.log('❌ Rajesh still has no vehicles assigned');
        
        // Check if there are vehicles assigned to DRV003 in the database
        console.log('\n🔍 Checking vehicle assignments in database...');
        try {
          const allVehiclesResponse = await axios.get(`${API_URL}/api/admin/transport/vehicles`);
          const assignedToRajesh = allVehiclesResponse.data.filter(v => v.driverId === 'DRV003');
          
          console.log(`📊 Vehicles assigned to DRV003 in database: ${assignedToRajesh.length}`);
          assignedToRajesh.forEach((vehicle, index) => {
            console.log(`   ${index + 1}. ${vehicle.name} (ID: ${vehicle._id})`);
          });
          
        } catch (vehicleError) {
          console.log('❌ Failed to check vehicle assignments:', vehicleError.response?.data?.error || vehicleError.message);
        }
      }
      
    } catch (error) {
      console.log('❌ Failed to get Rajesh dashboard:', error.response?.data?.error || error.message);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testDriverDashboard();