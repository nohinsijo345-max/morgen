const mongoose = require('mongoose');

async function ensureBookingIntegrity() {
  try {
    console.log('🔍 Checking booking integrity...');
    
    const Booking = require('../models/Booking');
    
    // Quick check for problematic bookings
    const problematicCount = await Booking.countDocuments({
      $or: [
        { trackingSteps: { $exists: false } },
        { trackingSteps: { $size: 0 } },
        { 'fromLocation.city': { $exists: false } },
        { 'toLocation.city': { $exists: false } }
      ]
    });
    
    if (problematicCount > 0) {
      console.log(`⚠️ Found ${problematicCount} bookings that need fixing`);
      console.log('🔧 Running automatic fix...');
      
      // Run the fix
      const fixAllBookings = require('./fixAllBookingsForStatusUpdates');
      await fixAllBookings();
      
      console.log('✅ Booking integrity check completed');
    } else {
      console.log('✅ All bookings are properly structured');
    }
    
  } catch (error) {
    console.error('❌ Booking integrity check failed:', error);
    // Don't crash the server, just log the error
  }
}

module.exports = ensureBookingIntegrity;