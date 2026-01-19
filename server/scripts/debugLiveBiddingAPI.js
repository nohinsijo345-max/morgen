const axios = require('axios');

const debugLiveBiddingAPI = async () => {
  try {
    const API_URL = 'http://localhost:5050';
    
    console.log('🔍 Debugging Live Bidding API...\n');
    
    // Test 1: Check server connectivity
    console.log('1️⃣ Testing server connectivity...');
    try {
      const healthCheck = await axios.get(`${API_URL}/api/bidding/active`);
      console.log('✅ Server is responding');
      console.log(`📊 Response structure:`, {
        status: healthCheck.status,
        dataKeys: Object.keys(healthCheck.data),
        bidsCount: healthCheck.data.bids?.length || 0
      });
      
      // Show sample bid structure if available
      if (healthCheck.data.bids && healthCheck.data.bids.length > 0) {
        console.log('\n📋 Sample bid structure:');
        const sampleBid = healthCheck.data.bids[0];
        console.log({
          bidId: sampleBid.bidId,
          cropName: sampleBid.cropName,
          farmerId: sampleBid.farmerId,
          farmerName: sampleBid.farmerName,
          status: sampleBid.status,
          currentPrice: sampleBid.currentPrice,
          startingPrice: sampleBid.startingPrice,
          bidEndDate: sampleBid.bidEndDate,
          quality: sampleBid.quality,
          quantity: sampleBid.quantity,
          unit: sampleBid.unit,
          bids: sampleBid.bids?.length || 0
        });
      } else {
        console.log('⚠️ No active bids found in response');
      }
      
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.log('❌ Server is not running. Please start the server first.');
        console.log('💡 Run: npm run dev (in server directory)');
        return;
      } else {
        console.log('❌ Server error:', error.response?.data || error.message);
        return;
      }
    }
    
    // Test 2: Check if there are any bids in the database
    console.log('\n2️⃣ Checking bid data availability...');
    try {
      const response = await axios.get(`${API_URL}/api/bidding/active`);
      const bids = response.data.bids || [];
      
      if (bids.length === 0) {
        console.log('⚠️ No active bids found. This could be why the page appears to be loading.');
        console.log('💡 Try creating some test bids first.');
        
        // Check if there are any bids at all (including inactive)
        console.log('\n🔍 Checking for any bids in the system...');
        // We can't directly query the database from here, but we can suggest next steps
        console.log('💡 Suggestions:');
        console.log('   1. Check if farmers have created any bids');
        console.log('   2. Verify bid end dates are in the future');
        console.log('   3. Ensure bid status is "active"');
      } else {
        console.log(`✅ Found ${bids.length} active bids`);
        
        // Analyze bid data
        bids.forEach((bid, index) => {
          const timeLeft = new Date(bid.bidEndDate) - new Date();
          const isExpired = timeLeft <= 0;
          
          console.log(`\n📋 Bid ${index + 1}:`);
          console.log(`   Crop: ${bid.cropName}`);
          console.log(`   Farmer: ${bid.farmerName}`);
          console.log(`   Status: ${bid.status}`);
          console.log(`   End Date: ${bid.bidEndDate}`);
          console.log(`   Expired: ${isExpired ? 'Yes' : 'No'}`);
          console.log(`   Current Price: ₹${bid.currentPrice}`);
        });
      }
    } catch (error) {
      console.log('❌ Error checking bid data:', error.response?.data || error.message);
    }
    
    // Test 3: Test with different query parameters
    console.log('\n3️⃣ Testing with different query parameters...');
    
    const testParams = [
      {},
      { buyerType: 'commercial' },
      { buyerType: 'public', state: 'Kerala', district: 'Ernakulam' }
    ];
    
    for (const params of testParams) {
      try {
        const queryString = new URLSearchParams(params).toString();
        const url = `${API_URL}/api/bidding/active${queryString ? `?${queryString}` : ''}`;
        
        const response = await axios.get(url);
        console.log(`📊 Query ${JSON.stringify(params)}: ${response.data.bids?.length || 0} bids`);
      } catch (error) {
        console.log(`❌ Query ${JSON.stringify(params)} failed:`, error.response?.data?.error || error.message);
      }
    }
    
    console.log('\n🎉 Live Bidding API debug completed!');
    console.log('\n💡 Common issues and solutions:');
    console.log('1. No active bids: Create test bids with future end dates');
    console.log('2. Server not running: Start with npm run dev');
    console.log('3. Database connection: Check MongoDB connection');
    console.log('4. Frontend errors: Check browser console for JavaScript errors');
    
  } catch (error) {
    console.error('❌ Debug script error:', error.message);
  }
};

// Run the debug
debugLiveBiddingAPI();