const express = require('express');
const path = require('path');

// Test if the connections route can be loaded
console.log('🔍 Testing Route Registration...\n');

try {
  console.log('1. Testing connections route file...');
  const connectionsRoute = require('../routes/connections');
  console.log('✅ Connections route file loads successfully');
  console.log('   Route type:', typeof connectionsRoute);
  
  console.log('\n2. Testing route registration...');
  const app = express();
  app.use('/api/connections', connectionsRoute);
  console.log('✅ Route registration successful');
  
  console.log('\n3. Checking route file path...');
  const routePath = path.join(__dirname, '../routes/connections.js');
  console.log('   Route path:', routePath);
  
  const fs = require('fs');
  if (fs.existsSync(routePath)) {
    console.log('✅ Route file exists');
    const stats = fs.statSync(routePath);
    console.log('   File size:', stats.size, 'bytes');
    console.log('   Last modified:', stats.mtime);
  } else {
    console.log('❌ Route file does not exist');
  }
  
  console.log('\n4. Testing individual route functions...');
  // Test if the route has the expected endpoints
  const routeStack = connectionsRoute.stack || [];
  console.log('   Number of routes defined:', routeStack.length);
  
  if (routeStack.length > 0) {
    routeStack.forEach((layer, index) => {
      const route = layer.route;
      if (route) {
        const methods = Object.keys(route.methods).join(', ').toUpperCase();
        console.log(`   Route ${index + 1}: ${methods} ${route.path}`);
      }
    });
  }
  
} catch (error) {
  console.error('❌ Error testing route registration:', error.message);
  console.error('   Stack:', error.stack);
  
  if (error.code === 'MODULE_NOT_FOUND') {
    console.log('\n💡 Possible solutions:');
    console.log('   1. Check if connections.js file exists in routes folder');
    console.log('   2. Check for syntax errors in connections.js');
    console.log('   3. Check if all required dependencies are installed');
  }
}

console.log('\n🔧 Next steps:');
console.log('1. Restart the server: npm run dev');
console.log('2. Check server logs for any startup errors');
console.log('3. Test the route after server restart');