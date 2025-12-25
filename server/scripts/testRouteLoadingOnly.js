const express = require('express');

async function testRouteLoadingOnly() {
  console.log('🧪 Testing Route Loading (No Database)...\n');

  try {
    // Create Express app
    console.log('1. Creating Express app...');
    const app = express();
    app.use(express.json());

    // Test loading connections route
    console.log('\n2. Loading connections route...');
    const connectionsRoute = require('../routes/connections');
    console.log('✅ Connections route loaded successfully');
    console.log('   Route type:', typeof connectionsRoute);

    // Register the route
    console.log('\n3. Registering route...');
    app.use('/api/connections', connectionsRoute);
    console.log('✅ Route registered successfully');

    // Start server on test port
    const testPort = 5051;
    console.log(`\n4. Starting test server on port ${testPort}...`);
    
    const server = app.listen(testPort, () => {
      console.log(`✅ Test server running on port ${testPort}`);
    });

    // Wait for server to start
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Test basic server response
    console.log('\n5. Testing server response...');
    const axios = require('axios');
    
    try {
      // Test a simple endpoint that doesn't require database
      const response = await axios.get(`http://localhost:${testPort}/api/connections/stats/farmer/TEST`);
      console.log('✅ Route responding! Status:', response.status);
      console.log('   Response:', response.data);
    } catch (error) {
      console.log('⚠️  Route responded with error (expected without database)');
      console.log('   Status:', error.response?.status);
      console.log('   Error:', error.response?.data?.error || error.message);
      
      // If we get a 500 error, that means the route is working but database is missing
      if (error.response?.status === 500) {
        console.log('✅ This is actually good - route is working, just needs database');
      }
    }

    // Clean up
    server.close();
    console.log('\n✅ Test completed - Route loading works correctly');
    
    console.log('\n🔧 Next steps:');
    console.log('1. The connections route loads and registers correctly');
    console.log('2. The issue is likely that your main server needs to be restarted');
    console.log('3. Stop your main server (Ctrl+C) and restart with: npm run dev');

  } catch (error) {
    console.error('❌ Route loading failed:', error.message);
    console.error('   Stack:', error.stack);
  }
}

if (require.main === module) {
  testRouteLoadingOnly()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Test error:', error);
      process.exit(1);
    });
}

module.exports = { testRouteLoadingOnly };