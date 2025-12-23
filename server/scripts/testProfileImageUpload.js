const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function testProfileImageUpload() {
  try {
    console.log('🧪 Testing profile image upload...');
    
    const API_URL = 'http://localhost:5050';
    const farmerId = 'MGN001'; // Test with existing farmer
    
    // Create a simple test image (1x1 pixel PNG)
    const testImageBuffer = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
      0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0xD7, 0x63, 0xF8, 0x00, 0x00, 0x00,
      0x01, 0x00, 0x01, 0x5C, 0xC2, 0x5D, 0xB4, 0x00, 0x00, 0x00, 0x00, 0x49,
      0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
    ]);
    
    // Save test image temporarily
    const testImagePath = path.join(__dirname, 'test-image.png');
    fs.writeFileSync(testImagePath, testImageBuffer);
    
    // Create form data
    const formData = new FormData();
    formData.append('profileImage', fs.createReadStream(testImagePath), {
      filename: 'test-image.png',
      contentType: 'image/png'
    });
    
    console.log('📤 Uploading test image for farmerId:', farmerId);
    
    // Test the upload
    const response = await axios.post(
      `${API_URL}/api/auth/profile-image/${farmerId}`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
        },
        timeout: 10000
      }
    );
    
    console.log('✅ Upload successful!');
    console.log('Response:', response.data);
    
    // Clean up test image
    fs.unlinkSync(testImagePath);
    
    // Test image access
    if (response.data.profileImage) {
      const imageUrl = `${API_URL}${response.data.profileImage}`;
      console.log('🔗 Testing image access:', imageUrl);
      
      const imageResponse = await axios.get(imageUrl, { timeout: 5000 });
      console.log('✅ Image accessible! Status:', imageResponse.status);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    
    // Clean up test image if it exists
    const testImagePath = path.join(__dirname, 'test-image.png');
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath);
    }
  }
}

testProfileImageUpload();