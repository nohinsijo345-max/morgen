const axios = require('axios');

const API_URL = 'http://localhost:5050';
const TEST_FARMER_ID = 'FAR-369';

const testQuestions = [
  'How to control pests in my rice field?',
  'What fertilizer should I use for better growth?',
  'My plants need more water, what irrigation method is best?',
  'I see some disease on my crops, how to treat it?',
  'Hello, can you help me with farming?'
];

async function testMultipleQuestions() {
  console.log('🧪 Testing Multiple AI Doctor Questions...\n');

  for (let i = 0; i < testQuestions.length; i++) {
    const question = testQuestions[i];
    
    try {
      console.log(`${i + 1}. Question: "${question}"`);
      
      const response = await axios.post(`${API_URL}/api/ai-doctor/chat/${TEST_FARMER_ID}/message`, {
        message: question,
        messageId: `test_multi_${Date.now()}_${i}`
      });

      const aiResponse = response.data.message.content;
      console.log(`   ✅ Response (${aiResponse.length} chars): ${aiResponse.substring(0, 100)}...`);
      console.log('');
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error(`   ❌ Failed: ${error.message}`);
    }
  }

  // Test stats after multiple questions
  try {
    const statsResponse = await axios.get(`${API_URL}/api/ai-doctor/stats/${TEST_FARMER_ID}`);
    console.log('📊 Final Stats:');
    console.log(`   Total Consultations: ${statsResponse.data.totalConsultations}`);
    console.log(`   Questions Asked: ${statsResponse.data.questionsAsked}`);
    console.log(`   Recent Topics: ${statsResponse.data.recentTopics.length} topics`);
    console.log(`   Is Active: ${statsResponse.data.isActive}`);
    
  } catch (error) {
    console.error('❌ Failed to get stats:', error.message);
  }
}

testMultipleQuestions();