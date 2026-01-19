const axios = require('axios');

const testLiveBiddingPageDirectly = async () => {
  console.log('🧪 Testing Live Bidding Page Issue...\n');
  
  try {
    // Test 1: Verify server is responding
    console.log('1️⃣ Testing server connectivity...');
    const serverResponse = await axios.get('http://localhost:5050/api/bidding/active');
    console.log('✅ Server is responding correctly');
    console.log(`📊 API returns ${serverResponse.data.bids?.length || 0} bids`);
    
    if (serverResponse.data.bids && serverResponse.data.bids.length > 0) {
      const bid = serverResponse.data.bids[0];
      console.log('\n📋 Active bid details:');
      console.log(`   Crop: ${bid.cropName}`);
      console.log(`   Farmer: ${bid.farmerName}`);
      console.log(`   Price: ₹${bid.currentPrice}`);
      console.log(`   End Date: ${bid.bidEndDate}`);
      console.log(`   Status: ${bid.status}`);
    }
    
    // Test 2: Check if client can reach server
    console.log('\n2️⃣ Testing CORS and connectivity...');
    try {
      const corsTest = await axios.get('http://localhost:5050/api/bidding/active', {
        headers: {
          'Origin': 'http://localhost:5173',
          'Access-Control-Request-Method': 'GET'
        }
      });
      console.log('✅ CORS appears to be working');
    } catch (corsError) {
      console.log('⚠️ Potential CORS issue:', corsError.message);
    }
    
    console.log('\n3️⃣ Debugging frontend issues...');
    console.log('🔍 Common causes of loading spinner stuck:');
    console.log('   1. JavaScript errors in browser console');
    console.log('   2. Theme context errors');
    console.log('   3. Session/authentication issues');
    console.log('   4. useLiveUpdates hook not working');
    console.log('   5. Component state management issues');
    
    console.log('\n💡 Debugging steps:');
    console.log('   1. Open http://localhost:5173 in your browser');
    console.log('   2. Navigate to Live Bidding page');
    console.log('   3. Open browser Developer Tools (F12)');
    console.log('   4. Check Console tab for errors');
    console.log('   5. Look for debug messages starting with 🔍, 🔄, ✅');
    
    console.log('\n🎯 Expected debug messages in browser console:');
    console.log('   - "🔄 Fetching data from: /api/bidding/active"');
    console.log('   - "📡 Full URL: http://localhost:5050/api/bidding/active"');
    console.log('   - "✅ Response received: {bids: [...]}"');
    console.log('   - "🔍 LiveBidding Debug Info: {...}"');
    
    console.log('\n🚨 If you still see loading spinner:');
    console.log('   1. Check browser console for JavaScript errors');
    console.log('   2. Verify you\'re logged in as a buyer');
    console.log('   3. Try refreshing the page');
    console.log('   4. Check Network tab in DevTools for failed requests');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Server is not running. Please start it with: npm run dev (in server directory)');
    }
  }
};

testLiveBiddingPageDirectly();