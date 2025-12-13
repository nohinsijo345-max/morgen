const mongoose = require('mongoose');
require('dotenv').config();

async function clearAllBookingHistory() {
  try {
    console.log('🗑️ Clearing All Booking History');
    console.log('=' .repeat(60));

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/morgen');
    console.log('📊 Connected to MongoDB');

    const Booking = require('../models/Booking');
    
    // Get count before deletion
    const totalBookings = await Booking.countDocuments({});
    console.log(`📦 Found ${totalBookings} bookings to delete`);
    
    if (totalBookings === 0) {
      console.log('✅ No bookings found - database is already clean');
      return;
    }
    
    // Confirm deletion
    console.log('⚠️ WARNING: This will permanently delete ALL booking history!');
    console.log('🔄 Proceeding with deletion...');
    
    // Delete all bookings
    const result = await Booking.deleteMany({});
    console.log(`✅ Successfully deleted ${result.deletedCount} bookings`);
    
    // Verify deletion
    const remainingBookings = await Booking.countDocuments({});
    if (remainingBookings === 0) {
      console.log('✅ All booking history cleared successfully!');
    } else {
      console.log(`⚠️ Warning: ${remainingBookings} bookings still remain`);
    }
    
    console.log('\n🎉 Database cleanup completed!');
    console.log('📊 Booking collection is now empty and ready for fresh data');

  } catch (error) {
    console.error('❌ Failed to clear booking history:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📊 Disconnected from MongoDB');
  }
}

// Run the cleanup
if (require.main === module) {
  clearAllBookingHistory();
}

module.exports = clearAllBookingHistory;