const axios = require('axios');

const API_URL = 'http://localhost:5050';

async function testBidLimitRequest() {
  console.log('🧪 Testing Bid Limit Request System\n');

  try {
    // Test 1: Valid request
    console.log('Test 1: Valid bid limit increase request');
    const response1 = await axios.post(`${API_URL}/api/buyer/request-bid-limit-increase`, {
      buyerId: 'MGB002',
      requestedLimit: 50000,
      reason: 'Need higher limit for bulk purchases of wheat and rice',
      currentLimit: 10000
    });
    console.log('✅ Success:', response1.data);
    console.log('');

    // Test 2: Invalid - requested limit not greater than current
    console.log('Test 2: Invalid - requested limit not greater than current');
    try {
      await axios.post(`${API_URL}/api/buyer/request-bid-limit-increase`, {
        buyerId: 'MGB002',
        requestedLimit: 5000,
        reason: 'Testing invalid request',
        currentLimit: 10000
      });
      console.log('❌ Should have failed but succeeded');
    } catch (err) {
      console.log('✅ Correctly rejected:', err.response?.data?.error);
    }
    console.log('');

    // Test 3: Invalid - reason too short
    console.log('Test 3: Invalid - reason too short');
    try {
      await axios.post(`${API_URL}/api/buyer/request-bid-limit-increase`, {
        buyerId: 'MGB002',
        requestedLimit: 50000,
        reason: 'Short',
        currentLimit: 10000
      });
      console.log('❌ Should have failed but succeeded');
    } catch (err) {
      console.log('✅ Correctly rejected:', err.response?.data?.error);
    }
    console.log('');

    // Test 4: Invalid - missing fields
    console.log('Test 4: Invalid - missing fields');
    try {
      await axios.post(`${API_URL}/api/buyer/request-bid-limit-increase`, {
        buyerId: 'MGB002',
        requestedLimit: 50000
      });
      console.log('❌ Should have failed but succeeded');
    } catch (err) {
      console.log('✅ Correctly rejected:', err.response?.data?.error);
    }
    console.log('');

    // Test 5: Invalid - non-existent buyer
    console.log('Test 5: Invalid - non-existent buyer');
    try {
      await axios.post(`${API_URL}/api/buyer/request-bid-limit-increase`, {
        buyerId: 'MGB999',
        requestedLimit: 50000,
        reason: 'Testing with non-existent buyer',
        currentLimit: 10000
      });
      console.log('❌ Should have failed but succeeded');
    } catch (err) {
      console.log('✅ Correctly rejected:', err.response?.data?.error);
    }
    console.log('');

    // Test 6: Get buyer profile
    console.log('Test 6: Get buyer profile');
    const response6 = await axios.get(`${API_URL}/api/buyer/profile/MGB002`);
    console.log('✅ Buyer profile retrieved:');
    console.log('   Name:', response6.data.name);
    console.log('   Buyer Type:', response6.data.buyerType);
    console.log('   Current Bid Limit: ₹' + response6.data.maxBidLimit.toLocaleString());
    console.log('   Total Purchases:', response6.data.totalPurchases);
    console.log('');

    console.log('🎉 All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Response:', error.response.data);
    }
  }
}

testBidLimitRequest();
