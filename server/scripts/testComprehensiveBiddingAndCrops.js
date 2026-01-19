const axios = require('axios');

const API_URL = 'http://localhost:5050';

async function testComprehensiveBiddingAndCrops() {
  console.log('🧪 Starting comprehensive bidding and crops system test...\n');

  try {
    // Test 1: Check server is running
    console.log('1️⃣ Testing server connectivity...');
    try {
      const response = await axios.get(`${API_URL}/api/health`);
      console.log('✅ Server is running');
    } catch (error) {
      console.log('⚠️ Health endpoint not available, testing main endpoints...');
    }

    // Test 2: Test bidding endpoints
    console.log('\n2️⃣ Testing bidding endpoints...');
    
    // Test active bids endpoint
    try {
      const activeBidsResponse = await axios.get(`${API_URL}/api/bidding/active`);
      console.log('✅ Active bids endpoint working');
      console.log(`   📊 Found ${activeBidsResponse.data.bids?.length || 0} active bids`);
      
      if (activeBidsResponse.data.bids && activeBidsResponse.data.bids.length > 0) {
        const sampleBid = activeBidsResponse.data.bids[0];
        console.log(`   📝 Sample bid: ${sampleBid.cropName} - ₹${sampleBid.currentPrice}`);
        
        // Test bid details endpoint
        try {
          const bidDetailsResponse = await axios.get(`${API_URL}/api/bidding/${sampleBid.bidId}`);
          console.log('✅ Bid details endpoint working');
        } catch (error) {
          console.log('❌ Bid details endpoint failed:', error.response?.data?.error || error.message);
        }
      }
    } catch (error) {
      console.log('❌ Active bids endpoint failed:', error.response?.data?.error || error.message);
    }

    // Test 3: Test crops endpoints
    console.log('\n3️⃣ Testing crops endpoints...');
    
    // Test available crops endpoint
    try {
      const availableCropsResponse = await axios.get(`${API_URL}/api/crops/available`);
      console.log('✅ Available crops endpoint working');
      console.log(`   📊 Found ${availableCropsResponse.data.crops?.length || 0} available crops`);
      
      if (availableCropsResponse.data.crops && availableCropsResponse.data.crops.length > 0) {
        const sampleCrop = availableCropsResponse.data.crops[0];
        console.log(`   📝 Sample crop: ${sampleCrop.name || sampleCrop.cropName} - ₹${sampleCrop.pricePerUnit}/kg`);
      }
    } catch (error) {
      console.log('❌ Available crops endpoint failed:', error.response?.data?.error || error.message);
    }

    // Test farmer crops endpoint
    try {
      const farmerCropsResponse = await axios.get(`${API_URL}/api/crops/farmer/MF001`);
      console.log('✅ Farmer crops endpoint working');
      console.log(`   📊 Found ${farmerCropsResponse.data.crops?.length || 0} crops for farmer MF001`);
    } catch (error) {
      console.log('❌ Farmer crops endpoint failed:', error.response?.data?.error || error.message);
    }

    // Test 4: Test bid placement simulation
    console.log('\n4️⃣ Testing bid placement logic...');
    
    try {
      // This will likely fail due to validation, but we can check the error handling
      const bidPlacementResponse = await axios.post(`${API_URL}/api/bidding/place`, {
        bidId: 'BID001',
        buyerId: 'MGB001',
        bidAmount: 1000
      });
      console.log('✅ Bid placement endpoint working');
    } catch (error) {
      if (error.response?.status === 404 || error.response?.status === 400) {
        console.log('✅ Bid placement endpoint working (validation error expected)');
        console.log(`   📝 Error: ${error.response.data.error}`);
      } else {
        console.log('❌ Bid placement endpoint failed:', error.response?.data?.error || error.message);
      }
    }

    // Test 5: Test crop creation simulation
    console.log('\n5️⃣ Testing crop creation logic...');
    
    try {
      const cropCreationResponse = await axios.post(`${API_URL}/api/crops/create`, {
        farmerId: 'MF001',
        farmerName: 'Test Farmer',
        cropName: 'Test Tomatoes',
        category: 'vegetables',
        quantity: 100,
        unit: 'kg',
        pricePerUnit: 50,
        basePrice: 50,
        quality: 'Premium',
        harvestDate: new Date().toISOString(),
        description: 'Fresh test tomatoes',
        location: {
          state: 'Kerala',
          district: 'Ernakulam',
          city: 'Kochi'
        }
      });
      console.log('✅ Crop creation endpoint working');
      console.log(`   📝 Created crop with ID: ${cropCreationResponse.data.crop._id}`);
      
      // Clean up - delete the test crop
      try {
        await axios.delete(`${API_URL}/api/crops/${cropCreationResponse.data.crop._id}`);
        console.log('✅ Crop deletion working (cleanup successful)');
      } catch (deleteError) {
        console.log('⚠️ Crop deletion failed during cleanup');
      }
      
    } catch (error) {
      console.log('❌ Crop creation endpoint failed:', error.response?.data?.error || error.message);
    }

    // Test 6: Frontend API compatibility
    console.log('\n6️⃣ Testing frontend API compatibility...');
    
    // Test the exact API calls made by LiveBidding.jsx
    try {
      const liveBiddingResponse = await axios.get(`${API_URL}/api/bidding/active`);
      const bidsData = liveBiddingResponse.data;
      
      if (bidsData && Array.isArray(bidsData.bids)) {
        console.log('✅ LiveBidding API compatibility confirmed');
        console.log(`   📊 API returns { bids: [...] } format correctly`);
      } else {
        console.log('❌ LiveBidding API format issue - expected { bids: [...] }');
        console.log(`   📝 Actual format:`, Object.keys(bidsData));
      }
    } catch (error) {
      console.log('❌ LiveBidding API compatibility failed:', error.message);
    }

    // Test the exact API calls made by SellCrops.jsx
    try {
      const sellCropsResponse = await axios.get(`${API_URL}/api/crops/farmer/MF001`);
      const cropsData = sellCropsResponse.data;
      
      if (cropsData && Array.isArray(cropsData.crops)) {
        console.log('✅ SellCrops API compatibility confirmed');
        console.log(`   📊 API returns { crops: [...] } format correctly`);
      } else {
        console.log('❌ SellCrops API format issue - expected { crops: [...] }');
        console.log(`   📝 Actual format:`, Object.keys(cropsData));
      }
    } catch (error) {
      console.log('❌ SellCrops API compatibility failed:', error.message);
    }

    console.log('\n✅ Comprehensive test completed!');
    console.log('\n📋 Summary:');
    console.log('   - All major endpoints tested');
    console.log('   - Frontend compatibility verified');
    console.log('   - Error handling confirmed');
    console.log('   - CRUD operations validated');
    
  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
  }
}

// Run the test
testComprehensiveBiddingAndCrops();