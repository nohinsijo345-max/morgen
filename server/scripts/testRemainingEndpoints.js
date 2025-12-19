#!/usr/bin/env node

/**
 * Test Remaining Endpoints
 * This script tests the endpoints that are still having issues
 */

const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:5050';
const TEST_FARMER_ID = 'FAR-369';

async function testRemainingEndpoints() {
  console.log('🧪 Testing Remaining Endpoints...\n');

  try {
    // Test 1: AI Doctor endpoints
    console.log('1️⃣ Testing AI Doctor endpoints...');
    try {
      const aiChatResponse = await axios.get(`${API_URL}/api/ai-doctor/chat/${TEST_FARMER_ID}`);
      console.log('✅ AI Doctor chat endpoint working:', {
        messages: aiChatResponse.data.messages?.length || 0,
        stats: !!aiChatResponse.data.sessionStats
      });
    } catch (error) {
      console.log('⚠️ AI Doctor chat endpoint issue:', error.response?.status, error.response?.data?.error);
    }

    // Test 2: Updates endpoint
    console.log('\n2️⃣ Testing Updates endpoint...');
    try {
      const updatesResponse = await axios.get(`${API_URL}/api/dashboard/farmer/${TEST_FARMER_ID}`);
      console.log('✅ Updates via dashboard endpoint:', {
        updates: updatesResponse.data.updates?.length || 0,
        hasUpdates: !!updatesResponse.data.updates
      });
    } catch (error) {
      console.log('⚠️ Updates endpoint issue:', error.response?.status, error.response?.data?.error);
    }

    // Test 3: Leaderboard endpoint
    console.log('\n3️⃣ Testing Leaderboard endpoint...');
    try {
      const leaderboardResponse = await axios.get(`${API_URL}/api/leaderboard/top?limit=20`);
      console.log('✅ Leaderboard endpoint working:', {
        farmers: leaderboardResponse.data?.length || 0,
        hasData: !!leaderboardResponse.data
      });
    } catch (error) {
      console.log('⚠️ Leaderboard endpoint issue:', error.response?.status, error.response?.data?.error);
    }

    // Test 4: Transport vehicles endpoint
    console.log('\n4️⃣ Testing Transport vehicles endpoint...');
    try {
      const vehiclesResponse = await axios.get(`${API_URL}/api/transport/vehicles`);
      console.log('✅ Transport vehicles endpoint working:', {
        vehicles: vehiclesResponse.data?.length || 0,
        hasData: !!vehiclesResponse.data
      });
    } catch (error) {
      console.log('⚠️ Transport vehicles endpoint issue:', error.response?.status, error.response?.data?.error);
    }

    // Test 5: Order history endpoint
    console.log('\n5️⃣ Testing Order history endpoint...');
    try {
      const orderHistoryResponse = await axios.get(`${API_URL}/api/transport/bookings/farmer/${TEST_FARMER_ID}`);
      console.log('✅ Order history endpoint working:', {
        orders: orderHistoryResponse.data?.length || 0,
        hasData: !!orderHistoryResponse.data
      });
    } catch (error) {
      console.log('⚠️ Order history endpoint issue:', error.response?.status, error.response?.data?.error);
    }

    // Test 6: Check if routes exist
    console.log('\n6️⃣ Testing route availability...');
    const routes = [
      '/api/ai-doctor',
      '/api/leaderboard',
      '/api/transport',
      '/api/updates'
    ];

    for (const route of routes) {
      try {
        await axios.get(`${API_URL}${route}`);
        console.log(`✅ Route ${route} exists`);
      } catch (error) {
        if (error.response?.status === 404) {
          console.log(`❌ Route ${route} not found`);
        } else {
          console.log(`⚠️ Route ${route} exists but has issues:`, error.response?.status);
        }
      }
    }

    console.log('\n🎉 Remaining Endpoints Test Complete!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('📋 Error response:', error.response.data);
    }
  }
}

// Run the test
testRemainingEndpoints();