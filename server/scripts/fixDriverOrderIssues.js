const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Driver = require('../models/Driver');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/morgen');

async function fixDriverOrderIssues() {
  try {
    console.log('🔧 Fixing driver order assignment issues...\n');
    
    // Check all drivers
    const drivers = await Driver.find({});
    console.log(`👥 Found ${drivers.length} drivers:`);
    drivers.forEach(driver => {
      console.log(`   - ${driver.name} (${driver.driverId})`);
    });
    console.log('');
    
    // Check all bookings
    const bookings = await Booking.find({}).populate('vehicleId');
    console.log(`📦 Found ${bookings.length} bookings\n`);
    
    // Check for the specific order from screenshot (BK1765576263290314)
    const specificOrder = bookings.find(b => b.bookingId === 'BK1765576263290314');
    if (specificOrder) {
      console.log(`🎯 Found specific order BK1765576263290314:`);
      console.log(`   Status: ${specificOrder.status}`);
      console.log(`   Driver: ${specificOrder.driverId || 'NOT ASSIGNED'}`);
      console.log(`   Farmer: ${specificOrder.farmerName}`);
      console.log(`   Created: ${specificOrder.createdAt}`);
      
      // Check if this order should be assigned to DRV002
      if (specificOrder.driverId === 'DRV002') {
        console.log(`   ✅ Order is assigned to DRV002`);
        
        // Check if DRV002 exists
        const driver = drivers.find(d => d.driverId === 'DRV002');
        if (driver) {
          console.log(`   ✅ Driver DRV002 exists: ${driver.name}`);
        } else {
          console.log(`   ❌ Driver DRV002 not found in database!`);
        }
      } else {
        console.log(`   ⚠️  Order not assigned to DRV002, current driver: ${specificOrder.driverId || 'NONE'}`);
      }
      console.log('');
    }
    
    // Check orders for each driver
    for (const driver of drivers) {
      const driverOrders = bookings.filter(b => b.driverId === driver.driverId);
      console.log(`🚛 Driver ${driver.driverId} (${driver.name}):`);
      console.log(`   Total orders: ${driverOrders.length}`);
      
      if (driverOrders.length > 0) {
        driverOrders.forEach(order => {
          console.log(`   - ${order.bookingId}: ${order.status} (${order.farmerName})`);
        });
      } else {
        console.log(`   - No orders assigned`);
      }
      console.log('');
    }
    
    // Check for orders with status inconsistencies
    console.log('🔍 Checking for status inconsistencies:');
    let fixedCount = 0;
    
    for (const booking of bookings) {
      let needsUpdate = false;
      
      // If order has driver but status is still pending, fix it
      if (booking.driverId && booking.status === 'pending') {
        console.log(`   🔧 ${booking.bookingId}: Has driver ${booking.driverId} but status is pending - fixing to confirmed`);
        booking.status = 'confirmed';
        needsUpdate = true;
      }
      
      // If order status is order_accepted but tracking doesn't reflect it
      if (booking.status === 'order_accepted') {
        const acceptedStep = booking.trackingSteps.find(s => s.step === 'order_accepted');
        if (acceptedStep && acceptedStep.status !== 'completed') {
          console.log(`   🔧 ${booking.bookingId}: Status is order_accepted but tracking step not completed - fixing`);
          acceptedStep.status = 'completed';
          acceptedStep.timestamp = acceptedStep.timestamp || new Date();
          acceptedStep.notes = acceptedStep.notes || 'Order accepted by admin driver';
          needsUpdate = true;
        }
      }
      
      if (needsUpdate) {
        await booking.save();
        fixedCount++;
      }
    }
    
    console.log(`\n✅ Fixed ${fixedCount} orders`);
    
    // Final summary
    console.log('\n📊 Final Summary:');
    console.log('Status distribution:');
    const statusCounts = {};
    bookings.forEach(booking => {
      statusCounts[booking.status] = (statusCounts[booking.status] || 0) + 1;
    });
    
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`   ${status}: ${count}`);
    });
    
    console.log('\nDriver assignments:');
    const driverCounts = {};
    bookings.forEach(booking => {
      const driver = booking.driverId || 'UNASSIGNED';
      driverCounts[driver] = (driverCounts[driver] || 0) + 1;
    });
    
    Object.entries(driverCounts).forEach(([driver, count]) => {
      console.log(`   ${driver}: ${count}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

fixDriverOrderIssues();