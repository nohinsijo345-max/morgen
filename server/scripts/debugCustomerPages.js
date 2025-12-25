const axios = require('axios');

async function debugCustomerPages() {
  console.log('🔍 Debugging Customer Pages White Screen Issue...\n');

  const API_URL = process.env.API_URL || 'http://localhost:5050';

  try {
    // Test 1: Check if server is running
    console.log('1. Testing server connectivity...');
    try {
      const healthResponse = await axios.get(`${API_URL}/api/health`);
      console.log('✅ Server is running');
    } catch (error) {
      console.log('❌ Server not responding - this is likely the issue');
      console.log('   Start server with: cd server && npm run dev');
      return;
    }

    // Test 2: Check connections route
    console.log('\n2. Testing connections route...');
    try {
      const testResponse = await axios.get(`${API_URL}/api/connections/stats/farmer/TEST`);
      console.log('✅ Connections route is working');
    } catch (error) {
      console.log('❌ Connections route error:', error.response?.status, error.response?.statusText);
      if (error.response?.status === 500) {
        console.log('   This suggests a database connection issue');
      }
    }

    // Test 3: Check if users exist
    console.log('\n3. Testing user data...');
    try {
      const usersResponse = await axios.get(`${API_URL}/api/admin/users`);
      console.log(`✅ Found ${usersResponse.data.length} users in database`);
      
      const farmers = usersResponse.data.filter(u => u.role === 'farmer');
      const buyers = usersResponse.data.filter(u => u.role === 'buyer');
      console.log(`   - ${farmers.length} farmers`);
      console.log(`   - ${buyers.length} buyers`);
      
      if (farmers.length === 0) {
        console.log('⚠️  No farmers found - this could cause empty results');
      }
      if (buyers.length === 0) {
        console.log('⚠️  No buyers found - this could cause empty results');
      }
    } catch (error) {
      console.log('❌ Cannot fetch users:', error.response?.status);
    }

    console.log('\n📋 Common White Page Causes:');
    console.log('1. JavaScript errors in browser console');
    console.log('2. Missing dependencies or imports');
    console.log('3. API endpoints returning errors');
    console.log('4. Theme context not properly initialized');
    console.log('5. User session/authentication issues');

    console.log('\n🔧 Debugging Steps:');
    console.log('1. Open browser developer tools (F12)');
    console.log('2. Check Console tab for JavaScript errors');
    console.log('3. Check Network tab for failed API calls');
    console.log('4. Verify user is logged in with valid session');
    console.log('5. Check if theme context is working');

  } catch (error) {
    console.error('Debug script error:', error.message);
  }
}

if (require.main === module) {
  debugCustomerPages();
}

module.exports = { debugCustomerPages };