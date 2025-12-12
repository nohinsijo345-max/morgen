const mongoose = require('mongoose');
const Driver = require('../models/Driver');
const Vehicle = require('../models/Vehicle');
const Booking = require('../models/Booking');
const User = require('../models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/farmconnect');

async function testBackendIntegration() {
  try {
    console.log('🧪 Testing Backend Integration...\n');

    // Test 1: Driver-Vehicle Assignment
    console.log('1️⃣ Testing Driver-Vehicle Assignment:');
    const drivers = await Driver.find().limit(3);
    const vehicles = await Vehicle.find().limit(5);
    
    console.log(`   - Found ${drivers.length} drivers`);
    console.log(`   - Found ${vehicles.length} vehicles`);
    
    for (const driver of drivers) {
      const assignedVehicles = await Vehicle.find({ driverId: driver.driverId });
      console.log(`   - ${driver.name} (${driver.driverId}): ${assignedVehicles.length} vehicles`);
      
      if (assignedVehicles.length > 0) {
        assignedVehicles.forEach(v => {
          console.log(`     * ${v.name} (${v.type})`);
        });
      }
    }

    // Test 2: Driver Dashboard Data
    console.log('\n2️⃣ Testing Driver Dashboard Data:');
    if (drivers.length > 0) {
      const testDriver = drivers[0];
      console.log(`   Testing dashboard for: ${testDriver.name}`);
      
      const driverVehicles = await Vehicle.find({ driverId: testDriver.driverId });
      const driverBookings = await Booking.find({ driverId: testDriver.driverId });
      const pendingBookings = await Booking.countDocuments({ 
        driverId: testDriver.driverId, 
        status: 'pending' 
      });
      
      console.log(`   - Assigned vehicles: ${driverVehicles.length}`);
      console.log(`   - Total bookings: ${driverBookings.length}`);
      console.log(`   - Pending bookings: ${pendingBookings}`);
      
      if (driverVehicles.length === 0) {
        console.log('   ⚠️  No vehicles assigned to this driver');
      }
    }

    // Test 3: Booking System
    console.log('\n3️⃣ Testing Booking System:');
    const allBookings = await Booking.find().limit(5);
    console.log(`   - Total bookings in system: ${allBookings.length}`);
    
    for (const booking of allBookings) {
      console.log(`   - ${booking.bookingId}: ${booking.status}`);
      console.log(`     * Tracking steps: ${booking.trackingSteps?.length || 0}`);
      console.log(`     * Driver assigned: ${booking.driverId ? 'Yes' : 'No'}`);
      console.log(`     * Cancellation request: ${booking.cancellationRequest?.status || 'None'}`);
    }

    // Test 4: Cancellation System
    console.log('\n4️⃣ Testing Cancellation System:');
    const cancellableBookings = await Booking.find({
      status: { $in: ['pending', 'confirmed'] },
      $or: [
        { 'trackingSteps.step': { $ne: 'order_picked_up' } },
        { 'trackingSteps': { $not: { $elemMatch: { step: 'order_picked_up', status: 'completed' } } } }
      ]
    });
    
    console.log(`   - Cancellable bookings: ${cancellableBookings.length}`);
    
    const cancelRequests = await Booking.find({ 
      'cancellationRequest.status': 'pending' 
    });
    console.log(`   - Pending cancellation requests: ${cancelRequests.length}`);

    // Test 5: Farmer-Booking Relationship
    console.log('\n5️⃣ Testing Farmer-Booking Relationship:');
    const farmers = await User.find({ role: 'farmer' }).limit(3);
    
    for (const farmer of farmers) {
      const farmerBookings = await Booking.find({ farmerId: farmer.farmerId });
      console.log(`   - ${farmer.name} (${farmer.farmerId}): ${farmerBookings.length} bookings`);
    }

    // Test 6: Vehicle Availability System
    console.log('\n6️⃣ Testing Vehicle Availability:');
    const availableVehicles = await Vehicle.find({ availability: true });
    const unavailableVehicles = await Vehicle.find({ availability: false });
    
    console.log(`   - Available vehicles: ${availableVehicles.length}`);
    console.log(`   - Unavailable vehicles: ${unavailableVehicles.length}`);

    // Test 7: Tracking System
    console.log('\n7️⃣ Testing Tracking System:');
    const trackingBookings = await Booking.find({ 
      trackingSteps: { $exists: true, $ne: [] } 
    });
    
    console.log(`   - Bookings with tracking: ${trackingBookings.length}`);
    
    if (trackingBookings.length > 0) {
      const sampleBooking = trackingBookings[0];
      console.log(`   - Sample tracking (${sampleBooking.trackingId}):`);
      sampleBooking.trackingSteps.forEach(step => {
        console.log(`     * ${step.step}: ${step.status}`);
      });
    }

    // Summary
    console.log('\n📊 Integration Test Summary:');
    console.log(`   ✅ Drivers: ${drivers.length}`);
    console.log(`   ✅ Vehicles: ${vehicles.length}`);
    console.log(`   ✅ Bookings: ${allBookings.length}`);
    console.log(`   ✅ Available vehicles: ${availableVehicles.length}`);
    console.log(`   ✅ Tracking enabled: ${trackingBookings.length}`);
    console.log(`   ✅ Cancellation requests: ${cancelRequests.length}`);

    // Identify Issues
    console.log('\n🔍 Potential Issues:');
    const driversWithoutVehicles = await Driver.find();
    let driversWithoutVehiclesCount = 0;
    
    for (const driver of driversWithoutVehicles) {
      const vehicleCount = await Vehicle.countDocuments({ driverId: driver.driverId });
      if (vehicleCount === 0) {
        driversWithoutVehiclesCount++;
      }
    }
    
    if (driversWithoutVehiclesCount > 0) {
      console.log(`   ⚠️  ${driversWithoutVehiclesCount} drivers have no vehicles assigned`);
    }
    
    const bookingsWithoutDrivers = await Booking.countDocuments({ 
      driverId: { $exists: false } 
    });
    
    if (bookingsWithoutDrivers > 0) {
      console.log(`   ⚠️  ${bookingsWithoutDrivers} bookings have no driver assigned`);
    }

    console.log('\n✅ Backend integration test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    mongoose.connection.close();
  }
}

testBackendIntegration();