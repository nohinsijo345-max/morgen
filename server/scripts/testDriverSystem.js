const mongoose = require('mongoose');
const Driver = require('../models/Driver');
const Vehicle = require('../models/Vehicle');
const Booking = require('../models/Booking');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/farmconnect', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function testDriverSystem() {
  try {
    console.log('🧪 Testing Driver System...\n');

    // Test 1: Check if drivers exist
    const drivers = await Driver.find().select('-password');
    console.log(`✅ Found ${drivers.length} drivers in database`);
    
    if (drivers.length > 0) {
      console.log('📋 Sample drivers:');
      drivers.slice(0, 3).forEach(driver => {
        console.log(`   - ${driver.name} (${driver.driverId}) - ${driver.vehicleType}`);
      });
    }

    // Test 2: Check vehicle assignments
    const assignedVehicles = await Vehicle.find({ driverId: { $exists: true } });
    console.log(`\n🚛 Found ${assignedVehicles.length} assigned vehicles`);
    
    if (assignedVehicles.length > 0) {
      console.log('📋 Vehicle assignments:');
      assignedVehicles.slice(0, 3).forEach(vehicle => {
        console.log(`   - ${vehicle.name} assigned to driver ${vehicle.driverId}`);
      });
    }

    // Test 3: Check available vehicles for assignment
    const availableVehicles = await Vehicle.find({ 
      $or: [
        { driverId: { $exists: false } },
        { driverId: null }
      ]
    });
    console.log(`\n🆓 Found ${availableVehicles.length} available vehicles for assignment`);

    // Test 4: Check bookings with driver assignments
    const bookingsWithDrivers = await Booking.find({ driverId: { $exists: true } });
    console.log(`\n📦 Found ${bookingsWithDrivers.length} bookings with driver assignments`);

    // Test 5: Test driver dashboard data structure
    if (drivers.length > 0) {
      const testDriver = drivers[0];
      console.log(`\n🎯 Testing dashboard data for driver: ${testDriver.name}`);
      
      const driverVehicles = await Vehicle.find({ driverId: testDriver.driverId });
      const driverBookings = await Booking.find({ driverId: testDriver.driverId }).limit(5);
      const pendingBookings = await Booking.countDocuments({ 
        driverId: testDriver.driverId, 
        status: 'pending' 
      });

      console.log(`   - Assigned vehicles: ${driverVehicles.length}`);
      console.log(`   - Total bookings: ${driverBookings.length}`);
      console.log(`   - Pending bookings: ${pendingBookings}`);
    }

    // Test 6: Check booking tracking system
    const trackingBookings = await Booking.find({ 
      trackingSteps: { $exists: true, $ne: [] } 
    }).limit(3);
    console.log(`\n📍 Found ${trackingBookings.length} bookings with tracking data`);

    if (trackingBookings.length > 0) {
      console.log('📋 Sample tracking data:');
      trackingBookings.forEach(booking => {
        console.log(`   - ${booking.bookingId}: ${booking.trackingSteps.length} tracking steps`);
      });
    }

    console.log('\n✅ Driver system test completed successfully!');
    console.log('\n📝 System Status:');
    console.log(`   - Drivers: ${drivers.length} registered`);
    console.log(`   - Vehicle assignments: ${assignedVehicles.length} active`);
    console.log(`   - Available vehicles: ${availableVehicles.length} unassigned`);
    console.log(`   - Driver bookings: ${bookingsWithDrivers.length} total`);
    console.log(`   - Tracking enabled: ${trackingBookings.length} bookings`);

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    mongoose.connection.close();
  }
}

testDriverSystem();