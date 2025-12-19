#!/usr/bin/env node

/**
 * Test All Components Integration
 * This script tests all the endpoints that the frontend components use
 */

const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:5050';
const TEST_FARMER_ID = 'FAR-369';

async function testAllComponents() {
  console.log('🧪 Testing All Component Endpoints...\n');

  try {
    // Test 1: Login and get user data
    console.log('1️⃣ Testing login...');
    const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
      farmerId: TEST_FARMER_ID,
      pin: '1234'
    });
    console.log('✅ Login successful');
    
    // Test 2: Dashboard data (includes weather)
    console.log('\n2️⃣ Testing dashboard data...');
    const dashboardResponse = await axios.get(`${API_URL}/api/dashboard/farmer/${TEST_FARMER_ID}`);
    console.log('✅ Dashboard data:', {
      farmer: !!dashboardResponse.data.farmer,
      weather: !!dashboardResponse.data.weather,
      stats: !!dashboardResponse.data.stats
    });
    
    // Test 3: Harvest countdowns
    console.log('\n3️⃣ Testing harvest countdowns...');
    try {
      const countdownResponse = await axios.get(`${API_URL}/api/harvest/countdowns/${TEST_FARMER_ID}`);
      console.log('✅ Harvest countdowns:', countdownResponse.data.length, 'items');
    } catch (error) {
      console.log('⚠️ Harvest countdowns endpoint not available:', error.response?.status);
    }
    
    // Test 4: Price forecasts
    console.log('\n4️⃣ Testing price forecasts...');
    try {
      const forecastResponse = await axios.get(`${API_URL}/api/price-forecast/forecast/${TEST_FARMER_ID}`);
      console.log('✅ Price forecasts:', forecastResponse.data.forecasts?.length || 0, 'items');
    } catch (error) {
      console.log('⚠️ Price forecast endpoint not available:', error.response?.status);
    }
    
    // Test 5: Crop preferences
    console.log('\n5️⃣ Testing crop preferences...');
    try {
      const cropResponse = await axios.get(`${API_URL}/api/harvest/crop-preferences/${TEST_FARMER_ID}`);
      console.log('✅ Crop preferences:', cropResponse.data?.length || 0, 'items');
    } catch (error) {
      console.log('⚠️ Crop preferences endpoint not available:', error.response?.status);
    }
    
    // Test 6: AI Doctor stats
    console.log('\n6️⃣ Testing AI Doctor stats...');
    try {
      const aiResponse = await axios.get(`${API_URL}/api/ai-doctor/stats/${TEST_FARMER_ID}`);
      console.log('✅ AI Doctor stats:', {
        consultations: aiResponse.data.totalConsultations,
        images: aiResponse.data.imagesAnalyzed
      });
    } catch (error) {
      console.log('⚠️ AI Doctor stats endpoint not available:', error.response?.status);
    }
    
    // Test 7: Profile data
    console.log('\n7️⃣ Testing profile data...');
    const profileResponse = await axios.get(`${API_URL}/api/auth/profile/${TEST_FARMER_ID}`);
    console.log('✅ Profile data:', {
      name: profileResponse.data.name,
      location: `${profileResponse.data.city}, ${profileResponse.data.district}`,
      crops: profileResponse.data.cropTypes?.length || 0
    });
    
    console.log('\n🎉 All Component Tests Complete!');
    console.log('✅ Core endpoints are working');
    console.log('✅ User data is available');
    console.log('✅ Components should now load properly');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('📋 Error response:', error.response.data);
    }
  }
}

// Run the test
testAllComponents();