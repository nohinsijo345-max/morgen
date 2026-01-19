const axios = require('axios');

const testPinCodeCropFiltering = async () => {
  try {
    const API_URL = 'http://localhost:5050';
    
    console.log('🧪 Testing pinCode-based crop filtering...\n');
    
    // Test 1: Commercial buyer (should see all crops)
    console.log('1️⃣ Testing commercial buyer (should see all crops):');
    try {
      const commercialResponse = await axios.get(`${API_URL}/api/crops/available?buyerType=commercial`);
      console.log(`✅ Commercial buyer sees ${commercialResponse.data.crops.length} crops`);
    } catch (error) {
      console.log('❌ Error fetching crops for commercial buyer:', error.message);
    }
    
    // Test 2: Public buyer with pinCode
    console.log('\n2️⃣ Testing public buyer with pinCode:');
    const testPinCode = '682001'; // Example pinCode
    try {
      const publicResponse = await axios.get(`${API_URL}/api/crops/available?buyerType=public&pinCode=${testPinCode}&state=Kerala&district=Ernakulam`);
      console.log(`✅ Public buyer (PIN ${testPinCode}) sees ${publicResponse.data.crops.length} crops`);
      
      if (publicResponse.data.crops.length > 0) {
        console.log('📋 Sample crops:');
        publicResponse.data.crops.slice(0, 3).forEach((crop, index) => {
          console.log(`   ${index + 1}. ${crop.name || crop.cropName} by ${crop.farmerName}`);
        });
      }
    } catch (error) {
      console.log('❌ Error fetching crops for public buyer:', error.message);
    }
    
    // Test 3: Public buyer without pinCode (fallback to district)
    console.log('\n3️⃣ Testing public buyer without pinCode (district fallback):');
    try {
      const districtResponse = await axios.get(`${API_URL}/api/crops/available?buyerType=public&state=Kerala&district=Ernakulam`);
      console.log(`✅ Public buyer (district fallback) sees ${districtResponse.data.crops.length} crops`);
    } catch (error) {
      console.log('❌ Error fetching crops with district fallback:', error.message);
    }
    
    // Test 4: Check if server is running
    console.log('\n4️⃣ Checking server status:');
    try {
      const healthResponse = await axios.get(`${API_URL}/api/crops/available`);
      console.log('✅ Server is running and responding');
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.log('❌ Server is not running. Please start the server with: npm run dev');
      } else {
        console.log('❌ Server error:', error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

// Run the test
testPinCodeCropFiltering();