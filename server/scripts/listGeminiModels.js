const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function listAvailableModels() {
  console.log('📋 Listing Available Gemini Models...\n');

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // Try to list models
    const models = await genAI.listModels();
    
    console.log('✅ Available models:');
    models.forEach((model, index) => {
      console.log(`${index + 1}. ${model.name}`);
      console.log(`   Display Name: ${model.displayName}`);
      console.log(`   Description: ${model.description}`);
      console.log(`   Supported Methods: ${model.supportedGenerationMethods?.join(', ')}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Failed to list models:', error.message);
    
    // Try a simple test with a known working model
    console.log('\n🔄 Trying basic API test...');
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
      
      const result = await model.generateContent('Test');
      console.log('✅ Basic API test successful with gemini-1.5-flash-latest');
      
    } catch (testError) {
      console.error('❌ Basic API test failed:', testError.message);
      console.log('\n🔧 Possible issues:');
      console.log('   1. Invalid API key');
      console.log('   2. API key lacks permissions');
      console.log('   3. Billing not enabled');
      console.log('   4. Regional restrictions');
    }
  }
}

listAvailableModels();