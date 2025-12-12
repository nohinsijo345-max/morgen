const mongoose = require('mongoose');
const Booking = require('../models/Booking');

async function fixExistingBookings() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://admin:morgen123@cluster0.qmcd0d4.mongodb.net/morgenDB?retryWrites=true&w=majority&appName=Cluster0');
    console.log('🔗 Connected to MongoDB');

    // Find bookings without trackingId or expectedDeliveryDate
    const bookingsToFix = await Booking.find({
      $or: [
        { trackingId: { $exists: false } },
        { trackingId: null },
        { trackingId: '' },
        { expectedDeliveryDate: { $exists: false } },
        { expectedDeliveryDate: null }
      ]
    });

    console.log(`📋 Found ${bookingsToFix.length} bookings to fix`);

    for (const booking of bookingsToFix) {
      console.log(`🔧 Fixing booking: ${booking.bookingId}`);
      
      // Generate trackingId if missing
      if (!booking.trackingId) {
        booking.trackingId = 'TRK' + Date.now().toString().slice(-6) + Math.random().toString(36).substr(2, 4).toUpperCase();
        console.log(`   Generated trackingId: ${booking.trackingId}`);
      }
      
      // Set expectedDeliveryDate if missing
      if (!booking.expectedDeliveryDate) {
        const expectedDate = new Date(booking.createdAt);
        expectedDate.setDate(expectedDate.getDate() + 2); // 2 days from creation
        booking.expectedDeliveryDate = expectedDate;
        console.log(`   Set expectedDeliveryDate: ${expectedDate.toLocaleDateString()}`);
      }
      
      // Ensure tracking steps exist
      if (!booking.trackingSteps || booking.trackingSteps.length === 0) {
        booking.trackingSteps = [
          { 
            step: 'order_placed', 
            status: 'completed', 
            timestamp: booking.createdAt || new Date(), 
            location: `${booking.fromLocation?.city || 'Unknown'}, ${booking.fromLocation?.district || 'Unknown'}`,
            notes: 'Order has been placed successfully'
          },
          { step: 'order_accepted', status: booking.status === 'confirmed' ? 'completed' : 'current' },
          { step: 'pickup_started', status: 'pending' },
          { step: 'order_picked_up', status: 'pending' },
          { step: 'in_transit', status: 'pending' },
          { step: 'delivered', status: 'pending' }
        ];
        console.log(`   Added tracking steps`);
      }
      
      await booking.save();
      console.log(`✅ Fixed booking: ${booking.bookingId}`);
    }

    console.log(`🎉 Successfully fixed ${bookingsToFix.length} bookings`);

    // Verify the fixes
    const allBookings = await Booking.find({});
    console.log(`\n📊 Verification - Total bookings: ${allBookings.length}`);
    
    const missingTrackingId = await Booking.countDocuments({
      $or: [
        { trackingId: { $exists: false } },
        { trackingId: null },
        { trackingId: '' }
      ]
    });
    
    const missingExpectedDate = await Booking.countDocuments({
      $or: [
        { expectedDeliveryDate: { $exists: false } },
        { expectedDeliveryDate: null }
      ]
    });
    
    console.log(`📋 Bookings missing trackingId: ${missingTrackingId}`);
    console.log(`📋 Bookings missing expectedDeliveryDate: ${missingExpectedDate}`);
    
    if (missingTrackingId === 0 && missingExpectedDate === 0) {
      console.log('✅ All bookings are now properly formatted');
    } else {
      console.log('❌ Some bookings still need fixing');
    }

  } catch (error) {
    console.error('❌ Error fixing bookings:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

fixExistingBookings();