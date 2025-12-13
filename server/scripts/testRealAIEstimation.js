const axios = require('axios');

// Test the real AI estimation API endpoint
async function testRealAIEstimation() {
  try {
    console.log('🧪 Testing Real AI Estimation API Endpoint\n');

    const testCases = [
      {
        name: 'Local Kerala Transport',
        data: {
          fromLocation: {
            city: 'Kochi',
            district: 'Ernakulam',
            state: 'Kerala',
            pinCode: '682001'
          },
          toLocation: {
            city: 'Thrissur',
            district: 'Thrissur',
            state: 'Kerala',
            pinCode: '680001'
          },
          vehicleType: 'mini-truck',
          cargoDescription: 'Fresh vegetables and fruits',
          pickupDate: new Date().toISOString()
        }
      },
      {
        name: 'Interstate Heavy Transport',
        data: {
          fromLocation: {
            city: 'Chennai',
            district: 'Chennai',
            state: 'Tamil Nadu',
            pinCode: '600001'
          },
          toLocation: {
            city: 'Bangalore',
            district: 'Bangalore',
            state: 'Karnataka',
            pinCode: '560001'
          },
          vehicleType: 'truck',
          cargoDescription: 'Heavy machinery equipment',
          pickupDate: new Date().toISOString()
        }
      },
      {
        name: 'Quick Local Delivery',
        data: {
          fromLocation: {
            city: 'Mumbai',
            district: 'Mumbai',
            state: 'Maharashtra',
            pinCode: '400001'
          },
          toLocation: {
            city: 'Navi Mumbai',
            district: 'Mumbai',
            state: 'Maharashtra',
            pinCode: '400614'
          },
          vehicleType: 'autorickshaw',
          cargoDescription: 'Small packages',
          pickupDate: new Date().toISOString()
        }
      }
    ];

    for (const testCase of testCases) {
      console.log(`\n📋 Testing: ${testCase.name}`);
      console.log(`   Route: ${testCase.data.fromLocation.city} → ${testCase.data.toLocation.city}`);
      console.log(`   Vehicle: ${testCase.data.vehicleType}`);
      console.log(`   Cargo: ${testCase.data.cargoDescription}`);

      try {
        const response = await axios.post('http://localhost:5000/api/transport/estimate-delivery', testCase.data, {
          timeout: 30000 // 30 second timeout
        });

        if (response.data) {
          console.log(`   ✅ Success: ${response.data.estimatedHours} hours`);
          console.log(`   📅 Delivery: ${new Date(response.data.estimatedDate).toLocaleString()}`);
          console.log(`   🎯 Confidence: ${response.data.confidence}`);
          if (response.data.breakdown) {
            console.log(`   📊 Breakdown: Transit ${response.data.breakdown.baseTransitTime}h + Loading ${response.data.breakdown.loadingUnloadingTime}h + Buffer ${response.data.breakdown.bufferTime}h`);
          }
        }
      } catch (error) {
        if (error.code === 'ECONNREFUSED') {
          console.log(`   ⚠️  Server not running - skipping API test`);
        } else if (error.response) {
          console.log(`   ❌ API Error: ${error.response.status} - ${error.response.data?.error || 'Unknown error'}`);
        } else {
          console.log(`   ❌ Request Error: ${error.message}`);
        }
      }
    }

    console.log('\n✅ Real AI Estimation API Test Complete');
    console.log('\n💡 To test with live server:');
    console.log('   1. Start the server: npm start (in server directory)');
    console.log('   2. Run this test again');
    console.log('   3. Check server logs for detailed calculation breakdowns');

  } catch (error) {
    console.error('❌ Test setup failed:', error.message);
  }
}

// Run the test
testRealAIEstimation();