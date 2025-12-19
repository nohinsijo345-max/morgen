const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const User = require('../models/User');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/morgen', {});

async function debugOrderTracking() {
  try {
    console.log('🔍 Debugging Order Tracking Issues...\n');

    // 1. Check total bookings in database
    const totalBookings = await Booking.countDocuments();
    console.log(`📊 Total bookings in database: ${totalBookings}`);

    if (totalBookings === 0) {
      console.log('❌ No bookings found in database');
      return;
    }

    // 2. Get all bookings with details
    const allBookings = await Booking.find().populate('vehicleId').sort({ createdAt: -1 });
    console.log('\n📋 All bookings:');
    allBookings.forEach((booking, index) => {
      console.log(`${index + 1}. Booking ID: ${booking.bookingId}`);
      console.log(`   Farmer ID: ${booking.farmerId}`);
      console.log(`   Farmer Name: ${booking.farmerName}`);
      console.log(`   Status: ${booking.status}`);
      console.log(`   Created: ${booking.createdAt}`);
      console.log(`   From: ${booking.fromLocation?.city}, ${booking.fromLocation?.district}`);
      console.log(`   To: ${booking.toLocation?.city}, ${booking.toLocation?.district}`);
      console.log('   ---');
    });

    // 3. Check farmers in database
    const farmers = await User.find({ role: 'farmer' });
    console.log(`\n👨‍🌾 Total farmers in database: ${farmers.length}`);
    
    if (farmers.length > 0) {
      console.log('\n👨‍🌾 Farmers:');
      farmers.forEach((farmer, index) => {
        console.log(`${index + 1}. Farmer ID: ${farmer.farmerId}`);
        console.log(`   Name: ${farmer.name}`);
        console.log(`   Email: ${farmer.email}`);
        console.log('   ---');
      });

      // 4. Test fetching bookings for each farmer
      console.log('\n🔍 Testing bookings for each farmer:');
      for (const farmer of farmers) {
        const farmerBookings = await Booking.find({ farmerId: farmer.farmerId })
          .populate('vehicleId')
          .sort({ createdAt: -1 });
        
        console.log(`Farmer ${farmer.name} (${farmer.farmerId}): ${farmerBookings.length} bookings`);
        
        if (farmerBookings.length > 0) {
          farmerBookings.forEach((booking, index) => {
            console.log(`  ${index + 1}. ${booking.bookingId} - ${booking.status}`);
          });
        }
      }
    }

    // 5. Check for any data inconsistencies
    console.log('\n🔍 Checking for data inconsistencies:');
    const bookingsWithoutFarmerId = await Booking.find({ 
      $or: [
        { farmerId: { $exists: false } },
        { farmerId: null },
        { farmerId: '' }
      ]
    });
    
    if (bookingsWithoutFarmerId.length > 0) {
      console.log(`❌ Found ${bookingsWithoutFarmerId.length} bookings without farmerId`);
      bookingsWithoutFarmerId.forEach((booking, index) => {
        console.log(`  ${index + 1}. Booking ID: ${booking.bookingId} - Missing farmerId`);
      });
    } else {
      console.log('✅ All bookings have farmerId');
    }

    // 6. Check for session data format issues
    console.log('\n🔍 Checking farmerId formats:');
    const uniqueFarmerIds = await Booking.distinct('farmerId');
    console.log('Unique farmer IDs in bookings:', uniqueFarmerIds);
    
    const uniqueUserFarmerIds = await User.distinct('farmerId', { role: 'farmer' });
    console.log('Unique farmer IDs in users:', uniqueUserFarmerIds);

    // Check for mismatches
    const mismatches = uniqueFarmerIds.filter(id => !uniqueUserFarmerIds.includes(id));
    if (mismatches.length > 0) {
      console.log('❌ Farmer ID mismatches found:', mismatches);
    } else {
      console.log('✅ All booking farmer IDs match user farmer IDs');
    }

  } catch (error) {
    console.error('❌ Error debugging order tracking:', error);
  } finally {
    mongoose.connection.close();
  }
}

debugOrderTracking();