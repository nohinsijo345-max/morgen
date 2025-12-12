const mongoose = require('mongoose');
const Booking = require('../models/Booking');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/farmconnect');

async function checkExistingBookings() {
  try {
    console.log('🔍 Checking existing bookings...\n');

    const bookings = await Booking.find({}).limit(5).sort({ createdAt: -1 });
    
    if (bookings.length === 0) {
      console.log('❌ No bookings found in database');
    } else {
      console.log(`📦 Found ${bookings.length} recent bookings:`);
      bookings.forEach((booking, index) => {
        console.log(`${index + 1}. ${booking.bookingId}`);
        console.log(`   Status: ${booking.status}`);
        console.log(`   Driver: ${booking.driverId || 'Not assigned'}`);
        console.log(`   Farmer: ${booking.farmerName}`);
        console.log(`   Created: ${booking.createdAt}`);
        console.log('');
      });
    }

    // Look for confirmed bookings with drivers
    const confirmedBookings = await Booking.find({ 
      status: 'confirmed',
      driverId: { $exists: true, $ne: null }
    });

    console.log(`🎯 Found ${confirmedBookings.length} confirmed bookings with drivers assigned:`);
    confirmedBookings.forEach((booking, index) => {
      console.log(`${index + 1}. ${booking.bookingId} - Driver: ${booking.driverId}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

checkExistingBookings();