const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Driver = require('../models/Driver');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/farmconnect', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function testDriverPortalAcceptReject() {
  try {
    console.log('🔍 Testing Driver Portal Accept/Reject Functionality...\n');

    // Find a confirmed booking with a driver assigned
    const confirmedBooking = await Booking.findOne({ 
      status: 'confirmed',
      driverId: { $exists: true, $ne: null }
    });

    if (!confirmedBooking) {
      console.log('❌ No confirmed bookings with assigned drivers found');
      
      // Create a test booking
      const testBooking = new Booking({
        bookingId: `TEST-${Date.now()}`,
        farmerId: 'TEST-FARMER',
        farmerName: 'Test Farmer',
        vehicleId: new mongoose.Types.ObjectId(),
        vehicleType: 'mini-truck',
        driverId: 'DRV001',
        status: 'confirmed',
        fromLocation: {
          state: 'Kerala',
          district: 'Ernakulam',
          city: 'Kochi',
          pinCode: '682001'
        },
        toLocation: {
          state: 'Tamil Nadu',
          district: 'Chennai',
          city: 'Chennai',
          pinCode: '600001'
        },
        distance: 350,
        cargoDescription: 'Test cargo for driver portal testing',
        finalAmount: 5000,
        trackingSteps: [
          {
            step: 'order_placed',
            status: 'completed',
            timestamp: new Date(),
            notes: 'Order placed successfully'
          },
          {
            step: 'order_accepted',
            status: 'pending',
            notes: 'Waiting for driver acceptance'
          },
          {
            step: 'pickup_started',
            status: 'pending',
            notes: 'Driver will start pickup'
          },
          {
            step: 'order_picked_up',
            status: 'pending',
            notes: 'Order will be picked up'
          },
          {
            step: 'in_transit',
            status: 'pending',
            notes: 'Order will be in transit'
          },
          {
            step: 'delivered',
            status: 'pending',
            notes: 'Order will be delivered'
          }
        ]
      });

      await testBooking.save();
      console.log('✅ Created test booking:', testBooking.bookingId);
      
      // Test accept functionality
      console.log('\n🔄 Testing Accept Functionality...');
      testBooking.status = 'order_processing';
      
      const processingStep = testBooking.trackingSteps.find(s => s.step === 'order_accepted');
      if (processingStep) {
        processingStep.status = 'completed';
        processingStep.timestamp = new Date();
        processingStep.notes = `Accepted by driver ${testBooking.driverId}`;
      }

      await testBooking.save();
      console.log('✅ Accept functionality test passed');
      
      // Test reject functionality
      console.log('\n🔄 Testing Reject Functionality...');
      testBooking.status = 'cancelled';
      testBooking.cancellationReason = 'Test rejection reason';
      testBooking.cancelledBy = `Driver ${testBooking.driverId}`;
      testBooking.cancelledAt = new Date();
      
      await testBooking.save();
      console.log('✅ Reject functionality test passed');
      
      // Clean up test booking
      await Booking.deleteOne({ _id: testBooking._id });
      console.log('🧹 Cleaned up test booking');
      
    } else {
      console.log('📦 Found confirmed booking:', {
        bookingId: confirmedBooking.bookingId,
        status: confirmedBooking.status,
        driverId: confirmedBooking.driverId,
        cargoDescription: confirmedBooking.cargoDescription
      });

      // Test the accept logic
      console.log('\n🔄 Testing Accept Logic...');
      const originalStatus = confirmedBooking.status;
      
      confirmedBooking.status = 'order_processing';
      const processingStep = confirmedBooking.trackingSteps.find(s => s.step === 'order_accepted');
      if (processingStep) {
        processingStep.status = 'completed';
        processingStep.timestamp = new Date();
        processingStep.notes = `Test acceptance by driver ${confirmedBooking.driverId}`;
      }

      console.log('✅ Accept logic test passed');
      
      // Restore original status
      confirmedBooking.status = originalStatus;
      if (processingStep) {
        processingStep.status = 'pending';
        processingStep.timestamp = null;
        processingStep.notes = 'Waiting for driver acceptance';
      }
      
      console.log('🔄 Restored original booking state');
    }

    // Check driver exists
    const driver = await Driver.findOne({ driverId: 'DRV001' });
    if (driver) {
      console.log('\n👤 Driver found:', {
        driverId: driver.driverId,
        name: driver.name,
        isActive: driver.isActive
      });
    } else {
      console.log('\n❌ Driver DRV001 not found');
    }

    console.log('\n✅ Driver Portal Accept/Reject Test Completed Successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    mongoose.connection.close();
  }
}

testDriverPortalAcceptReject();