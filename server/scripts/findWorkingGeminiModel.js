const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function findWorkingGeminiModel() {
  console.log('🔍 Finding Working Gemini Model');
  console.log('=' .repeat(50));

  const apiKey = process.env.GEMINI_API_KEY;
  console.log(`🔑 Testing API Key: ${apiKey?.substring(0, 10)}...${apiKey?.substring(apiKey.length - 4)}`);

  if (!apiKey) {
    console.log('❌ No API key found');
    return;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Comprehensive list of possible model names
    const modelsToTest = [
      // Standard models
      'gemini-pro',
      'gemini-1.5-pro',
      'gemini-1.5-flash',
      'gemini-1.0-pro',
      
      // With models/ prefix
      'models/gemini-pro',
      'models/gemini-1.5-pro', 
      'models/gemini-1.5-flash',
      'models/gemini-1.0-pro',
      
      // Latest versions
      'gemini-pro-latest',
      'gemini-1.5-pro-latest',
      'gemini-1.5-flash-latest',
      
      // Alternative naming
      'text-bison-001',
      'chat-bison-001',
      'gemini-pro-vision',
      'models/gemini-pro-vision',
      
      // Experimental
      'gemini-experimental',
      'models/gemini-experimental'
    ];

    console.log(`🧪 Testing ${modelsToTest.length} different model names...\n`);

    for (const modelName of modelsToTest) {
      try {
        console.log(`Testing: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        
        const prompt = "Say 'Hello' in one word.";
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        console.log(`✅ SUCCESS! Model "${modelName}" works!`);
        console.log(`Response: "${text.trim()}"`);
        
        // Test agricultural content
        console.log('\n🌾 Testing agricultural response...');
        const agriPrompt = "A farmer asks: 'My wheat has yellow leaves.' Give a brief 1-sentence response about possible causes.";
        const agriResult = await model.generateContent(agriPrompt);
        const agriResponse = await agriResult.response;
        const agriText = agriResponse.text();
        
        console.log(`Agricultural response: "${agriText.trim()}"`);
        console.log('\n🎉 WORKING MODEL FOUND!');
        console.log(`✅ Use this model name: "${modelName}"`);
        
        return modelName;
        
      } catch (error) {
        const errorMsg = error.message;
        if (errorMsg.includes('not found')) {
          console.log(`❌ Model not available`);
        } else if (errorMsg.includes('API key')) {
          console.log(`❌ API key issue: ${errorMsg.substring(0, 50)}...`);
        } else if (errorMsg.includes('quota')) {
          console.log(`❌ Quota exceeded`);
        } else {
          console.log(`❌ Error: ${errorMsg.substring(0, 50)}...`);
        }
      }
    }

    console.log('\n❌ No working models found with this API key');
    console.log('\n🔧 POSSIBLE SOLUTIONS:');
    console.log('1. Your API key might need billing enabled');
    console.log('2. Try creating a new API key in Google AI Studio');
    console.log('3. Check if you need to enable specific APIs');
    console.log('4. Verify your Google Cloud project settings');
    
  } catch (error) {
    console.log('❌ Failed to initialize Gemini API');
    console.log(`Error: ${error.message}`);
  }
}

findWorkingGeminiModel();