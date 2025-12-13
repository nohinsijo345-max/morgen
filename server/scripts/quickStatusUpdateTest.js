const mongoose = require('mongoose');
const axios = require('axios');
require('dotenv').config();

const API_URL = process.env.API_URL || 'http://localhost:5050';

async function quickStatusUpdateTest() {
  try {
    console.log('🧪 Quick Status Update Test');
    console.log('=' .repeat(40));

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/morgen');
    console.log('📊 Connected to MongoDB');

    const Booking = require('../models/Booking');
    
    // Find any booking with a driver assigned
    const testBooking = await Booking.findOne({ 
      driverId: { $exists: true, $ne: null },
      status: { $in: ['order_processing', 'order_accepted', 'pickup_started', 'order_picked_up', 'in_transit'] }
    });

    if (!testBooking) {
      console.log('❌ No suitable booking found for testing');
      console.log('Creating a test booking...');
      
      // Create a simple test booking
      const newBooking = new Booking({
        bookingId: `QUICK-TEST-${Date.now()}`,
        trackingId: `TRK-QUICK-${Date.now()}`,
        farmerId: 'TEST-FARMER',
        farmerName: 'Quick Test Farmer',
        driverId: 'DRV001',
        vehicleId: new mongoose.Types.ObjectId(),
        vehicleType: 'Truck',
        fromLocation: { city: 'Test City', district: 'Test District', state: 'Test State' },
        toLocation: { city: 'Test Destination', district: 'Test District', state: 'Test State' },
        pickupDate: new Date(),
        pickupTime: '10:00',
        expectedDeliveryDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        distance: 50,
        totalAmount: 1000,
        finalAmount: 1014,
        status: 'order_processing',
        cargoDescription: 'Quick test cargo'
      });
      
      await newBooking.save();
      console.log(`✅ Created test booking: ${newBooking.bookingId}`);
      
      // Test the status update
      console.log('\n🔄 Testing status update...');
      const response = await axios.patch(
        `${API_URL}/api/driver/bookings/${newBooking.bookingId}/update-status`,
        {
          step: 'pickup_started',
          location: 'Quick Test Location',
          notes: 'Quick test pickup started'
        }
      );
      
      console.log('✅ Status update successful!');
      console.log('Response:', response.data.message);
      
      // Verify in database
      const updatedBooking = await Booking.findOne({ bookingId: newBooking.bookingId });
      console.log(`📊 Updated status: ${updatedBooking.status}`);
      
    } else {
      console.log(`📦 Using existing booking: ${testBooking.bookingId}`);
      console.log(`📊 Current status: ${testBooking.status}`);
      
      // Determine next valid step
      let nextStep = 'pickup_started';
      if (testBooking.status === 'pickup_started') nextStep = 'order_picked_up';
      else if (testBooking.status === 'order_picked_up') nextStep = 'in_transit';
      else if (testBooking.status === 'in_transit') nextStep = 'delivered';
      
      console.log(`🔄 Testing next step: ${nextStep}`);
      
      try {
        const response = await axios.patch(
          `${API_URL}/api/driver/bookings/${testBooking.bookingId}/update-status`,
          {
            step: nextStep,
            location: 'Quick Test Location',
            notes: `Quick test ${nextStep}`
          }
        );
        
        console.log('✅ Status update successful!');
        console.log('Response:', response.data.message);
        
      } catch (error) {
        console.log('❌ Status update failed:');
        console.log(`   Status: ${error.response?.status}`);
        console.log(`   Error: ${error.response?.data?.error}`);
        console.log(`   Details: ${error.response?.data?.details}`);
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  } finally {
    await mongoose.disconnect();
    console.log('📊 Disconnected from MongoDB');
  }
}

// Run the quick test
quickStatusUpdateTest();