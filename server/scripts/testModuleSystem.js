const axios = require('axios');

const API_BASE_URL = 'http://localhost:5050';

async function testModuleSystem() {
  console.log('🧪 Testing Module System...\n');

  try {
    // Test 1: Get module configuration
    console.log('1. Testing module configuration...');
    const configResponse = await axios.get(`${API_BASE_URL}/api/modules/config`);
    console.log('✅ Module config loaded successfully');
    console.log(`   Found ${Object.keys(configResponse.data.data).length} modules\n`);

    // Test 2: Track module access
    console.log('2. Testing module access tracking...');
    const trackResponse = await axios.post(`${API_BASE_URL}/api/modules/track-access`, {
      moduleId: 'farmer',
      userAgent: 'Test Agent',
      timestamp: new Date().toISOString()
    });
    console.log('✅ Module access tracked successfully');
    console.log(`   Farmer module visits: ${trackResponse.data.data.totalVisits}\n`);

    // Test 3: Track multiple modules
    console.log('3. Testing multiple module tracking...');
    const modules = ['buyer', 'government', 'public', 'driver'];
    for (const moduleId of modules) {
      await axios.post(`${API_BASE_URL}/api/modules/track-access`, {
        moduleId,
        userAgent: 'Test Agent',
        timestamp: new Date().toISOString()
      });
    }
    console.log('✅ Multiple modules tracked successfully\n');

    // Test 4: Get analytics
    console.log('4. Testing analytics retrieval...');
    const analyticsResponse = await axios.get(`${API_BASE_URL}/api/modules/analytics`);
    console.log('✅ Analytics retrieved successfully');
    console.log(`   Total visits: ${analyticsResponse.data.data.summary.totalVisits}`);
    console.log(`   Most popular: ${analyticsResponse.data.data.summary.mostPopular}\n`);

    // Test 5: Check module health
    console.log('5. Testing module health check...');
    const healthResponse = await axios.get(`${API_BASE_URL}/api/modules/health`);
    console.log('✅ Health check completed successfully');
    console.log(`   Overall status: ${healthResponse.data.data.overall}\n`);

    // Test 6: Update module status
    console.log('6. Testing module status update...');
    const updateResponse = await axios.put(`${API_BASE_URL}/api/modules/config/farmer`, {
      enabled: true,
      maintenanceMode: false
    });
    console.log('✅ Module status updated successfully\n');

    console.log('🎉 All module system tests passed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testModuleSystem();
}

module.exports = testModuleSystem;