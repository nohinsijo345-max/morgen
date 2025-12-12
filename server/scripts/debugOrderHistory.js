const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const User = require('../models/User');

async function debugOrderHistory() {
  try {
    await mongoose.connect('mongodb://localhost:27017/farmconnect');
    console.log('Connected to MongoDB');

    // Check all users and their farmerIds
    console.log('\n=== ALL USERS ===');
    const users = await User.find({}, 'name farmerId email');
    users.forEach(user => {
      console.log(`User: ${user.name}, FarmerId: ${user.farmerId}, Email: ${user.email}`);
    });

    // Check all bookings
    console.log('\n=== ALL BOOKINGS ===');
    const bookings = await Booking.find({}).populate('vehicleId');
    console.log(`Total bookings found: ${bookings.length}`);
    
    bookings.forEach(booking => {
      console.log(`Booking ID: ${booking.bookingId}, Farmer ID: ${booking.farmerId}, Farmer Name: ${booking.farmerName}`);
      console.log(`  From: ${booking.fromLocation?.city}, ${booking.fromLocation?.district}`);
      console.log(`  To: ${booking.toLocation?.city}, ${booking.toLocation?.district}`);
      console.log(`  Status: ${booking.status}, Amount: ₹${booking.finalAmount}`);
      console.log(`  Created: ${booking.createdAt}`);
      console.log('---');
    });

    // Test specific farmer lookup
    console.log('\n=== TESTING FARMER LOOKUP ===');
    const testFarmerId = 'F001'; // Common test farmer ID
    console.log(`Looking for bookings with farmerId: ${testFarmerId}`);
    
    const farmerBookings = await Booking.find({ farmerId: testFarmerId }).populate('vehicleId');
    console.log(`Found ${farmerBookings.length} bookings for farmer ${testFarmerId}`);
    
    farmerBookings.forEach(booking => {
      console.log(`  - ${booking.bookingId}: ${booking.farmerName} (${booking.status})`);
    });

    // Check localStorage simulation
    console.log('\n=== SIMULATING FRONTEND CALL ===');
    const mockUser = users.find(u => u.farmerId === testFarmerId);
    if (mockUser) {
      console.log(`Mock localStorage user:`, {
        farmerId: mockUser.farmerId,
        name: mockUser.name,
        email: mockUser.email
      });
      
      // This is what the frontend should be doing
      const apiBookings = await Booking.find({ farmerId: mockUser.farmerId })
        .populate('vehicleId')
        .sort({ createdAt: -1 });
      
      console.log(`API would return ${apiBookings.length} bookings`);
    } else {
      console.log('No user found with farmerId F001');
    }

  } catch (error) {
    console.error('Debug error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

debugOrderHistory();