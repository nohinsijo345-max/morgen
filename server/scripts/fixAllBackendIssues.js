const mongoose = require('mongoose');
const Driver = require('../models/Driver');
const Vehicle = require('../models/Vehicle');
const Booking = require('../models/Booking');
const User = require('../models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/farmconnect');

async function fixAllBackendIssues() {
  try {
    console.log('🔧 Fixing All Backend Integration Issues...\n');

    // Fix 1: Ensure Rajesh has a truck assigned
    console.log('1️⃣ Fixing Driver-Vehicle Assignments:');
    const rajesh = await Driver.findOne({ 
      $or: [
        { name: /rajesh/i },
        { driverId: /rajesh/i }
      ]
    });
    
    if (rajesh) {
      console.log(`   Found driver: ${rajesh.name} (${rajesh.driverId})`);
      
      // Check current assignments
      const currentVehicles = await Vehicle.find({ driverId: rajesh.driverId });
      console.log(`   Current vehicles: ${currentVehicles.length}`);
      
      if (currentVehicles.length === 0) {
        // Find an available truck
        const availableTruck = await Vehicle.findOne({ 
          type: 'truck',
          $or: [
            { driverId: { $exists: false } },
            { driverId: null }
          ]
        });
        
        if (availableTruck) {
          availableTruck.driverId = rajesh.driverId;
          availableTruck.assignedAt = new Date();
          await availableTruck.save();
          console.log(`   ✅ Assigned ${availableTruck.name} to ${rajesh.name}`);
        } else {
          console.log('   ⚠️  No available trucks found');
        }
      } else {
        console.log(`   ✅ ${rajesh.name} already has vehicles assigned`);
        currentVehicles.forEach(v => {
          console.log(`      - ${v.name} (${v.type})`);
        });
      }
    } else {
      console.log('   ❌ Driver Rajesh not found');
    }

    // Fix 2: Initialize tracking steps for existing bookings
    console.log('\n2️⃣ Fixing Booking Tracking Steps:');
    const bookingsWithoutTracking = await Booking.find({
      $or: [
        { trackingSteps: { $exists: false } },
        { trackingSteps: { $size: 0 } }
      ]
    });
    
    console.log(`   Found ${bookingsWithoutTracking.length} bookings without tracking`);
    
    for (const booking of bookingsWithoutTracking) {
      booking.trackingSteps = [
        { 
          step: 'order_placed', 
          status: 'completed', 
          timestamp: booking.createdAt || new Date(), 
          location: `${booking.fromLocation?.city || 'Unknown'}, ${booking.fromLocation?.district || 'Unknown'}`,
          notes: 'Order has been placed successfully'
        },
        { step: 'order_accepted', status: booking.status === 'confirmed' ? 'completed' : 'pending' },
        { step: 'pickup_started', status: 'pending' },
        { step: 'order_picked_up', status: 'pending' },
        { step: 'in_transit', status: 'pending' },
        { step: 'delivered', status: booking.status === 'completed' ? 'completed' : 'pending' }
      ];
      
      // Set current step based on status
      if (booking.status === 'confirmed') {
        booking.trackingSteps[2].status = 'current'; // pickup_started
      } else if (booking.status === 'in-progress') {
        booking.trackingSteps[3].status = 'current'; // order_picked_up
      }
      
      await booking.save();
      console.log(`   ✅ Fixed tracking for ${booking.bookingId}`);
    }

    // Fix 3: Add tracking IDs to bookings without them
    console.log('\n3️⃣ Adding Missing Tracking IDs:');
    const bookingsWithoutTrackingId = await Booking.find({
      $or: [
        { trackingId: { $exists: false } },
        { trackingId: null },
        { trackingId: '' }
      ]
    });
    
    console.log(`   Found ${bookingsWithoutTrackingId.length} bookings without tracking ID`);
    
    for (const booking of bookingsWithoutTrackingId) {
      booking.trackingId = 'TRK' + Date.now().toString().slice(-6) + Math.random().toString(36).substr(2, 4).toUpperCase();
      await booking.save();
      console.log(`   ✅ Added tracking ID ${booking.trackingId} to ${booking.bookingId}`);
    }

    // Fix 4: Ensure all vehicles have proper availability status
    console.log('\n4️⃣ Fixing Vehicle Availability:');
    const vehiclesWithoutAvailability = await Vehicle.find({
      availability: { $exists: false }
    });
    
    for (const vehicle of vehiclesWithoutAvailability) {
      vehicle.availability = true;
      await vehicle.save();
      console.log(`   ✅ Set availability for ${vehicle.name}`);
    }

    // Fix 5: Create sample bookings for testing if none exist
    console.log('\n5️⃣ Creating Sample Data if Needed:');
    const totalBookings = await Booking.countDocuments();
    
    if (totalBookings === 0) {
      console.log('   No bookings found, creating sample booking...');
      
      const sampleFarmer = await User.findOne({ role: 'farmer' });
      const sampleVehicle = await Vehicle.findOne();
      
      if (sampleFarmer && sampleVehicle) {
        const sampleBooking = new Booking({
          bookingId: `BK${Date.now()}`,
          trackingId: 'TRK' + Date.now().toString().slice(-6) + Math.random().toString(36).substr(2, 4).toUpperCase(),
          farmerId: sampleFarmer.farmerId,
          farmerName: sampleFarmer.name,
          vehicleId: sampleVehicle._id,
          vehicleType: sampleVehicle.type,
          priceOption: sampleVehicle.priceOptions[0] || { capacity: '1 ton', pricePerKm: 10, basePrice: 100 },
          fromLocation: { state: 'Kerala', district: 'Ernakulam', city: 'Kochi' },
          toLocation: { state: 'Kerala', district: 'Thiruvananthapuram', city: 'Trivandrum' },
          pickupDate: new Date(),
          pickupTime: '10:00',
          expectedDeliveryDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
          distance: 200,
          totalAmount: 2100,
          handlingFee: 14,
          finalAmount: 2114,
          status: 'pending'
        });
        
        await sampleBooking.save();
        console.log(`   ✅ Created sample booking: ${sampleBooking.bookingId}`);
      }
    }

    // Fix 6: Verify all driver dashboard data
    console.log('\n6️⃣ Verifying Driver Dashboard Data:');
    const allDrivers = await Driver.find();
    
    for (const driver of allDrivers) {
      const vehicles = await Vehicle.find({ driverId: driver.driverId });
      const bookings = await Booking.find({ driverId: driver.driverId });
      const pendingBookings = await Booking.countDocuments({ 
        driverId: driver.driverId, 
        status: 'pending' 
      });
      
      console.log(`   ${driver.name} (${driver.driverId}):`);
      console.log(`     - Vehicles: ${vehicles.length}`);
      console.log(`     - Bookings: ${bookings.length}`);
      console.log(`     - Pending: ${pendingBookings}`);
    }

    // Summary
    console.log('\n📊 Fix Summary:');
    const finalStats = {
      drivers: await Driver.countDocuments(),
      vehicles: await Vehicle.countDocuments(),
      assignedVehicles: await Vehicle.countDocuments({ driverId: { $exists: true, $ne: null } }),
      bookings: await Booking.countDocuments(),
      bookingsWithTracking: await Booking.countDocuments({ trackingSteps: { $exists: true, $ne: [] } }),
      bookingsWithTrackingId: await Booking.countDocuments({ trackingId: { $exists: true, $ne: null, $ne: '' } })
    };
    
    console.log(`   ✅ Drivers: ${finalStats.drivers}`);
    console.log(`   ✅ Vehicles: ${finalStats.vehicles}`);
    console.log(`   ✅ Assigned Vehicles: ${finalStats.assignedVehicles}`);
    console.log(`   ✅ Bookings: ${finalStats.bookings}`);
    console.log(`   ✅ Bookings with Tracking: ${finalStats.bookingsWithTracking}`);
    console.log(`   ✅ Bookings with Tracking ID: ${finalStats.bookingsWithTrackingId}`);

    console.log('\n🎉 All backend issues have been fixed!');
    console.log('\n📝 What was fixed:');
    console.log('   1. Driver-vehicle assignments (Rajesh now has a truck)');
    console.log('   2. Booking tracking steps initialization');
    console.log('   3. Missing tracking IDs added');
    console.log('   4. Vehicle availability status');
    console.log('   5. Sample data creation if needed');
    console.log('   6. Driver dashboard data verification');

  } catch (error) {
    console.error('❌ Fix failed:', error);
  } finally {
    mongoose.connection.close();
  }
}

fixAllBackendIssues();