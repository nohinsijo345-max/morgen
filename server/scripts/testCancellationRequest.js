const axios = require('axios');

const API_URL = 'http://localhost:5050';

async function testCancellationRequest() {
  console.log('🧪 Testing Cancellation Request Functionality');
  console.log('=' .repeat(50));

  try {
    // Get farmer's bookings
    const bookingsResponse = await axios.get(`${API_URL}/api/transport/bookings/farmer/FAR-369`);
    console.log(`📋 Found ${bookingsResponse.data.length} bookings for farmer FAR-369`);
    
    if (bookingsResponse.data.length > 0) {
      const testBooking = bookingsResponse.data.find(b => 
        b.status !== 'cancelled' && 
        b.status !== 'completed' &&
        b.status !== 'cancellation_requested'
      );
      
      if (testBooking) {
        console.log(`🧪 Testing cancellation for booking: ${testBooking.bookingId}`);
        console.log(`📊 Booking details:`);
        console.log(`   Status: ${testBooking.status}`);
        console.log(`   Tracking ID: ${testBooking.trackingId}`);
        console.log(`   Expected Delivery: ${testBooking.expectedDeliveryDate}`);
        console.log(`   From: ${testBooking.fromLocation?.city}, ${testBooking.fromLocation?.district}`);
        console.log(`   To: ${testBooking.toLocation?.city}, ${testBooking.toLocation?.district}`);
        
        try {
          const cancelResponse = await axios.post(`${API_URL}/api/transport/bookings/${testBooking._id}/cancel-request`, {
            reason: 'Test cancellation request - fixing backend integration',
            requestedBy: 'farmer'
          });
          console.log('✅ Cancellation request submitted successfully');
          console.log(`📝 Response: ${cancelResponse.data.message}`);
          console.log(`📊 Updated status: ${cancelResponse.data.booking.status}`);
          
          // Verify the cancellation request was saved
          const updatedBookingsResponse = await axios.get(`${API_URL}/api/transport/bookings/farmer/FAR-369`);
          const updatedBooking = updatedBookingsResponse.data.find(b => b._id === testBooking._id);
          
          if (updatedBooking) {
            console.log(`✅ Booking status updated to: ${updatedBooking.status}`);
            if (updatedBooking.cancellationRequest) {
              console.log(`📋 Cancellation request details:`);
              console.log(`   Requested by: ${updatedBooking.cancellationRequest.requestedBy}`);
              console.log(`   Reason: ${updatedBooking.cancellationRequest.reason}`);
              console.log(`   Status: ${updatedBooking.cancellationRequest.status}`);
              console.log(`   Requested at: ${new Date(updatedBooking.cancellationRequest.requestedAt).toLocaleString()}`);
            }
          }
          
        } catch (cancelError) {
          console.log('❌ Cancellation request failed:', cancelError.response?.data?.error || cancelError.message);
          console.log('📊 Error details:', cancelError.response?.data);
        }
      } else {
        console.log('ℹ️  No eligible bookings found for cancellation test');
        console.log('📋 Available bookings:');
        bookingsResponse.data.forEach((booking, index) => {
          console.log(`   ${index + 1}. ${booking.bookingId} - Status: ${booking.status}`);
        });
      }
    } else {
      console.log('ℹ️  No bookings found for farmer FAR-369');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testCancellationRequest();