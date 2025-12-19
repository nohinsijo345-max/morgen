const axios = require('axios');

async function checkServerRoutes() {
  console.log('🔍 Checking Server Routes...\n');
  
  const API_URL = 'http://localhost:5050';
  
  const routes = [
    { method: 'GET', path: '/api/auth/next-farmer-id', description: 'Next Farmer ID' },
    { method: 'POST', path: '/api/auth/login', description: 'Login', data: { farmerId: 'FAR-369', pin: '1234' } },
    { method: 'GET', path: '/api/auth/profile/FAR-369', description: 'Profile Fetch' },
    { method: 'GET', path: '/api/profile/pending-request/FAR-369', description: 'Pending Request Check' }
  ];
  
  for (const route of routes) {
    try {
      console.log(`Testing ${route.method} ${route.path}...`);
      
      let response;
      if (route.method === 'POST') {
        response = await axios.post(`${API_URL}${route.path}`, route.data);
      } else {
        response = await axios.get(`${API_URL}${route.path}`);
      }
      
      console.log(`✅ ${route.description}: ${response.status}`);
      
    } catch (error) {
      console.log(`❌ ${route.description}: ${error.response?.status || 'CONNECTION_ERROR'}`);
      console.log(`   Error: ${error.response?.data?.error || error.message}`);
      
      if (error.response?.status === 404) {
        console.log(`   🚨 ROUTE NOT FOUND: ${route.path}`);
      }
    }
    console.log('');
  }
  
  // Check if server is running at all
  try {
    const response = await axios.get(`${API_URL}/`);
    console.log('✅ Server root accessible');
  } catch (error) {
    console.log('❌ Server not accessible at all');
    console.log('🚨 Make sure server is running: cd server && npm run dev');
  }
}

checkServerRoutes();