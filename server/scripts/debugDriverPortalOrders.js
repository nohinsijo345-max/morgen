const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Driver = require('../models/Driver');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/morgen');

async function debugDriverPortalOrders() {
  try {
    console.log('🔍 Debugging driver portal order issues...\n');
    
    // Check all drivers
    const drivers = await Driver.find({});
    console.log(`👥 Found ${drivers.length} drivers:`);
    drivers.forEach(driver => {
      console.log(`   - ${driver.name} (${driver.driverId}) - ${driver.vehicleType}`);
    });
    console.log('');
    
    // Check all bookings
    const allBookings = await Booking.find({}).populate('vehicleId');
    console.log(`📦 Total bookings: ${allBookings.length}\n`);
    
    // Check orders for each driver
    for (const driver of drivers) {
      console.log(`🚛 Checking orders for ${driver.name} (${driver.driverId}):`);
      
      // Find orders assigned to this driver
      const driverOrders = allBookings.filter(booking => booking.driverId === driver.driverId);
      console.log(`   Total assigned orders: ${driverOrders.length}`);
      
      if (driverOrders.length > 0) {
        driverOrders.forEach(order => {
          console.log(`   📋 ${order.bookingId}:`);
          console.log(`      Status: ${order.status}`);
          console.log(`      Farmer: ${order.farmerName}`);
          console.log(`      Vehicle: ${order.vehicleId?.name || 'N/A'}`);
          console.log(`      Created: ${order.createdAt}`);
          
          // Check if this would show in driver dashboard
          const isActive = !['completed', 'cancelled'].includes(order.status);
          console.log(`      Would show in dashboard: ${isActive ? 'YES' : 'NO'}`);
          console.log('');
        });
      } else {
        console.log(`   ❌ No orders assigned to this driver\n`);
      }
    }
    
    // Specifically check for DRV002 (Rajesh Kumar from screenshots)
    console.log('🎯 Specific check for DRV002 (Rajesh Kumar):');
    const rajeshOrders = allBookings.filter(booking => booking.driverId === 'DRV002');
    console.log(`   Orders assigned to DRV002: ${rajeshOrders.length}`);
    
    if (rajeshOrders.length > 0) {
      rajeshOrders.forEach(order => {
        console.log(`   - ${order.bookingId}: ${order.status} (${order.farmerName})`);
        
        // Check tracking steps
        if (order.trackingSteps && order.trackingSteps.length > 0) {
          console.log(`     Tracking steps:`);
          order.trackingSteps.forEach((step, index) => {
            console.log(`       ${index + 1}. ${step.step}: ${step.status} ${step.timestamp ? `(${step.timestamp})` : ''}`);
          });
        }
      });
    } else {
      console.log('   ❌ No orders found for DRV002');
    }
    
    // Check for orders that should be visible to drivers
    console.log('\n📱 Orders that should appear in driver dashboards:');
    const activeStatuses = ['confirmed', 'order_accepted', 'pickup_started', 'order_picked_up', 'in_transit', 'delivered'];
    
    for (const status of activeStatuses) {
      const ordersWithStatus = allBookings.filter(booking => 
        booking.status === status && booking.driverId
      );
      
      if (ordersWithStatus.length > 0) {
        console.log(`\n   ${status.toUpperCase()} orders with drivers:`);
        ordersWithStatus.forEach(order => {
          console.log(`     - ${order.bookingId}: Driver ${order.driverId} (${order.farmerName})`);
        });
      }
    }
    
    // Check for potential issues
    console.log('\n⚠️  Potential Issues:');
    
    // Orders with drivers but wrong status
    const ordersWithDriversWrongStatus = allBookings.filter(booking => 
      booking.driverId && !activeStatuses.includes(booking.status)
    );
    
    if (ordersWithDriversWrongStatus.length > 0) {
      console.log(`   Orders with drivers but inactive status:`);
      ordersWithDriversWrongStatus.forEach(order => {
        console.log(`     - ${order.bookingId}: Driver ${order.driverId}, Status ${order.status}`);
      });
    }
    
    // Orders accepted but no driver
    const acceptedOrdersNoDriver = allBookings.filter(booking => 
      booking.status === 'order_accepted' && !booking.driverId
    );
    
    if (acceptedOrdersNoDriver.length > 0) {
      console.log(`   Accepted orders without drivers:`);
      acceptedOrdersNoDriver.forEach(order => {
        console.log(`     - ${order.bookingId}: Status ${order.status}, No driver`);
      });
    }
    
    console.log('\n✅ Debug complete!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

debugDriverPortalOrders();