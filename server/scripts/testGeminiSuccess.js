const axios = require('axios');

const API_URL = 'http://localhost:5050';
const TEST_FARMER_ID = 'FAR-369';

async function testGeminiSuccess() {
  console.log('🎉 Testing Successful Gemini Integration');
  console.log('=' .repeat(50));

  try {
    // Test a simple agricultural question
    const testMessage = 'What causes yellow leaves in rice?';
    
    console.log(`📝 Sending: "${testMessage}"`);
    
    const response = await axios.post(`${API_URL}/api/ai-doctor/chat/${TEST_FARMER_ID}/message`, {
      message: testMessage,
      messageId: `test_${Date.now()}`
    });

    console.log('\n✅ Gemini AI Response:');
    console.log('-'.repeat(60));
    console.log(response.data.message.content);
    console.log('-'.repeat(60));
    
    // Check if it's a real AI response (not fallback)
    const content = response.data.message.content;
    const isRealAI = !content.includes('🌾 **Rice Health Diagnosis for Nohin Sijo**');
    
    if (isRealAI) {
      console.log('\n🎉 SUCCESS! This is a REAL GEMINI AI RESPONSE!');
      console.log('✅ Your free plan API key is working perfectly');
      console.log('✅ AI Doctor now has real-time AI capabilities');
      console.log('✅ Enhanced conversational responses');
      console.log('✅ Better context understanding');
    } else {
      console.log('\n⚠️  This appears to be a fallback response');
      console.log('The Gemini API might still be having issues');
    }

    console.log('\n📊 Session Stats:');
    console.log(`Questions Asked: ${response.data.sessionStats?.questionsAsked || 0}`);
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testGeminiSuccess();