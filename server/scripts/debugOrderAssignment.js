const mongoose = require('mongoose');
const Booking = require('../models/Booking');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/morgen');

async function debugOrderAssignment() {
  try {
    console.log('🔍 Debugging order assignment issues...\n');
    
    // Find all bookings
    const allBookings = await Booking.find({}).populate('vehicleId');
    console.log(`📦 Total bookings found: ${allBookings.length}\n`);
    
    // Check each booking
    for (const booking of allBookings) {
      console.log(`📋 Booking ID: ${booking.bookingId}`);
      console.log(`   Status: ${booking.status}`);
      console.log(`   Driver ID: ${booking.driverId || 'NOT ASSIGNED'}`);
      console.log(`   Farmer: ${booking.farmerName}`);
      console.log(`   Vehicle: ${booking.vehicleId?.name || 'N/A'}`);
      console.log(`   Created: ${booking.createdAt}`);
      
      // Check tracking steps
      if (booking.trackingSteps && booking.trackingSteps.length > 0) {
        console.log(`   Tracking Steps:`);
        booking.trackingSteps.forEach((step, index) => {
          console.log(`     ${index + 1}. ${step.step}: ${step.status} ${step.timestamp ? `(${step.timestamp})` : ''}`);
        });
      }
      console.log('   ---');
    }
    
    // Check for specific driver
    console.log('\n🚛 Checking orders for driver DRV002:');
    const driverOrders = await Booking.find({ driverId: 'DRV002' }).populate('vehicleId');
    console.log(`   Found ${driverOrders.length} orders for DRV002`);
    
    driverOrders.forEach(order => {
      console.log(`   - ${order.bookingId}: ${order.status} (${order.farmerName})`);
    });
    
    // Check orders with "Driver Assigned" badge but no actual assignment
    console.log('\n⚠️  Checking for inconsistencies:');
    const confirmedOrders = await Booking.find({ status: 'confirmed' });
    confirmedOrders.forEach(order => {
      if (order.driverId) {
        console.log(`   ✅ ${order.bookingId}: Has driver ${order.driverId} and status ${order.status}`);
      } else {
        console.log(`   ❌ ${order.bookingId}: Status ${order.status} but no driver assigned`);
      }
    });
    
    // Check accepted orders
    console.log('\n✅ Accepted orders:');
    const acceptedOrders = await Booking.find({ status: 'order_accepted' });
    acceptedOrders.forEach(order => {
      console.log(`   - ${order.bookingId}: Driver ${order.driverId || 'NONE'}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

debugOrderAssignment();