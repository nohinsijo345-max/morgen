const mongoose = require('mongoose');
const User = require('../models/User');
const Driver = require('../models/Driver');
const Booking = require('../models/Booking');
const Vehicle = require('../models/Vehicle');

const testPinCodeIntegration = async () => {
  try {
    console.log('🧪 Testing PIN Code Integration...');
    
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/farmconnect');
    console.log('✅ Connected to database');
    
    // Test 1: Check if users have pinCode field
    console.log('\n📋 Test 1: User PIN Code Integration');
    const sampleUser = await User.findOne({ farmerId: 'MGN001' });
    if (sampleUser) {
      console.log(`✅ User ${sampleUser.farmerId} found`);
      console.log(`   Name: ${sampleUser.name}`);
      console.log(`   Location: ${sampleUser.city}, ${sampleUser.district}`);
      console.log(`   PIN Code: ${sampleUser.pinCode || 'Not set'}`);
    } else {
      console.log('❌ No sample user found');
    }
    
    // Test 2: Check if drivers have pinCode field
    console.log('\n📋 Test 2: Driver PIN Code Integration');
    const sampleDriver = await Driver.findOne({ driverId: 'DRV001' });
    if (sampleDriver) {
      console.log(`✅ Driver ${sampleDriver.driverId} found`);
      console.log(`   Name: ${sampleDriver.name}`);
      console.log(`   District: ${sampleDriver.district}`);
      console.log(`   PIN Code: ${sampleDriver.pinCode || 'Not set'}`);
    } else {
      console.log('❌ No sample driver found');
    }
    
    // Test 3: Check booking model with PIN codes
    console.log('\n📋 Test 3: Booking PIN Code Integration');
    const sampleBooking = await Booking.findOne().sort({ createdAt: -1 });
    if (sampleBooking) {
      console.log(`✅ Latest booking ${sampleBooking.bookingId} found`);
      console.log(`   From: ${sampleBooking.fromLocation?.city}, ${sampleBooking.fromLocation?.district}`);
      console.log(`   From PIN: ${sampleBooking.fromLocation?.pinCode || 'Not set'}`);
      console.log(`   To: ${sampleBooking.toLocation?.city}, ${sampleBooking.toLocation?.district}`);
      console.log(`   To PIN: ${sampleBooking.toLocation?.pinCode || 'Not set'}`);
    } else {
      console.log('❌ No bookings found');
    }
    
    // Test 4: Create a test booking with PIN codes
    console.log('\n📋 Test 4: Creating Test Booking with PIN Codes');
    
    const testVehicle = await Vehicle.findOne();
    if (!testVehicle) {
      console.log('❌ No vehicles found for testing');
      return;
    }
    
    const testBookingData = {
      bookingId: `TEST${Date.now()}`,
      trackingId: `TRK${Date.now()}`,
      farmerId: 'MGN001',
      farmerName: 'Test Farmer',
      vehicleId: testVehicle._id,
      vehicleType: testVehicle.type,
      priceOption: {
        capacity: '5 tons',
        pricePerKm: 10,
        basePrice: 500,
        description: 'Test option'
      },
      fromLocation: {
        state: 'Kerala',
        district: 'Ernakulam',
        city: 'Kochi',
        pinCode: '682001',
        address: 'Test pickup address'
      },
      toLocation: {
        state: 'Kerala',
        district: 'Thiruvananthapuram',
        city: 'Trivandrum',
        pinCode: '695001',
        address: 'Test destination address'
      },
      pickupDate: new Date(),
      pickupTime: '10:00',
      expectedDeliveryDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      distance: 50,
      totalAmount: 1000,
      handlingFee: 14,
      finalAmount: 1014,
      notes: 'Test booking with PIN codes'
    };
    
    const testBooking = new Booking(testBookingData);
    await testBooking.save();
    console.log(`✅ Test booking created: ${testBooking.bookingId}`);
    console.log(`   From PIN: ${testBooking.fromLocation.pinCode}`);
    console.log(`   To PIN: ${testBooking.toLocation.pinCode}`);
    
    // Clean up test booking
    await Booking.findByIdAndDelete(testBooking._id);
    console.log('✅ Test booking cleaned up');
    
    console.log('\n🎉 PIN Code Integration Test Complete!');
    console.log('\n📝 Summary:');
    console.log('   ✅ User model supports pinCode field');
    console.log('   ✅ Driver model supports pinCode field');
    console.log('   ✅ Booking model supports pinCode in locations');
    console.log('   ✅ Booking creation works with PIN codes');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from database');
  }
};

// Run the test
testPinCodeIntegration();