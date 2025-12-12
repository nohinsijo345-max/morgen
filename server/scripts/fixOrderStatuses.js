const mongoose = require('mongoose');
const Booking = require('../models/Booking');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/morgen');

async function fixOrderStatuses() {
  try {
    console.log('🔧 Fixing order statuses and tracking steps...\n');
    
    // Find all bookings
    const allBookings = await Booking.find({});
    console.log(`📦 Found ${allBookings.length} bookings to check\n`);
    
    let fixedCount = 0;
    
    for (const booking of allBookings) {
      let needsUpdate = false;
      
      console.log(`📋 Checking ${booking.bookingId}:`);
      console.log(`   Current status: ${booking.status}`);
      console.log(`   Driver: ${booking.driverId || 'Not assigned'}`);
      
      // Check if order has driver but wrong status
      if (booking.driverId && booking.status === 'pending') {
        console.log(`   ⚠️  Has driver but status is pending - fixing to confirmed`);
        booking.status = 'confirmed';
        needsUpdate = true;
      }
      
      // Reset tracking steps to proper initial state
      if (booking.trackingSteps && booking.trackingSteps.length > 0) {
        const orderPlacedStep = booking.trackingSteps.find(s => s.step === 'order_placed');
        const orderAcceptedStep = booking.trackingSteps.find(s => s.step === 'order_accepted');
        
        // Ensure order_placed is completed
        if (orderPlacedStep && orderPlacedStep.status !== 'completed') {
          console.log(`   🔧 Fixing order_placed step`);
          orderPlacedStep.status = 'completed';
          orderPlacedStep.timestamp = booking.createdAt;
          orderPlacedStep.notes = 'Order has been placed successfully';
          needsUpdate = true;
        }
        
        // Set order_accepted based on actual order status
        if (orderAcceptedStep) {
          if (booking.status === 'order_accepted' && orderAcceptedStep.status !== 'completed') {
            console.log(`   🔧 Fixing order_accepted step - marking as completed`);
            orderAcceptedStep.status = 'completed';
            orderAcceptedStep.timestamp = orderAcceptedStep.timestamp || new Date();
            orderAcceptedStep.notes = orderAcceptedStep.notes || 'Order accepted by admin driver';
            needsUpdate = true;
          } else if (booking.status === 'confirmed' && orderAcceptedStep.status === 'completed') {
            console.log(`   🔧 Fixing order_accepted step - marking as pending`);
            orderAcceptedStep.status = 'pending';
            orderAcceptedStep.timestamp = null;
            orderAcceptedStep.notes = null;
            needsUpdate = true;
          }
        }
      }
      
      if (needsUpdate) {
        await booking.save();
        fixedCount++;
        console.log(`   ✅ Fixed!`);
      } else {
        console.log(`   ✅ No changes needed`);
      }
      console.log('');
    }
    
    console.log(`🎉 Fixed ${fixedCount} bookings out of ${allBookings.length} total`);
    
    // Show final status
    console.log('\n📊 Final status summary:');
    const statusCounts = await Booking.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    statusCounts.forEach(status => {
      console.log(`   ${status._id}: ${status.count}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

fixOrderStatuses();