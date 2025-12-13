const mongoose = require('mongoose');
const axios = require('axios');
require('dotenv').config();

const API_URL = process.env.API_URL || 'http://localhost:5050';

async function testDriverStatusUpdates() {
  try {
    console.log('🧪 Testing Driver Status Update Functionality');
    console.log('=' .repeat(50));

    // Connect to MongoDB to check data directly
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/morgen');
    console.log('📊 Connected to MongoDB');

    const Booking = require('../models/Booking');
    
    // Find a test booking with confirmed status
    let testBooking = await Booking.findOne({ 
      status: { $in: ['confirmed', 'order_processing', 'order_accepted'] },
      driverId: { $exists: true }
    });

    if (!testBooking) {
      console.log('❌ No suitable test booking found. Creating one...');
      
      // Create a test booking
      testBooking = new Booking({
        bookingId: `TEST-${Date.now()}`,
        trackingId: `TRK-${Date.now()}`,
        farmerId: 'TEST-FARMER',
        farmerName: 'Test Farmer',
        driverId: 'DRV001',
        vehicleId: new mongoose.Types.ObjectId(),
        vehicleType: 'Truck',
        priceOption: {
          capacity: '1 Ton',
          pricePerKm: 50,
          basePrice: 500,
          description: 'Test vehicle'
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
          district: 'Thrissur',
          city: 'Thrissur',
          pinCode: '680001',
          address: 'Test delivery address'
        },
        pickupDate: new Date(),
        pickupTime: '10:00',
        expectedDeliveryDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        distance: 45,
        totalAmount: 2250,
        finalAmount: 2264,
        status: 'order_processing',
        cargoDescription: 'Test cargo for status update testing'
      });

      await testBooking.save();
      console.log(`✅ Created test booking: ${testBooking.bookingId}`);
    }

    console.log(`📦 Using test booking: ${testBooking.bookingId}`);
    console.log(`📊 Current status: ${testBooking.status}`);
    console.log(`📋 Current tracking steps:`);
    testBooking.trackingSteps.forEach(step => {
      console.log(`   - ${step.step}: ${step.status}`);
    });

    // Test status updates in sequence
    const statusUpdates = [
      { step: 'pickup_started', location: 'Kochi Pickup Point', notes: 'Started pickup process' },
      { step: 'order_picked_up', location: 'Kochi Warehouse', notes: 'Order picked up successfully' },
      { step: 'in_transit', location: 'Highway EN Route', notes: 'In transit to destination' },
      { step: 'delivered', location: 'Thrissur Delivery Point', notes: 'Delivered successfully' }
    ];

    for (const update of statusUpdates) {
      console.log(`\n🔄 Testing status update: ${update.step}`);
      
      try {
        const response = await axios.patch(
          `${API_URL}/api/driver/bookings/${testBooking.bookingId}/update-status`,
          update
        );

        console.log(`✅ Status update successful: ${response.data.message}`);
        
        // Verify the update in database
        const updatedBooking = await Booking.findOne({ bookingId: testBooking.bookingId });
        console.log(`📊 New booking status: ${updatedBooking.status}`);
        
        const updatedStep = updatedBooking.trackingSteps.find(s => s.step === update.step);
        if (updatedStep && updatedStep.status === 'completed') {
          console.log(`✅ Tracking step updated correctly`);
        } else {
          console.log(`❌ Tracking step not updated correctly`);
        }

        // Wait a bit between updates
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.log(`❌ Status update failed: ${error.response?.data?.error || error.message}`);
        console.log(`   Error details:`, error.response?.data);
        break;
      }
    }

    // Final verification
    console.log('\n📊 Final Verification:');
    const finalBooking = await Booking.findOne({ bookingId: testBooking.bookingId });
    console.log(`📦 Final booking status: ${finalBooking.status}`);
    console.log(`📋 Final tracking steps:`);
    finalBooking.trackingSteps.forEach(step => {
      console.log(`   - ${step.step}: ${step.status} ${step.timestamp ? `(${step.timestamp.toISOString()})` : ''}`);
    });

    console.log('\n✅ Driver status update testing completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📊 Disconnected from MongoDB');
  }
}

// Run the test
testDriverStatusUpdates();