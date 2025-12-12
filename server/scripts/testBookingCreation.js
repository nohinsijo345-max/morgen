const axios = require('axios');

async function testBookingCreation() {
  try {
    console.log('=== TESTING TRANSPORT BOOKING CREATION ===');
    
    const bookingPayload = {
      farmerId: 'FAR-369',
      farmerName: 'Nohin Sijo',
      vehicleId: '674b4e665669f0ba28fb58f1', // Mini Truck ID from the URL
      vehicleType: 'mini-truck',
      priceOption: {
        capacity: 'Compact Load (500kg-1 ton)',
        pricePerKm: 8,
        basePrice: 120,
        description: 'Perfect for small to medium loads'
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
      pickupDate: '2025-12-15',
      pickupTime: '10:00',
      distance: 50,
      notes: 'handle with care :)'
    };

    console.log('Booking payload:', JSON.stringify(bookingPayload, null, 2));

    const response = await axios.post('http://localhost:5050/api/transport/bookings', bookingPayload);
    
    console.log('✅ Booking created successfully!');
    console.log('Booking ID:', response.data.booking.bookingId);
    console.log('Tracking ID:', response.data.trackingId);
    console.log('Expected Delivery:', response.data.expectedDeliveryDate);
    console.log('Final Amount:', response.data.booking.finalAmount);
    
  } catch (error) {
    console.error('❌ Booking creation failed!');
    console.error('Status:', error.response?.status);
    console.error('Error:', error.response?.data?.error);
    console.error('Details:', error.response?.data?.details);
    console.error('Full response:', error.response?.data);
  }
}

testBookingCreation();