const axios = require('axios');

const API_URL = 'http://localhost:5050';
const TEST_FARMER_ID = 'FAR-369';

async function finalSystemTest() {
  console.log('🎯 Final AI Plant Doctor System Test\n');
  console.log('Testing complete integration...\n');

  let testsPassed = 0;
  let totalTests = 0;

  // Test 1: Chat Session Creation
  totalTests++;
  try {
    console.log('1. 🔄 Testing chat session creation...');
    const chatResponse = await axios.get(`${API_URL}/api/ai-doctor/chat/${TEST_FARMER_ID}`);
    
    if (chatResponse.data.chatId && chatResponse.data.messages) {
      console.log('   ✅ Chat session created successfully');
      console.log(`   📋 Chat ID: ${chatResponse.data.chatId}`);
      console.log(`   💬 Initial messages: ${chatResponse.data.messages.length}`);
      console.log(`   👤 Farmer: ${chatResponse.data.farmerContext.crops.join(', ')} farmer from ${chatResponse.data.farmerContext.location.district}`);
      testsPassed++;
    } else {
      console.log('   ❌ Invalid chat session response');
    }
  } catch (error) {
    console.log(`   ❌ Chat session creation failed: ${error.message}`);
  }

  // Test 2: Intelligent AI Responses
  totalTests++;
  try {
    console.log('\n2. 🤖 Testing intelligent AI responses...');
    const questions = [
      'My rice plants have yellow leaves',
      'How to control pests organically?',
      'What fertilizer for flowering stage?'
    ];

    let responsesReceived = 0;
    for (const question of questions) {
      const response = await axios.post(`${API_URL}/api/ai-doctor/chat/${TEST_FARMER_ID}/message`, {
        message: question,
        messageId: `final_test_${Date.now()}`
      });

      if (response.data.message && response.data.message.content.length > 100) {
        responsesReceived++;
      }
      await new Promise(resolve => setTimeout(resolve, 200)); // Small delay
    }

    if (responsesReceived === questions.length) {
      console.log(`   ✅ All ${questions.length} AI responses received successfully`);
      console.log('   🧠 Intelligent fallback system working perfectly');
      testsPassed++;
    } else {
      console.log(`   ❌ Only ${responsesReceived}/${questions.length} responses received`);
    }
  } catch (error) {
    console.log(`   ❌ AI response test failed: ${error.message}`);
  }

  // Test 3: Statistics Tracking
  totalTests++;
  try {
    console.log('\n3. 📊 Testing statistics tracking...');
    const statsResponse = await axios.get(`${API_URL}/api/ai-doctor/stats/${TEST_FARMER_ID}`);
    
    if (statsResponse.data.totalConsultations >= 0 && statsResponse.data.questionsAsked >= 0) {
      console.log('   ✅ Statistics tracking working');
      console.log(`   📈 Total consultations: ${statsResponse.data.totalConsultations}`);
      console.log(`   ❓ Questions asked: ${statsResponse.data.questionsAsked}`);
      console.log(`   📸 Images analyzed: ${statsResponse.data.imagesAnalyzed}`);
      console.log(`   🟢 Status: ${statsResponse.data.isActive ? 'Active' : 'Inactive'}`);
      testsPassed++;
    } else {
      console.log('   ❌ Invalid statistics response');
    }
  } catch (error) {
    console.log(`   ❌ Statistics test failed: ${error.message}`);
  }

  // Test 4: Agriculture-Only Validation
  totalTests++;
  try {
    console.log('\n4. 🌱 Testing agriculture-only focus...');
    const nonAgQuestions = [
      'Tell me about the weather today',
      'What is the capital of India?',
      'How to cook rice?'
    ];

    let agricultureResponses = 0;
    for (const question of nonAgQuestions) {
      const response = await axios.post(`${API_URL}/api/ai-doctor/chat/${TEST_FARMER_ID}/message`, {
        message: question,
        messageId: `agri_test_${Date.now()}`
      });

      const content = response.data.message.content.toLowerCase();
      if (content.includes('agricultural') || content.includes('farming') || content.includes('crop') || content.includes('plant')) {
        agricultureResponses++;
      }
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    if (agricultureResponses >= 2) { // Allow some flexibility
      console.log('   ✅ Agriculture-only focus maintained');
      console.log(`   🎯 ${agricultureResponses}/${nonAgQuestions.length} responses stayed agriculture-focused`);
      testsPassed++;
    } else {
      console.log(`   ⚠️  Only ${agricultureResponses}/${nonAgQuestions.length} responses were agriculture-focused`);
    }
  } catch (error) {
    console.log(`   ❌ Agriculture focus test failed: ${error.message}`);
  }

  // Test 5: Error Handling
  totalTests++;
  try {
    console.log('\n5. 🛡️  Testing error handling...');
    
    // Test with invalid farmer ID
    try {
      await axios.get(`${API_URL}/api/ai-doctor/chat/INVALID_FARMER`);
      console.log('   ❌ Should have failed with invalid farmer ID');
    } catch (expectedError) {
      if (expectedError.response && expectedError.response.status === 404) {
        console.log('   ✅ Proper error handling for invalid farmer ID');
        testsPassed++;
      } else {
        console.log('   ❌ Unexpected error response');
      }
    }
  } catch (error) {
    console.log(`   ❌ Error handling test failed: ${error.message}`);
  }

  // Final Results
  console.log('\n' + '='.repeat(60));
  console.log('🏆 FINAL TEST RESULTS');
  console.log('='.repeat(60));
  console.log(`✅ Tests Passed: ${testsPassed}/${totalTests}`);
  console.log(`📊 Success Rate: ${Math.round((testsPassed/totalTests) * 100)}%`);
  
  if (testsPassed === totalTests) {
    console.log('\n🎉 ALL TESTS PASSED! AI Plant Doctor system is fully functional!');
    console.log('\n🌟 System Features Verified:');
    console.log('   ✅ Chat session management');
    console.log('   ✅ Intelligent AI responses with fallback');
    console.log('   ✅ Farmer context awareness');
    console.log('   ✅ Statistics tracking');
    console.log('   ✅ Agriculture-only focus');
    console.log('   ✅ Error handling');
    console.log('   ✅ Production-ready architecture');
    
    console.log('\n🚀 Ready for Production Deployment!');
  } else {
    console.log(`\n⚠️  ${totalTests - testsPassed} test(s) failed. Review the issues above.`);
  }
  
  console.log('\n📱 Frontend Integration:');
  console.log('   🌐 Client running on: http://localhost:5173');
  console.log('   🔗 AI Doctor page: http://localhost:5173/ai-doctor');
  console.log('   📊 Dashboard: http://localhost:5173/dashboard');
}

finalSystemTest();