const mongoose = require('mongoose');
require('dotenv').config();

async function debugSpecificBooking() {
  try {
    console.log('🔍 Debugging Specific Booking Issue');
    console.log('=' .repeat(50));

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/morgen');
    console.log('📊 Connected to MongoDB');

    const Booking = require('../models/Booking');
    
    // Get the booking ID from the error (you can see it in the browser console)
    // For now, let's check all bookings with drivers
    const bookings = await Booking.find({ 
      driverId: { $exists: true, $ne: null }
    }).limit(5);

    console.log(`📦 Found ${bookings.length} bookings with drivers:`);
    
    bookings.forEach((booking, index) => {
      console.log(`\n${index + 1}. Booking: ${booking.bookingId}`);
      console.log(`   Status: ${booking.status}`);
      console.log(`   Driver: ${booking.driverId}`);
      console.log(`   Farmer: ${booking.farmerName}`);
      console.log(`   Tracking Steps: ${booking.trackingSteps ? booking.trackingSteps.length : 0}`);
      
      if (booking.trackingSteps && booking.trackingSteps.length > 0) {
        console.log(`   Steps:`);
        booking.trackingSteps.forEach(step => {
          console.log(`     - ${step.step}: ${step.status}`);
        });
      } else {
        console.log(`   ⚠️ No tracking steps found!`);
      }
      
      // Check if fromLocation exists
      if (!booking.fromLocation || !booking.fromLocation.city) {
        console.log(`   ⚠️ Missing fromLocation data`);
      }
    });

    // Check for bookings that might cause issues
    const problematicBookings = await Booking.find({
      driverId: { $exists: true, $ne: null },
      $or: [
        { trackingSteps: { $exists: false } },
        { trackingSteps: { $size: 0 } },
        { 'fromLocation.city': { $exists: false } },
        { 'fromLocation.district': { $exists: false } }
      ]
    });

    if (problematicBookings.length > 0) {
      console.log(`\n⚠️ Found ${problematicBookings.length} potentially problematic bookings:`);
      problematicBookings.forEach(booking => {
        console.log(`   - ${booking.bookingId}: Missing tracking steps or location data`);
      });
      
      // Fix the problematic bookings
      console.log('\n🔧 Fixing problematic bookings...');
      for (const booking of problematicBookings) {
        if (!booking.trackingSteps || booking.trackingSteps.length === 0) {
          booking.trackingSteps = [
            { 
              step: 'order_placed', 
              status: 'completed', 
              timestamp: new Date(), 
              location: booking.fromLocation?.city ? `${booking.fromLocation.city}, ${booking.fromLocation.district || 'Unknown'}` : 'Unknown Location',
              notes: 'Order has been placed successfully'
            },
            { step: 'order_accepted', status: 'completed', timestamp: new Date(), notes: 'Order accepted by driver' },
            { step: 'pickup_started', status: 'pending' },
            { step: 'order_picked_up', status: 'pending' },
            { step: 'in_transit', status: 'pending' },
            { step: 'delivered', status: 'pending' }
          ];
          
          // Ensure fromLocation exists
          if (!booking.fromLocation) {
            booking.fromLocation = {
              city: 'Unknown City',
              district: 'Unknown District',
              state: 'Unknown State'
            };
          }
          
          await booking.save();
          console.log(`   ✅ Fixed booking: ${booking.bookingId}`);
        }
      }
    } else {
      console.log('\n✅ No problematic bookings found');
    }

    // Test a simple status update on the first available booking
    if (bookings.length > 0) {
      const testBooking = bookings[0];
      console.log(`\n🧪 Testing status update on: ${testBooking.bookingId}`);
      
      // Simulate the status update logic
      const step = 'pickup_started';
      const location = 'Debug Test Location';
      const notes = 'Debug test notes';
      
      console.log(`   Current status: ${testBooking.status}`);
      console.log(`   Attempting step: ${step}`);
      
      const stepIndex = testBooking.trackingSteps.findIndex(s => s.step === step);
      if (stepIndex !== -1) {
        console.log(`   ✅ Step found at index: ${stepIndex}`);
        console.log(`   Current step status: ${testBooking.trackingSteps[stepIndex].status}`);
        
        if (testBooking.trackingSteps[stepIndex].status === 'completed') {
          console.log(`   ⚠️ Step already completed`);
        } else {
          console.log(`   ✅ Step can be updated`);
        }
      } else {
        console.log(`   ❌ Step not found in tracking steps`);
      }
    }

  } catch (error) {
    console.error('❌ Debug failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📊 Disconnected from MongoDB');
  }
}

// Run the debug
debugSpecificBooking();