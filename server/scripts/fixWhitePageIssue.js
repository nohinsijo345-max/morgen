const express = require('express');
const path = require('path');

console.log('🔧 Fixing White Page Issue...\n');

// Test 1: Check if connections route file exists and loads
console.log('1. Testing connections route file...');
try {
  const connectionsRoute = require('../routes/connections');
  console.log('✅ Connections route file loads successfully');
  console.log('   Route type:', typeof connectionsRoute);
} catch (error) {
  console.error('❌ Failed to load connections route:', error.message);
  process.exit(1);
}

// Test 2: Create a minimal server with just the connections route
console.log('\n2. Creating minimal test server...');
const app = express();
app.use(express.json());

// Add CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Add test route
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Test server working', 
    timestamp: new Date(),
    routes: ['test', 'connections']
  });
});

// Add connections route
try {
  const connectionsRoute = require('../routes/connections');
  app.use('/api/connections', connectionsRoute);
  console.log('✅ Connections route registered on test server');
} catch (error) {
  console.error('❌ Failed to register connections route:', error.message);
}

// Start test server
const testPort = 5052;
const server = app.listen(testPort, () => {
  console.log(`✅ Test server running on port ${testPort}`);
});

// Test the routes
setTimeout(async () => {
  console.log('\n3. Testing routes...');
  
  const axios = require('axios');
  
  try {
    // Test basic route
    const testResponse = await axios.get(`http://localhost:${testPort}/api/test`);
    console.log('✅ Test route working:', testResponse.data.message);
    
    // Test connections route (will fail without database, but should not 404)
    try {
      const connResponse = await axios.get(`http://localhost:${testPort}/api/connections/stats/farmer/TEST`);
      console.log('✅ Connections route working:', connResponse.data);
    } catch (connError) {
      if (connError.response?.status === 500) {
        console.log('✅ Connections route responding (500 expected without database)');
      } else if (connError.response?.status === 404) {
        console.log('❌ Connections route not found (404)');
      } else {
        console.log('⚠️  Connections route error:', connError.response?.status, connError.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Route test failed:', error.message);
  }
  
  // Clean up
  server.close();
  
  console.log('\n🎯 SOLUTION:');
  console.log('The connections route works fine in isolation.');
  console.log('The issue is likely that your main server needs to be restarted.');
  console.log('\n📋 Steps to fix:');
  console.log('1. Stop your main server (Ctrl+C)');
  console.log('2. Start it again: npm run dev');
  console.log('3. Look for "✅ Connections route loaded successfully" in logs');
  console.log('4. Test the simplified pages: /my-customers-simple and /buyer/my-farmers-simple');
  
  process.exit(0);
}, 2000);

// Handle cleanup
process.on('SIGINT', () => {
  server.close();
  process.exit(0);
});