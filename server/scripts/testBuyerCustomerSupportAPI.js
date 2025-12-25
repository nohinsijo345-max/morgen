const axios = require('axios');

async function testBuyerCustomerSupportAPI() {
  try {
    console.log('🧪 Testing Buyer Customer Support API endpoints...\n');
    
    const API_URL = 'http://localhost:5050';
    
    // Test 1: Get buyer support tickets
    console.log('1. Testing GET /api/admin/support/buyer-tickets');
    try {
      const response = await axios.get(`${API_URL}/api/admin/support/buyer-tickets`);
      console.log(`✅ Success: Found ${response.data.length} buyer support tickets`);
      
      if (response.data.length > 0) {
        const ticket = response.data[0];
        console.log(`   Sample ticket: ${ticket.ticketId} - ${ticket.subject} (${ticket.status})`);
      }
    } catch (error) {
      console.log(`❌ Failed: ${error.response?.status} ${error.response?.statusText}`);
    }
    
    // Test 2: Send bulk message to buyers
    console.log('\n2. Testing POST /api/admin/support/bulk-message-buyers');
    try {
      const response = await axios.post(`${API_URL}/api/admin/support/bulk-message-buyers`, {
        message: 'Test API message from automated test',
        type: 'all'
      });
      console.log(`✅ Success: ${response.data.message}`);
      console.log(`   Recipients: ${response.data.recipientCount} buyers`);
    } catch (error) {
      console.log(`❌ Failed: ${error.response?.status} ${error.response?.statusText}`);
      if (error.response?.data) {
        console.log(`   Error: ${error.response.data.error}`);
      }
    }
    
    // Test 3: Test reply to a ticket
    console.log('\n3. Testing POST /api/admin/support/tickets/{ticketId}/reply');
    try {
      // Get a ticket first
      const ticketsResponse = await axios.get(`${API_URL}/api/admin/support/buyer-tickets`);
      if (ticketsResponse.data.length > 0) {
        const ticketId = ticketsResponse.data[0].ticketId;
        
        const response = await axios.post(`${API_URL}/api/support/tickets/${ticketId}/reply`, {
          message: 'This is a test reply from admin API test'
        });
        console.log(`✅ Success: Reply sent to ticket ${ticketId}`);
      } else {
        console.log('⚠️  Skipped: No tickets available to reply to');
      }
    } catch (error) {
      console.log(`❌ Failed: ${error.response?.status} ${error.response?.statusText}`);
      if (error.response?.data) {
        console.log(`   Error: ${error.response.data.error}`);
      }
    }
    
    // Test 4: Test buyer settings endpoint
    console.log('\n4. Testing POST /api/admin/buyer/settings');
    try {
      const response = await axios.post(`${API_URL}/api/admin/buyer/settings`, {
        bidMessaging: {
          enabled: true,
          targetTypes: ['all', 'active', 'winners']
        },
        bulkMessaging: {
          enabled: true,
          categories: ['all', 'active', 'new']
        }
      });
      console.log(`✅ Success: ${response.data.message}`);
    } catch (error) {
      console.log(`❌ Failed: ${error.response?.status} ${error.response?.statusText}`);
      if (error.response?.data) {
        console.log(`   Error: ${error.response.data.error}`);
      }
    }
    
    // Test 5: Test bid message endpoint
    console.log('\n5. Testing POST /api/admin/buyer/bid-message');
    try {
      const response = await axios.post(`${API_URL}/api/admin/buyer/bid-message`, {
        message: 'New bidding opportunity available! Check out the latest crops.',
        type: 'all'
      });
      console.log(`✅ Success: ${response.data.message}`);
      console.log(`   Recipients: ${response.data.recipientCount} buyers`);
    } catch (error) {
      console.log(`❌ Failed: ${error.response?.status} ${error.response?.statusText}`);
      if (error.response?.data) {
        console.log(`   Error: ${error.response.data.error}`);
      }
    }
    
    console.log('\n🎉 Buyer Customer Support API Test Complete!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testBuyerCustomerSupportAPI();