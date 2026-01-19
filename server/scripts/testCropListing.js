const axios = require('axios');

const API_URL = 'http://localhost:5050';

async function testCropListing() {
  console.log('🧪 Testing Crop Listing Creation\n');

  try {
    // Test 1: Valid crop listing
    console.log('Test 1: Create valid crop listing');
    const response1 = await axios.post(`${API_URL}/api/crops/create`, {
      farmerId: 'MG001',
      farmerName: 'Test Farmer',
      cropName: 'Tomato',
      category: 'vegetables',
      quantity: 10,
      unit: 'kg',
      pricePerUnit: 50,
      basePrice: 50,
      quality: 'B',
      harvestDate: '2026-01-30',
      description: 'Super Fresh',
      location: {
        state: 'Kerala',
        district: 'Ernakulam',
        city: 'Kochi'
      }
    });
    console.log('✅ Success:', response1.data);
    console.log('   Crop ID:', response1.data.crop._id);
    console.log('   Crop Name:', response1.data.crop.name);
    console.log('   Category:', response1.data.crop.category);
    console.log('   Quantity:', response1.data.crop.quantity, response1.data.crop.unit);
    console.log('   Price: ₹' + response1.data.crop.pricePerUnit + '/' + response1.data.crop.unit);
    console.log('');

    // Test 2: Missing required field (category)
    console.log('Test 2: Missing category field');
    try {
      await axios.post(`${API_URL}/api/crops/create`, {
        farmerId: 'MG001',
        farmerName: 'Test Farmer',
        cropName: 'Potato',
        quantity: 20,
        unit: 'kg',
        pricePerUnit: 30,
        harvestDate: '2026-02-15',
        description: 'Fresh potatoes'
      });
      console.log('❌ Should have failed but succeeded');
    } catch (err) {
      console.log('✅ Correctly rejected:', err.response?.data?.error);
      console.log('   Required fields:', err.response?.data?.required);
    }
    console.log('');

    // Test 3: Missing required field (harvestDate)
    console.log('Test 3: Missing harvestDate field');
    try {
      await axios.post(`${API_URL}/api/crops/create`, {
        farmerId: 'MG001',
        farmerName: 'Test Farmer',
        cropName: 'Carrot',
        category: 'vegetables',
        quantity: 15,
        unit: 'kg',
        pricePerUnit: 40,
        description: 'Fresh carrots'
      });
      console.log('❌ Should have failed but succeeded');
    } catch (err) {
      console.log('✅ Correctly rejected:', err.response?.data?.error);
    }
    console.log('');

    // Test 4: Get farmer's crops
    console.log('Test 4: Get farmer\'s crops');
    const response4 = await axios.get(`${API_URL}/api/crops/farmer/MG001`);
    console.log('✅ Success: Found', response4.data.crops.length, 'crops');
    response4.data.crops.forEach((crop, index) => {
      console.log(`   ${index + 1}. ${crop.name} - ${crop.quantity} ${crop.unit} @ ₹${crop.pricePerUnit}/${crop.unit}`);
    });
    console.log('');

    // Test 5: Get available crops
    console.log('Test 5: Get available crops');
    const response5 = await axios.get(`${API_URL}/api/crops/available`);
    console.log('✅ Success: Found', response5.data.crops.length, 'available crops');
    console.log('');

    // Test 6: Delete the test crop
    if (response1.data.crop._id) {
      console.log('Test 6: Delete test crop');
      await axios.delete(`${API_URL}/api/crops/${response1.data.crop._id}`);
      console.log('✅ Test crop deleted successfully');
      console.log('');
    }

    console.log('🎉 All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Response:', error.response.data);
    }
  }
}

testCropListing();
