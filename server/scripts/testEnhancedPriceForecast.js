const axios = require('axios');

// Test the enhanced AI price forecast system
async function testEnhancedPriceForecast() {
  try {
    console.log('🧪 Testing Enhanced AI Price Forecast System\n');

    const API_BASE = 'http://localhost:5000/api/price-forecast';
    
    // Test scenarios
    const testCases = [
      {
        name: 'Get Fresh AI Forecasts',
        endpoint: `${API_BASE}/forecast/FARM001`,
        description: 'Fetch fresh AI-generated price forecasts'
      },
      {
        name: 'Get Cached Forecasts',
        endpoint: `${API_BASE}/forecast/FARM001`,
        description: 'Should return cached data on second call'
      },
      {
        name: 'Cache Statistics',
        endpoint: `${API_BASE}/cache-stats`,
        description: 'Check cache performance and statistics'
      },
      {
        name: 'Manual Refresh All',
        endpoint: `${API_BASE}/refresh-all`,
        method: 'POST',
        description: 'Trigger manual refresh of all forecasts'
      }
    ];

    for (const testCase of testCases) {
      console.log(`\n📋 Testing: ${testCase.name}`);
      console.log(`   Description: ${testCase.description}`);
      console.log(`   Endpoint: ${testCase.endpoint}`);

      try {
        const startTime = Date.now();
        
        const response = testCase.method === 'POST' 
          ? await axios.post(testCase.endpoint)
          : await axios.get(testCase.endpoint);
        
        const responseTime = Date.now() - startTime;

        if (response.data) {
          console.log(`   ✅ Success (${responseTime}ms)`);
          
          if (testCase.name === 'Get Fresh AI Forecasts' || testCase.name === 'Get Cached Forecasts') {
            console.log(`   📊 Forecasts: ${response.data.forecasts?.length || 0} crops`);
            console.log(`   🤖 AI Generated: ${response.data.aiGenerated ? 'Yes' : 'No'}`);
            console.log(`   💾 From Cache: ${response.data.fromCache ? 'Yes' : 'No'}`);
            console.log(`   ⏰ Last Updated: ${new Date(response.data.lastUpdated).toLocaleTimeString()}`);
            
            if (response.data.cacheAge) {
              console.log(`   📈 Cache Age: ${response.data.cacheAge} seconds`);
            }
            
            if (response.data.forecasts && response.data.forecasts.length > 0) {
              const sample = response.data.forecasts[0];
              console.log(`   📈 Sample: ${sample.crop} - ₹${sample.currentPrice}/kg (${sample.trend} trend, ${sample.confidence} confidence)`);
            }
          }
          
          if (testCase.name === 'Cache Statistics') {
            console.log(`   💾 Cache Size: ${response.data.cacheSize} entries`);
            console.log(`   ⏱️  Cache Duration: ${response.data.cacheDuration} seconds`);
            console.log(`   📊 Active Farmers: ${response.data.entries?.length || 0}`);
            
            if (response.data.entries && response.data.entries.length > 0) {
              response.data.entries.forEach(entry => {
                console.log(`      - Farmer ${entry.farmerId}: ${entry.cropsCount} crops, ${entry.age}s old`);
              });
            }
          }
          
          if (testCase.name === 'Manual Refresh All') {
            console.log(`   🔄 Refresh Status: ${response.data.message}`);
            console.log(`   💾 Cache Cleared: ${response.data.cacheCleared ? 'Yes' : 'No'}`);
            console.log(`   ⏰ Timestamp: ${new Date(response.data.timestamp).toLocaleTimeString()}`);
          }
        }
      } catch (error) {
        if (error.code === 'ECONNREFUSED') {
          console.log(`   ⚠️  Server not running - skipping test`);
        } else if (error.response) {
          console.log(`   ❌ API Error: ${error.response.status} - ${error.response.data?.message || error.response.data?.error || 'Unknown error'}`);
        } else {
          console.log(`   ❌ Request Error: ${error.message}`);
        }
      }
    }

    console.log('\n✅ Enhanced AI Price Forecast Test Complete');
    console.log('\n📈 System Features:');
    console.log('   • AI-powered forecasts using Gemini API');
    console.log('   • Smart caching (3-minute duration)');
    console.log('   • Background refresh every 10 minutes');
    console.log('   • Frontend updates every 2 minutes');
    console.log('   • Enhanced market context analysis');
    console.log('   • Seasonal and regional factors');
    console.log('   • Manual refresh capability');
    console.log('   • Cache performance monitoring');

    console.log('\n💡 To test with live server:');
    console.log('   1. Start the server: npm start (in server directory)');
    console.log('   2. Ensure GEMINI_API_KEY is set in .env');
    console.log('   3. Run this test again');
    console.log('   4. Check server logs for AI generation details');

  } catch (error) {
    console.error('❌ Test setup failed:', error.message);
  }
}

// Run the test
testEnhancedPriceForecast();