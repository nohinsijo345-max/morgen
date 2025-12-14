const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function testGeminiAPI() {
  console.log('🧪 Testing Gemini API Integration');
  console.log('=' .repeat(50));

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    console.log('🔑 API Key:', process.env.GEMINI_API_KEY ? 'Present' : 'Missing');
    console.log('🔑 API Key (first 10 chars):', process.env.GEMINI_API_KEY?.substring(0, 10) + '...');
    
    // Try to list available models first
    console.log('📋 Checking available models...');
    
    try {
      const models = await genAI.listModels();
      console.log('Available models:', models.map(m => m.name));
    } catch (listError) {
      console.log('Could not list models:', listError.message);
    }

    // Try different model names
    const modelNames = ['gemini-1.5-flash', 'gemini-pro', 'gemini-1.5-pro'];
    
    for (const modelName of modelNames) {
      try {
        console.log(`\n🧪 Testing model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        
        const testPrompt = `You are an agricultural expert. A farmer asks: "My wheat has infection". Provide a brief response about wheat diseases. Keep it under 50 words.`;

        const result = await model.generateContent(testPrompt);
        const response = await result.response;
        const text = response.text();

        console.log(`✅ ${modelName} works! Response:`, text.substring(0, 100) + '...');
        return; // Success, exit function
        
      } catch (modelError) {
        console.log(`❌ ${modelName} failed:`, modelError.message.substring(0, 100) + '...');
      }
    }
    
    console.log('\n🔄 All models failed. System will use intelligent fallback responses');
    
  } catch (error) {
    console.error('❌ General API test failed:', error.message);
    console.log('\n🔄 This means the system will use intelligent fallback responses');
  }
}

testGeminiAPI();