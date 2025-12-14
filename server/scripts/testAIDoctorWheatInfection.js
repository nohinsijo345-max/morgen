const axios = require('axios');

const API_URL = 'http://localhost:5050';
const TEST_FARMER_ID = 'FAR-369';

async function testWheatInfectionQuery() {
  console.log('🧪 Testing AI Doctor - Wheat Infection Query');
  console.log('=' .repeat(50));

  try {
    // First, initialize chat session
    console.log('🔄 Initializing chat session...');
    await axios.get(`${API_URL}/api/ai-doctor/chat/${TEST_FARMER_ID}`);
    console.log('✅ Chat session initialized');

    // Test the specific wheat infection query
    const testMessage = 'my wheat as infection';
    
    console.log(`📝 Sending message: "${testMessage}"`);
    
    const response = await axios.post(`${API_URL}/api/ai-doctor/chat/${TEST_FARMER_ID}/message`, {
      message: testMessage,
      messageId: `test_${Date.now()}`
    });

    console.log('\n✅ AI Doctor Response:');
    console.log('-'.repeat(40));
    console.log(response.data.message.content);
    console.log('-'.repeat(40));
    
    console.log('\n📊 Session Stats:');
    console.log(`Questions Asked: ${response.data.sessionStats?.questionsAsked || 0}`);
    console.log(`Images Analyzed: ${response.data.sessionStats?.imagesAnalyzed || 0}`);

    // Test another variation
    console.log('\n🧪 Testing variation: "wheat disease problem"');
    
    const response2 = await axios.post(`${API_URL}/api/ai-doctor/chat/${TEST_FARMER_ID}/message`, {
      message: 'wheat disease problem',
      messageId: `test_${Date.now()}_2`
    });

    console.log('\n✅ AI Doctor Response 2:');
    console.log('-'.repeat(40));
    console.log(response2.data.message.content.substring(0, 300) + '...');
    console.log('-'.repeat(40));

    // Test rice infection
    console.log('\n🧪 Testing: "rice infection issue"');
    
    const response3 = await axios.post(`${API_URL}/api/ai-doctor/chat/${TEST_FARMER_ID}/message`, {
      message: 'rice infection issue',
      messageId: `test_${Date.now()}_3`
    });

    console.log('\n✅ AI Doctor Response 3:');
    console.log('-'.repeat(40));
    console.log(response3.data.message.content.substring(0, 300) + '...');
    console.log('-'.repeat(40));

    console.log('\n🎉 All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testWheatInfectionQuery();