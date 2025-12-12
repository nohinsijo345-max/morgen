const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const User = require('../models/User');
const Driver = require('../models/Driver');

async function testOrderHistoryAndCancellations() {
  try {
    await mongoose.connect('mongodb://localhost:27017/farmconnect');
    console.log('Connected to MongoDB');

    console.log('\n=== TESTING ORDER HISTORY DATA STRUCTURE ===');
    
    // Check if we have any users
    const users = await User.find({}, 'name farmerId email phone state district city pinCode').limit(3);
    console.log('Sample users in database:');
    users.forEach(user => {
      console.log(`- ${user.name} (${user.farmerId}): ${user.email}, ${user.phone}`);
      console.log(`  Location: ${user.city}, ${user.district}, ${user.state} - ${user.pinCode}`);
    });

    // Check if we have any bookings
    const bookings = await Booking.find({}).populate('vehicleId').limit(5);
    console.log(`\nTotal bookings in database: ${bookings.length}`);
    
    if (bookings.length > 0) {
      console.log('Sample bookings:');
      bookings.forEach(booking => {
        console.log(`- ${booking.bookingId}: ${booking.farmerName} (${booking.farmerId})`);
        console.log(`  Status: ${booking.status}, Amount: ₹${booking.finalAmount}`);
        console.log(`  From: ${booking.fromLocation?.city} → To: ${booking.toLocation?.city}`);
        if (booking.cancellationRequest) {
          console.log(`  Cancellation: ${booking.cancellationRequest.status} (${booking.cancellationRequest.reason})`);
        }
      });
    }

    console.log('\n=== TESTING CANCELLATION REQUESTS ===');
    
    // Find bookings with cancellation requests
    const cancellationRequests = await Booking.find({
      status: 'cancellation_requested',
      'cancellationRequest.status': 'pending'
    }).populate('vehicleId');
    
    console.log(`Pending cancellation requests: ${cancellationRequests.length}`);
    cancellationRequests.forEach(booking => {
      console.log(`- ${booking.bookingId}: ${booking.farmerName}`);
      console.log(`  Reason: ${booking.cancellationRequest.reason}`);
      console.log(`  Requested: ${booking.cancellationRequest.requestedAt}`);
      console.log(`  Driver: ${booking.driverId || 'Not assigned'}`);
    });

    console.log('\n=== TESTING DRIVER ENDPOINTS ===');
    
    // Check if we have drivers
    const drivers = await Driver.find({}, 'name driverId email phone').limit(3);
    console.log(`Total drivers: ${drivers.length}`);
    drivers.forEach(driver => {
      console.log(`- ${driver.name} (${driver.driverId}): ${driver.email}`);
    });

    if (drivers.length > 0) {
      const testDriver = drivers[0];
      console.log(`\nTesting with driver: ${testDriver.driverId}`);
      
      // Find bookings for this driver
      const driverBookings = await Booking.find({ driverId: testDriver.driverId });
      console.log(`Bookings for ${testDriver.driverId}: ${driverBookings.length}`);
      
      // Find cancellation requests for this driver
      const driverCancellations = await Booking.find({
        driverId: testDriver.driverId,
        status: 'cancellation_requested',
        'cancellationRequest.status': 'pending'
      });
      console.log(`Cancellation requests for ${testDriver.driverId}: ${driverCancellations.length}`);
    }

    console.log('\n=== TESTING LOGIN DATA STRUCTURE ===');
    
    // Simulate what login API returns
    if (users.length > 0) {
      const testUser = users[0];
      const loginResponse = {
        role: testUser.role,
        name: testUser.name,
        farmerId: testUser.farmerId,
        email: testUser.email,
        phone: testUser.phone,
        state: testUser.state,
        district: testUser.district,
        city: testUser.city,
        pinCode: testUser.pinCode,
        panchayat: testUser.panchayat,
        landSize: testUser.landSize,
        cropTypes: testUser.cropTypes || []
      };
      
      console.log('Login API response structure:');
      console.log(JSON.stringify(loginResponse, null, 2));
      
      // Test Order History API call simulation
      console.log(`\nTesting Order History for farmerId: ${testUser.farmerId}`);
      const farmerBookings = await Booking.find({ farmerId: testUser.farmerId })
        .populate('vehicleId')
        .sort({ createdAt: -1 });
      
      console.log(`Found ${farmerBookings.length} bookings for this farmer`);
      farmerBookings.forEach(booking => {
        console.log(`- ${booking.bookingId}: ${booking.status} (₹${booking.finalAmount})`);
      });
    }

  } catch (error) {
    console.error('Test error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

testOrderHistoryAndCancellations();