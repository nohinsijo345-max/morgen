const axios = require('axios');

async function testAdminLogin() {
  try {
    console.log('🔍 Testing admin login functionality...\n');

    const API_URL = 'http://localhost:5050';
    
    // Test 1: Check if admin login endpoint exists
    console.log('1. Testing admin login endpoint...');
    try {
      const response = await axios.post(`${API_URL}/api/admin/login`, {
        username: 'admin',
        password: 'admin123'
      });
      
      console.log('✅ Admin login endpoint is working');
      console.log('📋 Admin login response:', response.data);
      
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Admin login endpoint exists (got 401 - wrong credentials)');
        console.log('❌ Default credentials (admin/admin123) failed');
        
        // Try different credentials
        console.log('\n2. Trying different admin credentials...');
        const commonCredentials = [
          { username: 'admin', password: 'password' },
          { username: 'admin', password: '1234' },
          { username: 'administrator', password: 'admin' },
          { username: 'root', password: 'admin' }
        ];
        
        for (const creds of commonCredentials) {
          try {
            const testResponse = await axios.post(`${API_URL}/api/admin/login`, creds);
            console.log(`✅ Success with ${creds.username}/${creds.password}`);
            console.log('📋 Response:', testResponse.data);
            break;
          } catch (testError) {
            console.log(`❌ Failed with ${creds.username}/${creds.password}`);
          }
        }
        
      } else {
        console.log('❌ Admin login endpoint error:', error.response?.data || error.message);
      }
    }
    
    // Test 2: Check if admin users exist in database
    console.log('\n3. Checking for admin users in database...');
    try {
      // Try to get admin dashboard (this might reveal if admin users exist)
      const dashboardResponse = await axios.get(`${API_URL}/api/admin/dashboard`);
      console.log('✅ Admin dashboard endpoint accessible');
    } catch (dashboardError) {
      console.log('❌ Admin dashboard error:', dashboardError.response?.status, dashboardError.response?.data?.error);
    }
    
    // Test 3: Check admin routes
    console.log('\n4. Testing admin route structure...');
    const adminRoutes = [
      '/api/admin/login',
      '/api/admin/dashboard', 
      '/api/admin/users',
      '/api/admin/bookings'
    ];
    
    for (const route of adminRoutes) {
      try {
        const response = await axios.get(`${API_URL}${route}`);
        console.log(`✅ ${route} - accessible`);
      } catch (error) {
        const status = error.response?.status;
        if (status === 401) {
          console.log(`✅ ${route} - exists (requires auth)`);
        } else if (status === 404) {
          console.log(`❌ ${route} - not found`);
        } else {
          console.log(`⚠️ ${route} - error ${status}`);
        }
      }
    }
    
    console.log('\n💡 SOLUTIONS:');
    console.log('1. If admin login endpoint exists but credentials fail:');
    console.log('   - Check server/scripts/seedUsers.js for admin user creation');
    console.log('   - Run: node server/scripts/seedUsers.js');
    console.log('2. If admin login endpoint is missing:');
    console.log('   - Check server/routes/admin.js');
    console.log('   - Verify admin routes are properly imported in server/index.js');
    console.log('3. Frontend admin login access:');
    console.log('   - URL: http://localhost:3000/admin-login');
    console.log('   - Should be accessible directly (not through module selector)');

  } catch (error) {
    console.error('❌ Error testing admin login:', error.message);
  }
}

testAdminLogin();