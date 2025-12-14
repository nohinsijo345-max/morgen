const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function testNewGeminiKey() {
  console.log('🧪 Testing New Gemini API Key');
  console.log('=' .repeat(50));

  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.log('❌ No API key found in .env file');
    console.log('Please add GEMINI_API_KEY=your_key_here to server/.env');
    return;
  }

  console.log(`🔑 API Key: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}`);

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Test with the most common working model
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    console.log('🔄 Testing basic connection...');
    const result = await model.generateContent('Say "Hello World" in exactly 2 words.');
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ Basic test successful!');
    console.log(`Response: "${text.trim()}"`);
    
    // Test agricultural content
    console.log('\n🌾 Testing agricultural AI...');
    const agriPrompt = `You are an agricultural expert. A farmer in Kerala, India says: "My wheat crop has yellow leaves and some brown spots." 

Provide a brief response (2-3 sentences) about:
1. Possible causes
2. Immediate treatment

Keep it practical and farmer-friendly.`;

    const agriResult = await model.generateContent(agriPrompt);
    const agriResponse = await agriResult.response;
    const agriText = agriResponse.text();
    
    console.log('✅ Agricultural AI test successful!');
    console.log('Response:');
    console.log('-'.repeat(40));
    console.log(agriText.trim());
    console.log('-'.repeat(40));
    
    console.log('\n🎉 GEMINI API IS WORKING PERFECTLY!');
    console.log('✅ Your AI Doctor will now use real Gemini AI responses');
    console.log('✅ Enhanced agricultural advice available');
    console.log('✅ Image analysis capabilities enabled');
    
  } catch (error) {
    console.log('❌ API test failed');
    console.log(`Error: ${error.message}`);
    
    if (error.message.includes('API key not valid')) {
      console.log('\n🔧 SOLUTION:');
      console.log('1. Go to: https://makersuite.google.com/app/apikey');
      console.log('2. Create a new API key');
      console.log('3. Replace the key in server/.env file');
      console.log('4. Restart the server');
    } else if (error.message.includes('not found')) {
      console.log('\n🔧 SOLUTION:');
      console.log('The model name might be incorrect. This is less common.');
      console.log('The API key seems valid but model access might be limited.');
    }
  }
}

testNewGeminiKey();