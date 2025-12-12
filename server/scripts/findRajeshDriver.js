const axios = require('axios');

const API_URL = 'http://localhost:5050';

async function findRajeshDriver() {
  console.log('🔍 Finding Rajesh Driver');
  console.log('=' .repeat(30));

  try {
    // Get all drivers from admin panel
    const driversResponse = await axios.get(`${API_URL}/api/admin/transport/drivers`);
    const drivers = driversResponse.data;
    
    console.log(`👥 Total drivers: ${drivers.length}`);
    console.log('\n📋 All drivers:');
    
    drivers.forEach((driver, index) => {
      console.log(`${index + 1}. ${driver.name} (${driver.driverId})`);
      console.log(`   Phone: ${driver.phone}`);
      console.log(`   Email: ${driver.email}`);
      console.log(`   Vehicle Type: ${driver.vehicleType}`);
      console.log(`   District: ${driver.district}`);
      console.log(`   Active: ${driver.isActive}`);
      console.log('');
    });
    
    // Find Rajesh specifically
    const rajeshDriver = drivers.find(d => d.name.toLowerCase().includes('rajesh'));
    
    if (rajeshDriver) {
      console.log('✅ Found Rajesh!');
      console.log(`👨‍💼 Name: ${rajeshDriver.name}`);
      console.log(`🆔 Driver ID: ${rajeshDriver.driverId}`);
      console.log(`📱 Phone: ${rajeshDriver.phone}`);
      console.log(`🚛 Vehicle Type: ${rajeshDriver.vehicleType}`);
      
      // Check his dashboard
      console.log('\n🔍 Checking Rajesh\'s dashboard...');
      try {
        const dashboardResponse = await axios.get(`${API_URL}/api/driver/dashboard/${rajeshDriver.driverId}`);
        const vehicles = dashboardResponse.data.vehicles || [];
        
        console.log(`🚛 Assigned vehicles: ${vehicles.length}`);
        if (vehicles.length > 0) {
          vehicles.forEach((vehicle, index) => {
            console.log(`   ${index + 1}. ${vehicle.name} (${vehicle.type})`);
          });
        } else {
          console.log('   No vehicles assigned to Rajesh');
          
          // Let's assign a vehicle to Rajesh
          console.log('\n🔧 Assigning a vehicle to Rajesh...');
          try {
            const availableVehiclesResponse = await axios.get(`${API_URL}/api/admin/transport/available-vehicles`);
            const availableVehicles = availableVehiclesResponse.data;
            
            if (availableVehicles.length > 0) {
              const vehicleToAssign = availableVehicles[0];
              console.log(`🚛 Assigning ${vehicleToAssign.name} to ${rajeshDriver.name}...`);
              
              const assignResponse = await axios.post(`${API_URL}/api/admin/transport/assign-vehicle`, {
                vehicleId: vehicleToAssign._id,
                driverId: rajeshDriver.driverId
              });
              
              console.log('✅ Vehicle assigned successfully!');
              console.log(`📝 Response: ${assignResponse.data.message}`);
              
              // Verify assignment
              const updatedDashboardResponse = await axios.get(`${API_URL}/api/driver/dashboard/${rajeshDriver.driverId}`);
              const updatedVehicles = updatedDashboardResponse.data.vehicles || [];
              console.log(`🔍 Verification: Rajesh now has ${updatedVehicles.length} vehicle(s)`);
              
            } else {
              console.log('❌ No available vehicles to assign');
            }
          } catch (assignError) {
            console.log('❌ Failed to assign vehicle:', assignError.response?.data?.error || assignError.message);
          }
        }
        
      } catch (dashboardError) {
        console.log('❌ Failed to get dashboard:', dashboardError.response?.data?.error || dashboardError.message);
      }
      
    } else {
      console.log('❌ Rajesh not found in drivers list');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

findRajeshDriver();