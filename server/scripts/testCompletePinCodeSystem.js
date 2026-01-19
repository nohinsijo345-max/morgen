const axios = require('axios');

const testCompletePinCodeSystem = async () => {
  try {
    const API_URL = 'http://localhost:5050';
    
    console.log('🧪 Testing Complete PinCode-based Crop Filtering System...\n');
    
    // Test 1: Check server connectivity
    console.log('1️⃣ Testing server connectivity...');
    try {
      const healthCheck = await axios.get(`${API_URL}/api/crops/available`);
      console.log('✅ Server is running and responding');
      console.log(`📊 Total available crops: ${healthCheck.data.crops.length}`);
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.log('❌ Server is not running. Please start the server first.');
        console.log('💡 Run: npm run dev (in server directory)');
        return;
      } else {
        console.log('❌ Server error:', error.message);
        return;
      }
    }
    
    // Test 2: Commercial buyer (should see all crops)
    console.log('\n2️⃣ Testing commercial buyer access...');
    try {
      const commercialResponse = await axios.get(`${API_URL}/api/crops/available?buyerType=commercial`);
      console.log(`✅ Commercial buyers see ${commercialResponse.data.crops.length} total crops`);
      
      if (commercialResponse.data.crops.length > 0) {
        console.log('📋 Sample crops for commercial buyers:');
        commercialResponse.data.crops.slice(0, 3).forEach((crop, index) => {
          console.log(`   ${index + 1}. ${crop.name || crop.cropName} by ${crop.farmerName} - ${crop.location?.pinCode || 'No PIN'}`);
        });
      }
    } catch (error) {
      console.log('❌ Error testing commercial buyer:', error.response?.data?.error || error.message);
    }
    
    // Test 3: Public buyer with specific pinCode
    console.log('\n3️⃣ Testing public buyer with pinCode filtering...');
    const testPinCodes = ['682001', '683101', '680001']; // Test different pinCodes
    
    for (const pinCode of testPinCodes) {
      try {
        const publicResponse = await axios.get(`${API_URL}/api/crops/available?buyerType=public&pinCode=${pinCode}&state=Kerala&district=Ernakulam`);
        console.log(`📍 PIN ${pinCode}: ${publicResponse.data.crops.length} crops available`);
        
        if (publicResponse.data.crops.length > 0) {
          publicResponse.data.crops.forEach((crop, index) => {
            console.log(`   ${index + 1}. ${crop.name || crop.cropName} by ${crop.farmerName}`);
          });
        } else {
          console.log('   No crops found for this pinCode');
        }
      } catch (error) {
        console.log(`❌ Error testing PIN ${pinCode}:`, error.response?.data?.error || error.message);
      }
    }
    
    // Test 4: Public buyer without pinCode (district fallback)
    console.log('\n4️⃣ Testing district-based fallback...');
    try {
      const districtResponse = await axios.get(`${API_URL}/api/crops/available?buyerType=public&state=Kerala&district=Ernakulam`);
      console.log(`✅ District fallback shows ${districtResponse.data.crops.length} crops`);
    } catch (error) {
      console.log('❌ Error testing district fallback:', error.response?.data?.error || error.message);
    }
    
    // Test 5: Edge cases
    console.log('\n5️⃣ Testing edge cases...');
    
    // Test with non-existent pinCode
    try {
      const nonExistentResponse = await axios.get(`${API_URL}/api/crops/available?buyerType=public&pinCode=999999&state=Kerala&district=Ernakulam`);
      console.log(`📍 Non-existent PIN (999999): ${nonExistentResponse.data.crops.length} crops (should fallback to district)`);
    } catch (error) {
      console.log('❌ Error testing non-existent pinCode:', error.response?.data?.error || error.message);
    }
    
    // Test without any location parameters
    try {
      const noLocationResponse = await axios.get(`${API_URL}/api/crops/available?buyerType=public`);
      console.log(`📍 No location params: ${noLocationResponse.data.crops.length} crops (should show all)`);
    } catch (error) {
      console.log('❌ Error testing no location params:', error.response?.data?.error || error.message);
    }
    
    console.log('\n🎉 PinCode filtering system test completed!');
    console.log('\n💡 Expected behavior:');
    console.log('- Commercial buyers: See ALL available crops');
    console.log('- Public buyers with pinCode: See crops from farmers in SAME pinCode');
    console.log('- Public buyers without pinCode: See crops from farmers in SAME district');
    console.log('- If no farmers in pinCode: Fallback to district-based filtering');
    
  } catch (error) {
    console.error('❌ Test system error:', error.message);
  }
};

// Run the test
testCompletePinCodeSystem();