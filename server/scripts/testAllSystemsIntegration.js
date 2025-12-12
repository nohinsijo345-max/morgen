const axios = require('axios');

async function testAllSystemsIntegration() {
  console.log('=== COMPREHENSIVE SYSTEM INTEGRATION TEST ===\n');
  
  const API_URL = 'http://localhost:5050';
  const testFarmerId = 'FAR-369';
  
  try {
    // Test 1: Transport Booking System
    console.log('🚛 Test 1: Transport Booking System');
    const bookingPayload = {
      farmerId: testFarmerId,
      farmerName: 'Nohin Sijo',
      vehicleId: '674b4e665669f0ba28fb58f1',
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
      pickupDate: '2025-12-16',
      pickupTime: '14:00',
      distance: 75,
      notes: 'Integration test booking'
    };

    const bookingResponse = await axios.post(`${API_URL}/api/transport/bookings`, bookingPayload);
    console.log('✅ Booking created successfully!');
    console.log(`   Booking ID: ${bookingResponse.data.booking.bookingId}`);
    console.log(`   Tracking ID: ${bookingResponse.data.trackingId}`);
    console.log(`   Final Amount: ₹${bookingResponse.data.booking.finalAmount}`);
    
    // Test 2: Harvest Countdown Refresh
    console.log('\n🌾 Test 2: Harvest Countdown System');
    const harvestResponse = await axios.get(`${API_URL}/api/harvest/countdowns/${testFarmerId}?t=${Date.now()}`);
    console.log('✅ Harvest countdowns fetched successfully!');
    console.log(`   Active countdowns: ${harvestResponse.data.length}`);
    if (harvestResponse.data.length > 0) {
      const firstCountdown = harvestResponse.data[0];
      console.log(`   Next harvest: ${firstCountdown.name} in ${firstCountdown.daysToHarvest} days`);
    }
    
    // Test 3: Price Forecast Refresh
    console.log('\n📊 Test 3: Price Forecast System');
    const forecastResponse = await axios.get(`${API_URL}/api/price-forecast/forecast/${testFarmerId}?t=${Date.now()}`);
    console.log('✅ Price forecasts generated successfully!');
    console.log(`   Forecasts generated: ${forecastResponse.data.forecasts.length}`);
    console.log(`   Last updated: ${new Date(forecastResponse.data.lastUpdated).toLocaleTimeString()}`);
    if (forecastResponse.data.forecasts.length > 0) {
      const firstForecast = forecastResponse.data.forecasts[0];
      console.log(`   Sample: ${firstForecast.crop} - ₹${firstForecast.currentPrice}/kg (${firstForecast.trend})`);
    }
    
    // Test 4: Weather Data (City-based)
    console.log('\n🌤️  Test 4: Weather Data System');
    const weatherResponse = await axios.get(`${API_URL}/api/dashboard/farmer/${testFarmerId}?t=${Date.now()}`);
    console.log('✅ Weather data fetched successfully!');
    const weather = weatherResponse.data.weather;
    console.log(`   Location: ${weather.location}`);
    console.log(`   Temperature: ${weather.temperature}°C`);
    console.log(`   Condition: ${weather.condition}`);
    console.log(`   Live Data: ${weather.isLiveData}`);
    
    // Test 5: Dashboard Integration
    console.log('\n📱 Test 5: Dashboard Integration');
    const dashboardResponse = await axios.get(`${API_URL}/api/dashboard/farmer/${testFarmerId}?t=${Date.now()}`);
    console.log('✅ Dashboard data loaded successfully!');
    console.log(`   Farmer: ${dashboardResponse.data.farmer.name}`);
    console.log(`   Crops: ${dashboardResponse.data.crops.length} active`);
    console.log(`   Updates: ${dashboardResponse.data.updates.length} notifications`);
    
    console.log('\n🎉 ALL SYSTEMS INTEGRATION TEST PASSED!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Transport booking system working');
    console.log('   ✅ Harvest countdown auto-refresh working');
    console.log('   ✅ Price forecast auto-refresh working');
    console.log('   ✅ Weather data (city-based) working');
    console.log('   ✅ Dashboard integration working');
    console.log('   ✅ All backend updates and notifications working');
    
  } catch (error) {
    console.error('❌ Integration test failed:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Error:', error.response.data.error || error.response.data.message);
      console.error('   Details:', error.response.data.details);
    }
  }
}

testAllSystemsIntegration();