const mongoose = require('mongoose');
const User = require('../models/User');
const axios = require('axios');
require('dotenv').config();

// Test weather fetching with city-based queries
async function testCityBasedWeather() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find a user with city data
    const testUser = await User.findOne({ 
      role: 'farmer', 
      city: { $exists: true, $ne: null, $ne: '' },
      district: { $exists: true, $ne: null, $ne: '' }
    });

    if (!testUser) {
      console.log('No user found with city data');
      return;
    }

    console.log('\n=== TESTING CITY-BASED WEATHER FETCHING ===');
    console.log(`Test User: ${testUser.name}`);
    console.log(`City: ${testUser.city}`);
    console.log(`District: ${testUser.district}`);
    console.log(`PIN Code: ${testUser.pinCode || 'Not available'}`);

    // Test the weather API call directly
    const apiKey = process.env.WEATHER_API_KEY;
    
    if (!apiKey || apiKey === 'your_api_key_here') {
      console.log('\n❌ No valid WeatherAPI key found - will use mock data');
      return;
    }

    // Test city-based query (new approach)
    const cityQuery = `${testUser.city},${testUser.district},India`;
    console.log(`\n🌤️  Testing city-based query: "${cityQuery}"`);
    
    try {
      const cityResponse = await axios.get(
        `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${cityQuery}&aqi=yes`,
        { timeout: 5000 }
      );
      
      console.log('✅ City-based weather fetch successful!');
      console.log(`   Location returned: ${cityResponse.data.location.name}`);
      console.log(`   Region: ${cityResponse.data.location.region}`);
      console.log(`   Country: ${cityResponse.data.location.country}`);
      console.log(`   Temperature: ${cityResponse.data.current.temp_c}°C`);
      console.log(`   Condition: ${cityResponse.data.current.condition.text}`);
      console.log(`   Humidity: ${cityResponse.data.current.humidity}%`);
      console.log(`   Wind: ${cityResponse.data.current.wind_kph} km/h`);
      
    } catch (error) {
      console.log('❌ City-based weather fetch failed:', error.message);
    }

    // Compare with PIN code query (old approach) if available
    if (testUser.pinCode) {
      const pinQuery = `${testUser.pinCode},India`;
      console.log(`\n📍 Comparing with PIN-based query: "${pinQuery}"`);
      
      try {
        const pinResponse = await axios.get(
          `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${pinQuery}&aqi=yes`,
          { timeout: 5000 }
        );
        
        console.log('✅ PIN-based weather fetch successful!');
        console.log(`   Location returned: ${pinResponse.data.location.name}`);
        console.log(`   Region: ${pinResponse.data.location.region}`);
        console.log(`   Temperature: ${pinResponse.data.current.temp_c}°C`);
        console.log(`   Condition: ${pinResponse.data.current.condition.text}`);
        
      } catch (error) {
        console.log('❌ PIN-based weather fetch failed:', error.message);
      }
    }

    // Test the dashboard API endpoint
    console.log('\n🔄 Testing dashboard API endpoint...');
    try {
      const API_URL = process.env.API_URL || 'http://localhost:5050';
      const dashboardResponse = await axios.get(`${API_URL}/api/dashboard/farmer/${testUser.farmerId}`);
      
      const weather = dashboardResponse.data.weather;
      console.log('✅ Dashboard weather fetch successful!');
      console.log(`   Location: ${weather.location}`);
      console.log(`   Temperature: ${weather.temperature}°C`);
      console.log(`   Condition: ${weather.condition}`);
      console.log(`   Is Live Data: ${weather.isLiveData}`);
      console.log(`   Last Updated: ${weather.lastUpdated}`);
      
    } catch (error) {
      console.log('❌ Dashboard API test failed:', error.message);
    }

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Test completed');
  }
}

testCityBasedWeather();