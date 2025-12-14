const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function testGeminiWithQuotaHandling() {
  console.log('🧪 Testing Gemini API with Quota Handling');
  console.log('=' .repeat(50));

  const apiKey = process.env.GEMINI_API_KEY;
  console.log(`🔑 API Key: ${apiKey?.substring(0, 10)}...${apiKey?.substring(apiKey.length - 4)}`);

  if (!apiKey) {
    console.log('❌ No API key found');
    return;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Test with a very simple, low-quota request
    const modelNames = ['gemini-pro', 'gemini-1.5-flash', 'models/gemini-pro'];
    
    for (const modelName of modelNames) {
      try {
        console.log(`\n🧪 Testing ${modelName} with minimal request...`);
        const model = genAI.getGenerativeModel({ model: modelName });
        
        // Very simple request to minimize quota usage
        const prompt = "Hi";
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        console.log(`✅ SUCCESS! ${modelName} works!`);
        console.log(`Response: "${text.trim()}"`);
        
        // Test with agricultural content but keep it short
        console.log('\n🌾 Testing short agricultural query...');
        const agriPrompt = "Wheat yellow leaves cause?";
        const agriResult = await model.generateContent(agriPrompt);
        const agriResponse = await agriResult.response;
        const agriText = agriResponse.text();
        
        console.log(`Agricultural response: "${agriText.trim()}"`);
        console.log(`\n🎉 GEMINI API IS WORKING WITH MODEL: ${modelName}`);
        
        return modelName;
        
      } catch (error) {
        const errorMsg = error.message;
        if (errorMsg.includes('quota') || errorMsg.includes('limit')) {
          console.log(`❌ Quota/Rate limit exceeded for ${modelName}`);
          console.log('💡 This means the API key is valid but has usage limits');
        } else if (errorMsg.includes('not found')) {
          console.log(`❌ Model ${modelName} not available`);
        } else if (errorMsg.includes('API key')) {
          console.log(`❌ API key issue: ${errorMsg.substring(0, 80)}...`);
        } else {
          console.log(`❌ Error: ${errorMsg.substring(0, 80)}...`);
        }
      }
      
      // Wait a bit between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log('\n📊 SUMMARY:');
    console.log('✅ Your API key appears to be valid');
    console.log('⚠️  But you may have quota/rate limiting issues');
    console.log('💡 The AI Doctor will continue using intelligent fallbacks');
    console.log('\n🔧 TO FIX QUOTA ISSUES:');
    console.log('1. Wait for quota to reset (usually daily)');
    console.log('2. Enable billing in Google Cloud Console');
    console.log('3. Create a new API key with billing enabled');
    console.log('4. Check your usage limits in Google AI Studio');
    
  } catch (error) {
    console.log('❌ Failed to test Gemini API');
    console.log(`Error: ${error.message}`);
  }
}

testGeminiWithQuotaHandling();