const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:5050';

async function testFullImageFlow() {
  try {
    console.log('🧪 Testing Full Image Upload Flow\n');

    // Step 1: Fetch current images
    console.log('1️⃣  Fetching current images...');
    const currentImages = await axios.get(`${API_URL}/api/admin/images`);
    console.log('✅ Current images:', currentImages.data);

    // Step 2: Simulate uploading a new image (we'll use a test path)
    console.log('\n2️⃣  Simulating image upload...');
    const testImagePath = 'http://localhost:5050/uploads/images/test-' + Date.now() + '.jpg';
    console.log('📤 Test image path:', testImagePath);

    // Step 3: Save the new image path to database
    console.log('\n3️⃣  Saving new image to database...');
    const saveResponse = await axios.post(`${API_URL}/api/admin/images`, {
      loginPage: testImagePath,
      registerPage: currentImages.data.registerPage,
      forgotPasswordPage: currentImages.data.forgotPasswordPage
    });
    console.log('✅ Save response:', saveResponse.data);

    // Step 4: Fetch images again to verify persistence
    console.log('\n4️⃣  Fetching images again to verify...');
    const updatedImages = await axios.get(`${API_URL}/api/admin/images`);
    console.log('✅ Updated images:', updatedImages.data);

    // Step 5: Verify the change persisted
    if (updatedImages.data.loginPage === testImagePath) {
      console.log('\n✅ SUCCESS: Image persisted correctly!');
      console.log('   Old:', currentImages.data.loginPage);
      console.log('   New:', updatedImages.data.loginPage);
    } else {
      console.log('\n❌ FAILED: Image did not persist');
      console.log('   Expected:', testImagePath);
      console.log('   Got:', updatedImages.data.loginPage);
    }

    // Step 6: Restore original image
    console.log('\n5️⃣  Restoring original image...');
    await axios.post(`${API_URL}/api/admin/images`, {
      loginPage: currentImages.data.loginPage,
      registerPage: currentImages.data.registerPage,
      forgotPasswordPage: currentImages.data.forgotPasswordPage
    });
    console.log('✅ Original images restored');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

testFullImageFlow();
