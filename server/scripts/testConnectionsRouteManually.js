const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

async function testConnectionsRouteManually() {
  console.log('🧪 Testing Connections Route Manually...\n');

  try {
    // Connect to database
    console.log('1. Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Database connected');

    // Create Express app
    console.log('\n2. Creating Express app...');
    const app = express();
    app.use(express.json());

    // Load and register connections route
    console.log('\n3. Loading connections route...');
    const connectionsRoute = require('../routes/connections');
    app.use('/api/connections', connectionsRoute);
    console.log('✅ Connections route registered');

    // Start server on different port
    const testPort = 5051;
    const server = app.listen(testPort, () => {
      console.log(`✅ Test server running on port ${testPort}`);
    });

    // Wait a moment for server to start
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Test the route
    console.log('\n4. Testing connections endpoint...');
    const axios = require('axios');
    
    try {
      const response = await axios.get(`http://localhost:${testPort}/api/connections/stats/farmer/TEST`);
      console.log('✅ Route working! Response:', response.data);
    } catch (error) {
      console.log('❌ Route test failed:', error.response?.status, error.response?.statusText);
      if (error.response?.data) {
        console.log('   Error data:', error.response.data);
      }
    }

    // Clean up
    server.close();
    await mongoose.disconnect();
    console.log('\n✅ Test completed');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  testConnectionsRouteManually()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Test error:', error);
      process.exit(1);
    });
}

module.exports = { testConnectionsRouteManually };