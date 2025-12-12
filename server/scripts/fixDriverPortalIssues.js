const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Driver = require('../models/Driver');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/morgen');

async function fixDriverPortalIssues() {
  try {
    console.log('🔧 Fixing driver portal order visibility issues...\n');
    
    // Get all bookings and drivers
    const allBookings = await Booking.find({}).populate('vehicleId');
    const allDrivers = await Driver.find({});
    
    console.log(`📦 Found ${allBookings.length} bookings`);
    console.log(`👥 Found ${allDrivers.length} drivers\n`);
    
    let fixedCount = 0;
    
    // Check each booking for issues
    for (const booking of allBookings) {
      let needsUpdate = false;
      const originalStatus = booking.status;
      
      console.log(`📋 Checking ${booking.bookingId}:`);
      console.log(`   Current status: ${booking.status}`);
      console.log(`   Driver: ${booking.driverId || 'Not assigned'}`);
      
      // Fix 1: If order has driver but status is pending, change to confirmed
      if (booking.driverId && booking.status === 'pending') {
        console.log(`   🔧 Has driver but status is pending - fixing to confirmed`);
        booking.status = 'confirmed';
        needsUpdate = true;
      }
      
      // Fix 2: If order is order_accepted but tracking steps don't reflect it
      if (booking.status === 'order_accepted') {
        const acceptedStep = booking.trackingSteps.find(s => s.step === 'order_accepted');
        if (acceptedStep && acceptedStep.status !== 'completed') {
          console.log(`   🔧 Order accepted but tracking step not completed - fixing`);
          acceptedStep.status = 'completed';
          acceptedStep.timestamp = acceptedStep.timestamp || new Date();
          acceptedStep.notes = acceptedStep.notes || 'Order accepted by admin driver';
          needsUpdate = true;
        }
      }
      
      // Fix 3: Ensure order_placed step is always completed
      const orderPlacedStep = booking.trackingSteps.find(s => s.step === 'order_placed');
      if (orderPlacedStep && orderPlacedStep.status !== 'completed') {
        console.log(`   🔧 Order placed step not completed - fixing`);
        orderPlacedStep.status = 'completed';
        orderPlacedStep.timestamp = orderPlacedStep.timestamp || booking.createdAt;
        orderPlacedStep.notes = orderPlacedStep.notes || 'Order has been placed successfully';
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        await booking.save();
        fixedCount++;
        console.log(`   ✅ Fixed! Status: ${originalStatus} → ${booking.status}`);
      } else {
        console.log(`   ✅ No changes needed`);
      }
      console.log('');
    }
    
    console.log(`🎉 Fixed ${fixedCount} bookings\n`);
    
    // Show current state for each driver
    console.log('📱 Current driver order visibility:');
    for (const driver of allDrivers) {
      const driverOrders = allBookings.filter(booking => booking.driverId === driver.driverId);
      const activeOrders = driverOrders.filter(booking => 
        !['completed', 'cancelled'].includes(booking.status)
      );
      
      console.log(`\n🚛 ${driver.name} (${driver.driverId}):`);
      console.log(`   Total assigned: ${driverOrders.length}`);
      console.log(`   Active (visible): ${activeOrders.length}`);
      
      if (activeOrders.length > 0) {
        activeOrders.forEach(order => {
          console.log(`     - ${order.bookingId}: ${order.status} (${order.farmerName})`);
        });
      }
    }
    
    // Specifically check DRV002
    console.log('\n🎯 DRV002 (Rajesh Kumar) specific check:');
    const rajeshOrders = allBookings.filter(booking => booking.driverId === 'DRV002');
    const rajeshActiveOrders = rajeshOrders.filter(booking => 
      !['completed', 'cancelled'].includes(booking.status)
    );
    
    console.log(`   Total orders: ${rajeshOrders.length}`);
    console.log(`   Active orders: ${rajeshActiveOrders.length}`);
    
    if (rajeshActiveOrders.length > 0) {
      console.log(`   Active orders details:`);
      rajeshActiveOrders.forEach(order => {
        console.log(`     - ${order.bookingId}: ${order.status}`);
        console.log(`       Farmer: ${order.farmerName}`);
        console.log(`       Vehicle: ${order.vehicleId?.name || 'N/A'}`);
        console.log(`       Created: ${order.createdAt}`);
      });
    } else {
      console.log(`   ❌ No active orders found for DRV002`);
      
      // Check if there are any orders assigned but not active
      if (rajeshOrders.length > 0) {
        console.log(`   Inactive orders:`);
        rajeshOrders.forEach(order => {
          console.log(`     - ${order.bookingId}: ${order.status} (${order.farmerName})`);
        });
      }
    }
    
    console.log('\n✅ Driver portal fix complete!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

fixDriverPortalIssues();