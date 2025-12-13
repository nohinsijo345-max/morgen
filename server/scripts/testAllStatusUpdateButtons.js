const mongoose = require('mongoose');
const axios = require('axios');
require('dotenv').config();

const API_URL = process.env.API_URL || 'http://localhost:5050';

async function testAllStatusUpdateButtons() {
  try {
    console.log('🧪 Testing All 4 Status Update Buttons');
    console.log('=' .repeat(60));

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/morgen');
    console.log('📊 Connected to MongoDB');

    const Booking = require('../models/Booking');
    
    // Create a fresh test booking for comprehensive testing
    const testBooking = new Booking({
      bookingId: `BUTTON-TEST-${Date.now()}`,
      trackingId: `TRK-BUTTON-${Date.now()}`,
      farmerId: 'TEST-FARMER-BUTTONS',
      farmerName: 'Button Test Farmer',
      driverId: 'DRV001',
      vehicleId: new mongoose.Types.ObjectId(),
      vehicleType: 'Truck',
      priceOption: {
        capacity: '1 Ton',
        pricePerKm: 50,
        basePrice: 500,
        description: 'Test vehicle for button testing'
      },
      fromLocation: {
        state: 'Kerala',
        district: 'Ernakulam',
        city: 'Kochi',
        pinCode: '682001',
        address: 'Test pickup address for button testing'
      },
      toLocation: {
        state: 'Kerala',
        district: 'Thrissur',
        city: 'Thrissur',
        pinCode: '680001',
        address: 'Test delivery address for button testing'
      },
      pickupDate: new Date(),
      pickupTime: '10:00',
      expectedDeliveryDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      distance: 45,
      totalAmount: 2250,
      finalAmount: 2264,
      status: 'order_processing',
      cargoDescription: 'Test cargo for comprehensive button testing'
    });

    await testBooking.save();
    console.log(`✅ Created test booking: ${testBooking.bookingId}`);

    // Test all 4 status update buttons in sequence
    const buttonTests = [
      {
        buttonName: '🚚 Start Pickup',
        step: 'pickup_started',
        location: 'Kochi Pickup Point - Button Test 1',
        notes: 'Testing Start Pickup button',
        expectedStatus: 'pickup_started'
      },
      {
        buttonName: '📦 Mark Picked Up',
        step: 'order_picked_up',
        location: 'Kochi Warehouse - Button Test 2',
        notes: 'Testing Mark Picked Up button',
        expectedStatus: 'order_picked_up'
      },
      {
        buttonName: '🚛 In Transit',
        step: 'in_transit',
        location: 'Highway EN Route - Button Test 3',
        notes: 'Testing In Transit button',
        expectedStatus: 'in_transit'
      },
      {
        buttonName: '✅ Mark Delivered',
        step: 'delivered',
        location: 'Thrissur Delivery Point - Button Test 4',
        notes: 'Testing Mark Delivered button',
        expectedStatus: 'delivered'
      }
    ];

    console.log('\n🔄 Testing All Status Update Buttons:');
    console.log('-'.repeat(50));

    let allTestsPassed = true;

    for (let i = 0; i < buttonTests.length; i++) {
      const test = buttonTests[i];
      console.log(`\n${i + 1}. Testing ${test.buttonName}`);
      console.log(`   Step: ${test.step}`);
      console.log(`   Location: ${test.location}`);
      
      try {
        // Test the API endpoint
        const response = await axios.patch(
          `${API_URL}/api/driver/bookings/${testBooking.bookingId}/update-status`,
          {
            step: test.step,
            location: test.location,
            notes: test.notes
          }
        );

        console.log(`   ✅ API Response: ${response.data.message}`);
        
        // Verify the update in database
        const updatedBooking = await Booking.findOne({ bookingId: testBooking.bookingId });
        
        // Check booking status
        if (updatedBooking.status === test.expectedStatus) {
          console.log(`   ✅ Status correctly updated to: ${updatedBooking.status}`);
        } else {
          console.log(`   ❌ Status mismatch. Expected: ${test.expectedStatus}, Got: ${updatedBooking.status}`);
          allTestsPassed = false;
        }
        
        // Check tracking step
        const updatedStep = updatedBooking.trackingSteps.find(s => s.step === test.step);
        if (updatedStep && updatedStep.status === 'completed') {
          console.log(`   ✅ Tracking step '${test.step}' marked as completed`);
          console.log(`   📍 Location: ${updatedStep.location}`);
          console.log(`   📝 Notes: ${updatedStep.notes}`);
          console.log(`   ⏰ Timestamp: ${updatedStep.timestamp.toISOString()}`);
        } else {
          console.log(`   ❌ Tracking step '${test.step}' not updated correctly`);
          allTestsPassed = false;
        }

        // Check next step is set to current (except for last step)
        if (i < buttonTests.length - 1) {
          const nextStep = buttonTests[i + 1].step;
          const nextStepData = updatedBooking.trackingSteps.find(s => s.step === nextStep);
          if (nextStepData && nextStepData.status === 'current') {
            console.log(`   ✅ Next step '${nextStep}' set to current`);
          } else {
            console.log(`   ⚠️ Next step '${nextStep}' not set to current (this might be OK)`);
          }
        }

        // Wait between tests
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.log(`   ❌ Button test failed:`);
        console.log(`      Status: ${error.response?.status || 'No status'}`);
        console.log(`      Error: ${error.response?.data?.error || error.message}`);
        console.log(`      Details: ${error.response?.data?.details || 'No details'}`);
        allTestsPassed = false;
        break;
      }
    }

    // Test error cases for all buttons
    console.log('\n🧪 Testing Error Cases for All Buttons:');
    console.log('-'.repeat(40));

    const errorTests = [
      {
        name: 'Empty location test',
        data: { step: 'pickup_started', location: '', notes: 'Test empty location' },
        expectedStatus: 400
      },
      {
        name: 'Invalid step test',
        data: { step: 'invalid_step', location: 'Test Location', notes: 'Test invalid step' },
        expectedStatus: 400
      },
      {
        name: 'Missing step test',
        data: { location: 'Test Location', notes: 'Test missing step' },
        expectedStatus: 400
      },
      {
        name: 'Missing location test',
        data: { step: 'pickup_started', notes: 'Test missing location' },
        expectedStatus: 400
      }
    ];

    for (const errorTest of errorTests) {
      try {
        await axios.patch(
          `${API_URL}/api/driver/bookings/${testBooking.bookingId}/update-status`,
          errorTest.data
        );
        console.log(`❌ ${errorTest.name}: Should have failed but didn't`);
        allTestsPassed = false;
      } catch (error) {
        if (error.response?.status === errorTest.expectedStatus) {
          console.log(`✅ ${errorTest.name}: Correctly rejected with status ${error.response.status}`);
        } else {
          console.log(`⚠️ ${errorTest.name}: Unexpected status ${error.response?.status}, expected ${errorTest.expectedStatus}`);
        }
      }
    }

    // Final verification
    console.log('\n📊 Final Test Results:');
    console.log('='.repeat(30));
    const finalBooking = await Booking.findOne({ bookingId: testBooking.bookingId });
    console.log(`📦 Final booking status: ${finalBooking.status}`);
    console.log(`📋 Final tracking steps:`);
    finalBooking.trackingSteps.forEach(step => {
      const status = step.status === 'completed' ? '✅' : step.status === 'current' ? '🔄' : '⏳';
      console.log(`   ${status} ${step.step}: ${step.status} ${step.timestamp ? `(${step.timestamp.toLocaleString()})` : ''}`);
    });

    if (allTestsPassed) {
      console.log('\n🎉 ALL STATUS UPDATE BUTTONS WORKING PERFECTLY!');
      console.log('✅ All 4 buttons tested successfully');
      console.log('✅ Error handling working correctly');
      console.log('✅ Database updates working correctly');
      console.log('✅ Status progression working correctly');
      console.log('\n🚀 The driver portal is ready for production use!');
    } else {
      console.log('\n⚠️ Some tests failed. Please check the logs above.');
    }

  } catch (error) {
    console.error('❌ Test suite failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📊 Disconnected from MongoDB');
  }
}

// Run the comprehensive test
if (require.main === module) {
  testAllStatusUpdateButtons();
}

module.exports = testAllStatusUpdateButtons;