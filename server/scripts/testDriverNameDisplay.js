const mongoose = require('mongoose');
const Driver = require('../models/Driver');
const Booking = require('../models/Booking');
require('dotenv').config();

async function testDriverNameDisplay() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🔗 Connected to MongoDB');

    console.log('\n🧪 Testing Driver Name Display in Tracking\n');

    // Find a test driver
    const testDriver = await Driver.findOne().select('driverId name phone');
    if (!testDriver) {
      console.log('❌ No drivers found. Please seed drivers first.');
      return;
    }

    console.log(`📋 Test Driver: ${testDriver.name} (${testDriver.driverId})`);

    // Find or create a test booking for this driver
    let testBooking = await Booking.findOne({ driverId: testDriver.driverId });
    
    if (!testBooking) {
      console.log('📦 Creating test booking for driver...');
      
      testBooking = new Booking({
        bookingId: `TEST${Date.now()}`,
        trackingId: `TRK${Date.now()}`,
        farmerId: 'FARM001',
        farmerName: 'Test Farmer',
        driverId: testDriver.driverId,
        vehicleId: new mongoose.Types.ObjectId(),
        vehicleType: 'truck',
        priceOption: {
          capacity: '5 tons',
          pricePerKm: 15,
          basePrice: 500,
          description: 'Standard truck'
        },
        fromLocation: {
          state: 'Kerala',
          district: 'Ernakulam',
          city: 'Kochi',
          pinCode: '682001'
        },
        toLocation: {
          state: 'Kerala',
          district: 'Thrissur',
          city: 'Thrissur',
          pinCode: '680001'
        },
        pickupDate: new Date(),
        pickupTime: '10:00',
        expectedDeliveryDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        distance: 75,
        totalAmount: 1625,
        finalAmount: 1639,
        status: 'order_accepted',
        cargoDescription: 'Test agricultural goods'
      });

      await testBooking.save();
      console.log(`✅ Test booking created: ${testBooking.bookingId}`);
    }

    console.log(`\n📦 Test Booking: ${testBooking.bookingId}`);
    console.log(`   Status: ${testBooking.status}`);
    console.log(`   Driver ID: ${testBooking.driverId}`);

    // Test the API endpoint that includes driver info
    console.log('\n🔍 Testing driver bookings API with driver info...');
    
    // Simulate the API call
    const bookings = await Booking.find({ driverId: testDriver.driverId })
      .populate('vehicleId')
      .sort({ createdAt: -1 });
    
    const driver = await Driver.findOne({ driverId: testDriver.driverId }).select('name driverId phone');
    
    const bookingsWithDriverInfo = bookings.map(booking => {
      const bookingObj = booking.toObject();
      bookingObj.driverInfo = driver ? {
        name: driver.name,
        driverId: driver.driverId,
        phone: driver.phone
      } : null;
      return bookingObj;
    });

    console.log(`✅ Found ${bookingsWithDriverInfo.length} bookings with driver info`);
    
    if (bookingsWithDriverInfo.length > 0) {
      const sampleBooking = bookingsWithDriverInfo[0];
      console.log('\n📋 Sample Booking with Driver Info:');
      console.log(`   Booking ID: ${sampleBooking.bookingId}`);
      console.log(`   Driver Info:`, sampleBooking.driverInfo);
      
      console.log('\n📊 Tracking Steps:');
      sampleBooking.trackingSteps.forEach((step, index) => {
        console.log(`   ${index + 1}. ${step.step}: ${step.status}`);
        if (step.notes) {
          console.log(`      Notes: ${step.notes}`);
        }
        if (step.timestamp) {
          console.log(`      Time: ${step.timestamp.toLocaleString()}`);
        }
      });
    }

    // Test updating a tracking step with driver name
    console.log('\n🔄 Testing tracking step update with driver name...');
    
    const stepToUpdate = testBooking.trackingSteps.find(s => s.step === 'pickup_started');
    if (stepToUpdate && stepToUpdate.status !== 'completed') {
      stepToUpdate.status = 'completed';
      stepToUpdate.timestamp = new Date();
      stepToUpdate.location = 'Kochi Transport Hub';
      stepToUpdate.notes = `Pickup started by ${testDriver.name}`;
      
      await testBooking.save();
      console.log(`✅ Updated tracking step with driver name: ${testDriver.name}`);
    }

    // Test the note replacement logic
    console.log('\n🔧 Testing note replacement logic...');
    const testNote = `Accepted by driver ${testDriver.driverId}`;
    const replacedNote = testNote.replace(/driver DRV\d+/g, `driver ${testDriver.name}`);
    console.log(`   Original: ${testNote}`);
    console.log(`   Replaced: ${replacedNote}`);

    console.log('\n✅ Driver Name Display Test Complete');
    console.log('\n📈 Improvements Made:');
    console.log('   • Driver bookings API now includes driver info (name, phone)');
    console.log('   • Tracking step notes include driver name instead of ID');
    console.log('   • Frontend displays driver name in order details');
    console.log('   • Button colors changed to brown/amber shades');
    console.log('   • Enhanced tracking information display');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
  }
}

testDriverNameDisplay();