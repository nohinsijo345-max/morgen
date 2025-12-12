const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const User = require('../models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/farmconnect');

async function testOrderHistoryData() {
  try {
    console.log('🧪 Testing Order History Data...\n');

    // Find a farmer user
    const farmer = await User.findOne({ role: 'farmer' });
    if (!farmer) {
      console.log('❌ No farmer found in database');
      return;
    }

    console.log(`📋 Testing for farmer: ${farmer.name} (${farmer.farmerId})`);

    // Get bookings for this farmer
    const bookings = await Booking.find({ farmerId: farmer.farmerId })
      .populate('vehicleId')
      .sort({ createdAt: -1 });

    console.log(`📦 Found ${bookings.length} bookings for this farmer`);

    if (bookings.length > 0) {
      console.log('\n📋 Booking details:');
      bookings.forEach((booking, index) => {
        console.log(`\n${index + 1}. Booking ID: ${booking.bookingId}`);
        console.log(`   Status: ${booking.status}`);
        console.log(`   Tracking ID: ${booking.trackingId || 'N/A'}`);
        console.log(`   From: ${booking.fromLocation?.city || 'N/A'}, ${booking.fromLocation?.district || 'N/A'}`);
        console.log(`   To: ${booking.toLocation?.city || 'N/A'}, ${booking.toLocation?.district || 'N/A'}`);
        console.log(`   Amount: ₹${booking.finalAmount}`);
        console.log(`   Vehicle: ${booking.vehicleId?.name || 'N/A'}`);
        console.log(`   Created: ${booking.createdAt}`);
        console.log(`   Tracking Steps: ${booking.trackingSteps?.length || 0}`);
      });

      // Test the API endpoint structure
      console.log('\n🔍 API Response Structure Test:');
      const sampleBooking = bookings[0];
      console.log('Sample booking structure:');
      console.log({
        bookingId: sampleBooking.bookingId,
        status: sampleBooking.status,
        trackingId: sampleBooking.trackingId,
        fromLocation: sampleBooking.fromLocation,
        toLocation: sampleBooking.toLocation,
        finalAmount: sampleBooking.finalAmount,
        expectedDeliveryDate: sampleBooking.expectedDeliveryDate,
        vehicleId: sampleBooking.vehicleId ? {
          name: sampleBooking.vehicleId.name,
          type: sampleBooking.vehicleId.type
        } : null,
        trackingSteps: sampleBooking.trackingSteps?.length || 0,
        createdAt: sampleBooking.createdAt
      });

    } else {
      console.log('\n⚠️  No bookings found for this farmer');
      
      // Check if there are any bookings in the system
      const allBookings = await Booking.find();
      console.log(`📊 Total bookings in system: ${allBookings.length}`);
      
      if (allBookings.length > 0) {
        console.log('\n📋 Sample booking from system:');
        const sampleBooking = allBookings[0];
        console.log(`   Farmer ID: ${sampleBooking.farmerId}`);
        console.log(`   Booking ID: ${sampleBooking.bookingId}`);
        console.log(`   Status: ${sampleBooking.status}`);
      }
    }

    // Test all farmers
    console.log('\n👥 All farmers in system:');
    const allFarmers = await User.find({ role: 'farmer' });
    for (const f of allFarmers) {
      const farmerBookings = await Booking.countDocuments({ farmerId: f.farmerId });
      console.log(`   - ${f.name} (${f.farmerId}): ${farmerBookings} bookings`);
    }

    console.log('\n✅ Order history data test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    mongoose.connection.close();
  }
}

testOrderHistoryData();