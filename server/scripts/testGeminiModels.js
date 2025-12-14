const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function testGeminiModels() {
  console.log('🔍 Testing Gemini API and Models...\n');

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // Test different model names
    const modelsToTest = [
      'gemini-1.5-flash',
      'gemini-1.5-pro',
      'gemini-pro',
      'gemini-1.0-pro',
      'models/gemini-1.5-flash',
      'models/gemini-pro'
    ];

    for (const modelName of modelsToTest) {
      try {
        console.log(`Testing model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        
        const result = await model.generateContent('Hello, can you help with agriculture?');
        const response = await result.response;
        const text = response.text();
        
        console.log(`✅ ${modelName} works!`);
        console.log(`   Response: ${text.substring(0, 100)}...`);
        break; // Use the first working model
        
      } catch (error) {
        console.log(`❌ ${modelName} failed: ${error.message}`);
      }
    }

  } catch (error) {
    console.error('❌ Gemini API test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Check if GEMINI_API_KEY is valid');
    console.log('   2. Verify API key has proper permissions');
    console.log('   3. Check if billing is enabled for the Google Cloud project');
  }
}

testGeminiModels();