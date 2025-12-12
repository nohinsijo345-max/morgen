const mongoose = require('mongoose');
const Booking = require('../models/Booking');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/morgen');

async function debugOrderAcceptanceIssue() {
  try {
    console.log('🔍 Debugging order acceptance issue...\n');
    
    // Find all bookings
    const allBookings = await Booking.find({}).populate('vehicleId');
    console.log(`📦 Found ${allBookings.length} total bookings\n`);
    
    // Check orders that should be ready for acceptance
    const confirmedOrders = allBookings.filter(booking => booking.status === 'confirmed');
    console.log(`✅ Orders in 'confirmed' status: ${confirmedOrders.length}`);
    
    if (confirmedOrders.length > 0) {
      console.log('\n📋 Confirmed orders details:');
      confirmedOrders.forEach(order => {
        console.log(`   ${order.bookingId}:`);
        console.log(`     Status: ${order.status}`);
        console.log(`     Driver: ${order.driverId || 'NOT ASSIGNED'}`);
        console.log(`     Farmer: ${order.farmerName}`);
        console.log(`     Ready for acceptance: ${order.driverId ? 'YES' : 'NO'}`);
        console.log('');
      });
    }
    
    // Check for orders with drivers but wrong status
    const ordersWithDrivers = allBookings.filter(booking => booking.driverId);
    console.log(`🚛 Orders with drivers assigned: ${ordersWithDrivers.length}`);
    
    if (ordersWithDrivers.length > 0) {
      console.log('\n👥 Orders with drivers:');
      ordersWithDrivers.forEach(order => {
        console.log(`   ${order.bookingId}:`);
        console.log(`     Status: ${order.status}`);
        console.log(`     Driver: ${order.driverId}`);
        console.log(`     Can be accepted: ${order.status === 'confirmed' ? 'YES' : 'NO'}`);
        console.log('');
      });
    }
    
    // Look for the specific order from screenshots (with DRV001)
    const drv001Orders = allBookings.filter(booking => booking.driverId === 'DRV001');
    console.log(`🎯 Orders assigned to DRV001: ${drv001Orders.length}`);
    
    if (drv001Orders.length > 0) {
      console.log('\n🔍 DRV001 orders details:');
      drv001Orders.forEach(order => {
        console.log(`   ${order.bookingId}:`);
        console.log(`     Status: ${order.status}`);
        console.log(`     Vehicle: ${order.vehicleId?.name || 'N/A'}`);
        console.log(`     Farmer: ${order.farmerName}`);
        console.log(`     Created: ${order.createdAt}`);
        console.log(`     Can accept: ${order.status === 'confirmed' ? 'YES' : 'NO'}`);
        
        // Check tracking steps
        if (order.trackingSteps && order.trackingSteps.length > 0) {
          console.log(`     Tracking steps:`);
          order.trackingSteps.forEach((step, index) => {
            console.log(`       ${index + 1}. ${step.step}: ${step.status} ${step.timestamp ? `(${step.timestamp})` : ''}`);
          });
        }
        console.log('');
      });
    }
    
    // Check for any orders that might need status fixes
    console.log('🔧 Checking for orders that need status fixes:');
    let fixedCount = 0;
    
    for (const booking of allBookings) {
      let needsUpdate = false;
      
      // If order has driver but status is pending, fix to confirmed
      if (booking.driverId && booking.status === 'pending') {
        console.log(`   🔧 ${booking.bookingId}: Has driver ${booking.driverId} but status is pending - fixing to confirmed`);
        booking.status = 'confirmed';
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        await booking.save();
        fixedCount++;
      }
    }
    
    if (fixedCount > 0) {
      console.log(`\n✅ Fixed ${fixedCount} orders`);
    } else {
      console.log(`\n✅ No orders needed fixing`);
    }
    
    // Final summary
    console.log('\n📊 Summary:');
    const statusCounts = {};
    allBookings.forEach(booking => {
      statusCounts[booking.status] = (statusCounts[booking.status] || 0) + 1;
    });
    
    console.log('Status distribution:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`   ${status}: ${count}`);
    });
    
    const readyForAcceptance = allBookings.filter(booking => 
      booking.status === 'confirmed' && booking.driverId
    );
    
    console.log(`\n🎯 Orders ready for acceptance: ${readyForAcceptance.length}`);
    if (readyForAcceptance.length > 0) {
      readyForAcceptance.forEach(order => {
        console.log(`   - ${order.bookingId} (Driver: ${order.driverId})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

debugOrderAcceptanceIssue();