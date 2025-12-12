const mongoose = require('mongoose');
const Booking = require('../models/Booking');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/morgen', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function fixCargoDescriptions() {
  try {
    console.log('🔍 Checking bookings for missing cargo descriptions...');
    
    // Find bookings without cargoDescription
    const bookingsWithoutCargo = await Booking.find({
      $or: [
        { cargoDescription: { $exists: false } },
        { cargoDescription: null },
        { cargoDescription: '' }
      ]
    });

    console.log(`📦 Found ${bookingsWithoutCargo.length} bookings without cargo description`);

    if (bookingsWithoutCargo.length > 0) {
      // Update bookings with a default cargo description
      const updateResult = await Booking.updateMany(
        {
          $or: [
            { cargoDescription: { $exists: false } },
            { cargoDescription: null },
            { cargoDescription: '' }
          ]
        },
        {
          $set: { cargoDescription: 'Agricultural products (description not provided)' }
        }
      );

      console.log(`✅ Updated ${updateResult.modifiedCount} bookings with default cargo description`);
    }

    // Verify all bookings now have cargo descriptions
    const allBookings = await Booking.find({}).select('bookingId cargoDescription');
    console.log('\n📋 Current cargo descriptions:');
    
    allBookings.forEach(booking => {
      console.log(`${booking.bookingId}: ${booking.cargoDescription || 'MISSING'}`);
    });

    console.log('\n✅ Cargo description fix completed!');
    
  } catch (error) {
    console.error('❌ Error fixing cargo descriptions:', error);
  } finally {
    mongoose.connection.close();
  }
}

fixCargoDescriptions();