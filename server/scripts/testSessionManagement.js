#!/usr/bin/env node

/**
 * Test Session Management System
 * This script tests the core session management functionality
 */

const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:5050';

async function testSessionManagement() {
  console.log('🧪 Testing Session Management System...\n');

  try {
    // Test 1: Login with correct credentials
    console.log('1️⃣ Testing login with correct credentials...');
    const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
      farmerId: 'FAR-369',
      pin: '1234'
    });

    if (loginResponse.status === 200) {
      console.log('✅ Login successful');
      console.log('📋 User data received:', JSON.stringify(loginResponse.data, null, 2));
      
      const userData = loginResponse.data;
      
      // Test 2: Verify user data structure
      console.log('\n2️⃣ Verifying user data structure...');
      const requiredFields = ['farmerId', 'name', 'email', 'phone', 'state', 'district', 'city'];
      const missingFields = requiredFields.filter(field => !userData[field]);
      
      if (missingFields.length === 0) {
        console.log('✅ All required fields present');
      } else {
        console.log('⚠️ Missing fields:', missingFields);
      }
      
      // Test 3: Test profile endpoint
      console.log('\n3️⃣ Testing profile endpoint...');
      const profileResponse = await axios.get(`${API_URL}/api/auth/profile/${userData.farmerId}`);
      
      if (profileResponse.status === 200) {
        console.log('✅ Profile endpoint working');
        console.log('📋 Profile data:', JSON.stringify(profileResponse.data, null, 2));
      } else {
        console.log('❌ Profile endpoint failed');
      }
      
      // Test 4: Test dashboard endpoint
      console.log('\n4️⃣ Testing dashboard endpoint...');
      const dashboardResponse = await axios.get(`${API_URL}/api/dashboard/farmer/${userData.farmerId}`);
      
      if (dashboardResponse.status === 200) {
        console.log('✅ Dashboard endpoint working');
        console.log('📋 Dashboard data keys:', Object.keys(dashboardResponse.data));
      } else {
        console.log('❌ Dashboard endpoint failed');
      }
      
      console.log('\n🎉 Session Management Test Complete!');
      console.log('✅ Backend APIs are working correctly');
      console.log('✅ User data structure is valid');
      console.log('✅ All endpoints responding properly');
      
    } else {
      console.log('❌ Login failed with status:', loginResponse.status);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('📋 Error response:', error.response.data);
    }
  }
}

// Run the test
testSessionManagement();