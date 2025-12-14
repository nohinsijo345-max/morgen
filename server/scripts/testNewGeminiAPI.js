const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function testNewGeminiAPI() {
  console.log('🔍 Testing New Gemini API Key...\n');

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    console.log('API Key loaded:', process.env.GEMINI_API_KEY ? 'Yes' : 'No');
    console.log('API Key length:', process.env.GEMINI_API_KEY?.length || 0);
    
    // Test with the latest model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
    
    const result = await model.generateContent('What causes yellow leaves in rice plants?');
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ Gemini API is working!');
    console.log('Response length:', text.length);
    console.log('Response preview:', text.substring(0, 200) + '...');
    
  } catch (error) {
    console.error('❌ Gemini API test failed:', error.message);
    
    // Try alternative model names
    const modelsToTry = [
      'gemini-1.5-flash',
      'gemini-pro',
      'gemini-1.0-pro'
    ];
    
    for (const modelName of modelsToTry) {
      try {
        console.log(`\nTrying model: ${modelName}`);
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: modelName });
        
        const result = await model.generateContent('Test message');
        const response = await result.response;
        const text = response.text();
        
        console.log(`✅ ${modelName} works!`);
        console.log('Response:', text.substring(0, 100) + '...');
        break;
        
      } catch (modelError) {
        console.log(`❌ ${modelName} failed: ${modelError.message}`);
      }
    }
  }
}

testNewGeminiAPI();