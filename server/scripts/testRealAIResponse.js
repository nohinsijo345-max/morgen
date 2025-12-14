const axios = require('axios');

const API_URL = 'http://localhost:5050';
const TEST_FARMER_ID = 'FAR-369';

async function testRealAIResponse() {
  console.log('🤖 Testing Real AI Response...\n');

  try {
    // Send a real agricultural question
    console.log('Sending question: "My rice plants have yellow leaves and brown spots. What could be the problem?"');
    
    const response = await axios.post(`${API_URL}/api/ai-doctor/chat/${TEST_FARMER_ID}/message`, {
      message: 'My rice plants have yellow leaves and brown spots. What could be the problem?',
      messageId: `test_real_${Date.now()}`
    });

    console.log('\n✅ AI Response received:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(response.data.message.content);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Check if response is agriculture-related
    const content = response.data.message.content.toLowerCase();
    const agricultureKeywords = ['plant', 'crop', 'disease', 'rice', 'leaf', 'soil', 'fertilizer', 'pest', 'treatment'];
    const hasAgricultureContent = agricultureKeywords.some(keyword => content.includes(keyword));

    if (hasAgricultureContent) {
      console.log('\n✅ Response is agriculture-focused');
    } else {
      console.log('\n⚠️  Response may not be agriculture-focused');
    }

    console.log('\n📊 Response Analysis:');
    console.log('   Length:', response.data.message.content.length, 'characters');
    console.log('   Contains plant keywords:', hasAgricultureContent);
    console.log('   Message ID:', response.data.message.id);
    console.log('   Timestamp:', response.data.message.timestamp);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

testRealAIResponse();