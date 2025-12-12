const axios = require('axios');

async function testDriverEndpoints() {
  const API_URL = 'http://localhost:5050';
  
  console.log('🔍 Testing Driver Portal Endpoints...\n');

  try {
    // Test if server is running
    console.log('1. Testing server connection...');
    const healthCheck = await axios.get(`${API_URL}/api/dashboard/health`).catch(() => null);
    if (!healthCheck) {
      console.log('❌ Server is not running or not accessible at http://localhost:5050');
      console.log('Please start the server with: npm start (in server directory)');
      return;
    }
    console.log('✅ Server is running');

    // Test driver routes base path
    console.log('\n2. Testing driver routes availability...');
    
    // Test a simple driver route (dashboard)
    try {
      const driverTest = await axios.get(`${API_URL}/api/driver/dashboard/DRV001`).catch(err => {
        console.log('Driver route test error:', err.response?.status, err.response?.statusText);
        return null;
      });
      if (driverTest) {
        console.log('✅ Driver routes are accessible');
      } else {
        console.log('❌ Driver routes may not be properly mounted');
      }
    } catch (error) {
      console.log('❌ Error testing driver routes:', error.message);
    }

    // Test the specific accept endpoint structure
    console.log('\n3. Testing accept endpoint structure...');
    
    // This should return 404 with proper error message if endpoint exists but booking doesn't
    try {
      const acceptTest = await axios.patch(`${API_URL}/api/driver/orders/TEST123/accept`, {
        driverId: 'DRV001'
      }).catch(err => err.response);
      
      if (acceptTest && acceptTest.status === 404) {
        console.log('✅ Accept endpoint exists (returned 404 for non-existent booking)');
      } else if (acceptTest && acceptTest.status === 500) {
        console.log('⚠️ Accept endpoint exists but has server error');
      } else {
        console.log('❌ Accept endpoint may not exist or has unexpected response');
      }
    } catch (error) {
      console.log('❌ Error testing accept endpoint:', error.message);
    }

    // Test the specific reject endpoint structure
    console.log('\n4. Testing reject endpoint structure...');
    
    try {
      const rejectTest = await axios.patch(`${API_URL}/api/driver/orders/TEST123/reject`, {
        driverId: 'DRV001',
        reason: 'Test reason'
      }).catch(err => err.response);
      
      if (rejectTest && rejectTest.status === 404) {
        console.log('✅ Reject endpoint exists (returned 404 for non-existent booking)');
      } else if (rejectTest && rejectTest.status === 500) {
        console.log('⚠️ Reject endpoint exists but has server error');
      } else {
        console.log('❌ Reject endpoint may not exist or has unexpected response');
      }
    } catch (error) {
      console.log('❌ Error testing reject endpoint:', error.message);
    }

    // Test admin accept endpoint
    console.log('\n5. Testing admin accept endpoint...');
    
    try {
      const adminAcceptTest = await axios.patch(`${API_URL}/api/transport/bookings/TEST123/admin-accept`).catch(err => err.response);
      
      if (adminAcceptTest && adminAcceptTest.status === 404) {
        console.log('✅ Admin accept endpoint exists (returned 404 for non-existent booking)');
      } else if (adminAcceptTest && adminAcceptTest.status === 500) {
        console.log('⚠️ Admin accept endpoint exists but has server error');
      } else {
        console.log('❌ Admin accept endpoint may not exist or has unexpected response');
      }
    } catch (error) {
      console.log('❌ Error testing admin accept endpoint:', error.message);
    }

    console.log('\n📋 Endpoint Summary:');
    console.log('Driver Accept: PATCH /api/driver/orders/:bookingId/accept');
    console.log('Driver Reject: PATCH /api/driver/orders/:bookingId/reject');
    console.log('Admin Accept: PATCH /api/transport/bookings/:bookingId/admin-accept');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testDriverEndpoints();