const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function diagnoseGeminiAPI() {
  console.log('🔍 GEMINI API DIAGNOSIS');
  console.log('=' .repeat(60));

  // Check environment
  console.log('📋 Environment Check:');
  console.log(`API Key Present: ${process.env.GEMINI_API_KEY ? 'YES' : 'NO'}`);
  console.log(`API Key Length: ${process.env.GEMINI_API_KEY?.length || 0} characters`);
  console.log(`API Key Preview: ${process.env.GEMINI_API_KEY?.substring(0, 15)}...`);
  console.log('');

  if (!process.env.GEMINI_API_KEY) {
    console.log('❌ No API key found in environment variables');
    return;
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    console.log('✅ GoogleGenerativeAI instance created successfully');

    // Test different model names that might work
    const modelsToTest = [
      'gemini-pro',
      'gemini-1.5-pro',
      'gemini-1.5-flash',
      'gemini-1.5-pro-latest',
      'gemini-1.5-flash-latest',
      'models/gemini-pro',
      'models/gemini-1.5-pro',
      'models/gemini-1.5-flash'
    ];

    console.log('🧪 Testing different model names...\n');

    for (const modelName of modelsToTest) {
      try {
        console.log(`Testing: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        
        const prompt = "Say 'Hello' in one word only.";
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        console.log(`✅ SUCCESS with ${modelName}`);
        console.log(`Response: "${text.trim()}"`);
        console.log('');
        
        // If we found a working model, test with agricultural content
        console.log('🌾 Testing agricultural content...');
        const agriPrompt = "A farmer asks: 'My wheat has yellow leaves.' Give a brief 2-sentence response about possible causes.";
        const agriResult = await model.generateContent(agriPrompt);
        const agriResponse = await agriResult.response;
        const agriText = agriResponse.text();
        
        console.log(`✅ Agricultural test successful:`);
        console.log(`Response: "${agriText.trim()}"`);
        console.log('');
        console.log(`🎉 WORKING MODEL FOUND: ${modelName}`);
        return modelName;
        
      } catch (error) {
        console.log(`❌ FAILED: ${modelName}`);
        console.log(`Error: ${error.message.substring(0, 100)}...`);
        console.log('');
      }
    }

    console.log('❌ No working models found');
    
  } catch (error) {
    console.log('❌ Failed to create GoogleGenerativeAI instance');
    console.log(`Error: ${error.message}`);
  }

  // Additional diagnostics
  console.log('\n🔧 TROUBLESHOOTING STEPS:');
  console.log('1. Verify API key is valid at: https://makersuite.google.com/app/apikey');
  console.log('2. Check if Gemini API is enabled for your project');
  console.log('3. Ensure you have proper billing setup (if required)');
  console.log('4. Try generating a new API key');
  console.log('5. Check API quotas and limits');
}

// Run diagnosis
diagnoseGeminiAPI().catch(console.error);