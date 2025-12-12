const axios = require('axios');

const API_URL = 'http://localhost:5050';

async function testDifferentProfileChanges() {
  console.log('🧪 Testing Different Profile Change Types');
  console.log('=' .repeat(50));

  const testCases = [
    {
      name: 'PIN Code Only',
      changes: { pinCode: '999888' }
    },
    {
      name: 'Land Size Only', 
      changes: { landSize: 10 }
    },
    {
      name: 'City Only',
      changes: { city: 'Kochi' }
    },
    {
      name: 'Multiple Fields',
      changes: { 
        pinCode: '777666',
        landSize: 15,
        city: 'Ernakulam'
      }
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n📝 Testing: ${testCase.name}`);
    console.log(`   Changes: ${JSON.stringify(testCase.changes)}`);
    
    try {
      // Submit request
      const response = await axios.post(`${API_URL}/api/profile/request-change`, {
        farmerId: 'FAR-369',
        changes: testCase.changes
      });
      
      const requestId = response.data.request._id;
      console.log(`   ✅ Request submitted: ${requestId}`);
      
      // Approve request
      await axios.post(`${API_URL}/api/admin/profile-requests/${requestId}/approve`);
      console.log(`   ✅ Request approved`);
      
      // Check notification
      const dashboardResponse = await axios.get(`${API_URL}/api/dashboard/farmer/FAR-369`);
      const updates = dashboardResponse.data.updates || [];
      const latestUpdate = updates[0]; // Most recent
      
      if (latestUpdate && latestUpdate.category === 'profile') {
        console.log(`   📢 Notification: "${latestUpdate.message}"`);
        
        // Extract the "Updated fields" part
        const match = latestUpdate.message.match(/Updated fields: ([^.]+)/);
        if (match) {
          console.log(`   🎯 Shows fields: "${match[1]}"`);
        }
      } else {
        console.log(`   ❌ No profile notification found`);
      }
      
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.error?.includes('already have a pending')) {
        console.log(`   ⚠️  Skipped - farmer has pending request`);
      } else {
        console.log(`   ❌ Failed: ${error.response?.data?.error || error.message}`);
      }
    }
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n🎉 Profile Change Notification Test Complete!');
}

testDifferentProfileChanges();