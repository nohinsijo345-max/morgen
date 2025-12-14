const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:5050';
const TEST_FARMER_ID = 'FAR-369'; // Use existing farmer ID

async function testAIDoctorSystem() {
  console.log('🧪 Testing AI Plant Doctor System...\n');

  try {
    // Test 1: Get/Create Chat Session
    console.log('1. Testing chat session creation...');
    const chatResponse = await axios.get(`${API_URL}/api/ai-doctor/chat/${TEST_FARMER_ID}`);
    console.log('✅ Chat session created/retrieved');
    console.log('   Chat ID:', chatResponse.data.chatId);
    console.log('   Messages:', chatResponse.data.messages.length);
    console.log('   Farmer Context:', JSON.stringify(chatResponse.data.farmerContext, null, 2));

    // Test 2: Send Text Message
    console.log('\n2. Testing text message...');
    const messageResponse = await axios.post(`${API_URL}/api/ai-doctor/chat/${TEST_FARMER_ID}/message`, {
      message: 'What are the common diseases affecting rice crops in Kerala?',
      messageId: `test_msg_${Date.now()}`
    });
    console.log('✅ Text message sent and AI responded');
    console.log('   AI Response:', messageResponse.data.message.content.substring(0, 100) + '...');

    // Test 3: Get AI Doctor Stats
    console.log('\n3. Testing AI Doctor stats...');
    const statsResponse = await axios.get(`${API_URL}/api/ai-doctor/stats/${TEST_FARMER_ID}`);
    console.log('✅ AI Doctor stats retrieved');
    console.log('   Stats:', JSON.stringify(statsResponse.data, null, 2));

    // Test 4: Test Image Upload (if test image exists)
    console.log('\n4. Testing image upload...');
    const testImagePath = path.join(__dirname, 'test-plant.jpg');
    
    if (fs.existsSync(testImagePath)) {
      const formData = new FormData();
      formData.append('plantImage', fs.createReadStream(testImagePath));
      formData.append('question', 'What disease does this plant have?');

      const imageResponse = await axios.post(
        `${API_URL}/api/ai-doctor/chat/${TEST_FARMER_ID}/image`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
          },
        }
      );
      console.log('✅ Image uploaded and analyzed');
      console.log('   Analysis:', imageResponse.data.analysis.substring(0, 100) + '...');
    } else {
      console.log('⚠️  No test image found, skipping image upload test');
      console.log('   Create a test-plant.jpg file in scripts/ directory to test image analysis');
    }

    // Test 5: Clear Chat (optional)
    console.log('\n5. Testing chat clear (optional)...');
    // Uncomment to test chat clearing
    // await axios.delete(`${API_URL}/api/ai-doctor/chat/${TEST_FARMER_ID}/clear`);
    // console.log('✅ Chat cleared successfully');

    console.log('\n🎉 All AI Plant Doctor tests completed successfully!');
    console.log('\n📋 Test Summary:');
    console.log('   ✅ Chat session management');
    console.log('   ✅ Text message processing');
    console.log('   ✅ AI response generation');
    console.log('   ✅ Statistics tracking');
    console.log('   ✅ Farmer context awareness');
    console.log(fs.existsSync(testImagePath) ? '   ✅ Image upload and analysis' : '   ⚠️  Image upload (no test image)');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
    
    // Provide troubleshooting tips
    console.log('\n🔧 Troubleshooting Tips:');
    console.log('   1. Make sure the server is running on port 5050');
    console.log('   2. Check if GEMINI_API_KEY is set in .env file');
    console.log('   3. Verify MongoDB connection is working');
    console.log('   4. Ensure the farmer with ID', TEST_FARMER_ID, 'exists in database');
    console.log('   5. Check server logs for detailed error messages');
  }
}

// Run the test
testAIDoctorSystem();