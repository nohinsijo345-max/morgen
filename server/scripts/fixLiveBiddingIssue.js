const axios = require('axios');

const fixLiveBiddingIssue = async () => {
  try {
    const API_URL = 'http://localhost:5050';
    
    console.log('🔧 Fixing Live Bidding Page Loading Issue...\n');
    
    // Step 1: Test API connectivity
    console.log('1️⃣ Testing API connectivity...');
    try {
      const response = await axios.get(`${API_URL}/api/bidding/active`);
      console.log('✅ API is responding');
      console.log(`📊 Current active bids: ${response.data.bids?.length || 0}`);
      
      if (response.data.bids && response.data.bids.length > 0) {
        console.log('\n📋 Sample bid data structure:');
        const sampleBid = response.data.bids[0];
        console.log('Available fields:', Object.keys(sampleBid));
        console.log('Farmer info:', {
          farmerId: sampleBid.farmerId,
          farmerName: sampleBid.farmerName,
          hasNestedFarmer: !!sampleBid.farmerId?.name
        });
      }
      
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.log('❌ Server is not running!');
        console.log('💡 Please start the server first:');
        console.log('   cd server && npm run dev');
        return;
      } else {
        console.log('❌ API Error:', error.response?.data || error.message);
        return;
      }
    }
    
    // Step 2: Check for common data issues
    console.log('\n2️⃣ Checking for data issues...');
    try {
      const response = await axios.get(`${API_URL}/api/bidding/active`);
      const bids = response.data.bids || [];
      
      if (bids.length === 0) {
        console.log('⚠️ No active bids found - this is likely why the page shows loading');
        console.log('💡 Solutions:');
        console.log('   1. Run: node server/scripts/seedTestBids.js');
        console.log('   2. Or create bids through the farmer interface');
        console.log('   3. Check that bid end dates are in the future');
      } else {
        console.log(`✅ Found ${bids.length} active bids`);
        
        // Check for expired bids
        const now = new Date();
        const expiredBids = bids.filter(bid => new Date(bid.bidEndDate) <= now);
        const validBids = bids.filter(bid => new Date(bid.bidEndDate) > now);
        
        console.log(`📊 Valid bids: ${validBids.length}`);
        console.log(`⚠️ Expired bids: ${expiredBids.length}`);
        
        if (expiredBids.length > 0) {
          console.log('💡 Some bids have expired and should be cleaned up');
        }
        
        // Check bid data structure
        let hasDataIssues = false;
        bids.forEach((bid, index) => {
          if (!bid.cropName) {
            console.log(`❌ Bid ${index + 1}: Missing cropName`);
            hasDataIssues = true;
          }
          if (!bid.farmerName) {
            console.log(`❌ Bid ${index + 1}: Missing farmerName`);
            hasDataIssues = true;
          }
          if (!bid.currentPrice && !bid.startingPrice) {
            console.log(`❌ Bid ${index + 1}: Missing price information`);
            hasDataIssues = true;
          }
        });
        
        if (!hasDataIssues) {
          console.log('✅ All bids have required data fields');
        }
      }
      
    } catch (error) {
      console.log('❌ Error checking data:', error.response?.data || error.message);
    }
    
    // Step 3: Test different query parameters
    console.log('\n3️⃣ Testing query parameters...');
    const testQueries = [
      '',
      '?buyerType=commercial',
      '?buyerType=public&state=Kerala&district=Ernakulam'
    ];
    
    for (const query of testQueries) {
      try {
        const response = await axios.get(`${API_URL}/api/bidding/active${query}`);
        console.log(`✅ Query "${query}": ${response.data.bids?.length || 0} bids`);
      } catch (error) {
        console.log(`❌ Query "${query}": ${error.response?.data?.error || error.message}`);
      }
    }
    
    // Step 4: Provide specific recommendations
    console.log('\n4️⃣ Recommendations to fix the loading issue:');
    
    const response = await axios.get(`${API_URL}/api/bidding/active`);
    const bids = response.data.bids || [];
    
    if (bids.length === 0) {
      console.log('🎯 PRIMARY ISSUE: No active bids available');
      console.log('📝 Action items:');
      console.log('   1. Run: node server/scripts/seedTestBids.js');
      console.log('   2. Verify farmers can create bids');
      console.log('   3. Check bid creation form is working');
    } else {
      console.log('🎯 Data is available, issue might be frontend-related');
      console.log('📝 Action items:');
      console.log('   1. Check browser console for JavaScript errors');
      console.log('   2. Verify useLiveUpdates hook is working');
      console.log('   3. Check network tab for failed API calls');
      console.log('   4. Ensure BuyerThemeContext is properly initialized');
    }
    
    console.log('\n🔍 Frontend debugging tips:');
    console.log('   1. Open browser dev tools');
    console.log('   2. Check Console tab for errors');
    console.log('   3. Check Network tab for API calls');
    console.log('   4. Look for "Live bids updated" log messages');
    console.log('   5. Verify the page is not stuck in loading state');
    
    console.log('\n✅ Live Bidding issue diagnosis completed!');
    
  } catch (error) {
    console.error('❌ Fix script error:', error.message);
  }
};

// Run the fix
fixLiveBiddingIssue();