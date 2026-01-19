const axios = require('axios');

const testLiveBiddingFrontend = async () => {
  try {
    console.log('🔍 Testing Live Bidding Frontend Integration...\n');
    
    const API_URL = 'http://localhost:5050';
    
    // Test the exact endpoint the frontend is calling
    console.log('1️⃣ Testing frontend API call...');
    const response = await axios.get(`${API_URL}/api/bidding/active`);
    
    console.log('✅ API Response received');
    console.log('📊 Response data:', JSON.stringify(response.data, null, 2));
    
    // Validate the data structure the frontend expects
    console.log('\n2️⃣ Validating frontend data expectations...');
    const bids = response.data.bids || [];
    
    if (bids.length === 0) {
      console.log('⚠️ No bids found - this explains the loading state');
      return;
    }
    
    console.log(`✅ Found ${bids.length} bids`);
    
    // Check each bid for required frontend fields
    bids.forEach((bid, index) => {
      console.log(`\n📋 Validating Bid ${index + 1}:`);
      
      const requiredFields = [
        'bidId', 'cropName', 'farmerName', 'quantity', 'unit', 
        'quality', 'currentPrice', 'startingPrice', 'bidEndDate', 'bids'
      ];
      
      const missingFields = requiredFields.filter(field => !bid.hasOwnProperty(field));
      
      if (missingFields.length > 0) {
        console.log(`❌ Missing fields: ${missingFields.join(', ')}`);
      } else {
        console.log('✅ All required fields present');
      }
      
      // Check data types
      console.log('📊 Field validation:');
      console.log(`   bidId: ${bid.bidId} (${typeof bid.bidId})`);
      console.log(`   cropName: ${bid.cropName} (${typeof bid.cropName})`);
      console.log(`   farmerName: ${bid.farmerName} (${typeof bid.farmerName})`);
      console.log(`   quantity: ${bid.quantity} (${typeof bid.quantity})`);
      console.log(`   currentPrice: ${bid.currentPrice} (${typeof bid.currentPrice})`);
      console.log(`   bids array: ${Array.isArray(bid.bids)} (length: ${bid.bids?.length || 0})`);
      
      // Check date format
      const bidEndDate = new Date(bid.bidEndDate);
      const isValidDate = !isNaN(bidEndDate.getTime());
      console.log(`   bidEndDate: ${bid.bidEndDate} (valid: ${isValidDate})`);
      
      if (isValidDate) {
        const timeLeft = bidEndDate - new Date();
        console.log(`   Time remaining: ${Math.floor(timeLeft / (1000 * 60))} minutes`);
      }
    });
    
    console.log('\n3️⃣ Testing potential frontend issues...');
    
    // Check if the data structure matches what the frontend expects
    const sampleBid = bids[0];
    
    // The frontend tries to access bid.farmerId?.name but API returns bid.farmerName
    if (sampleBid.farmerId && !sampleBid.farmerName) {
      console.log('⚠️ Frontend expects farmerName but only farmerId found');
    } else if (sampleBid.farmerName) {
      console.log('✅ farmerName field is available');
    }
    
    // Check if quality values are compatible
    const validQualities = ['A', 'B', 'C', 'Premium', 'Grade A', 'Grade B', 'Standard'];
    if (!validQualities.includes(sampleBid.quality)) {
      console.log(`⚠️ Unexpected quality value: ${sampleBid.quality}`);
    } else {
      console.log(`✅ Quality value is valid: ${sampleBid.quality}`);
    }
    
    console.log('\n🎉 Frontend integration test completed!');
    
    // Provide specific recommendations
    console.log('\n💡 Recommendations:');
    console.log('1. Check browser console for JavaScript errors');
    console.log('2. Verify useLiveUpdates hook is receiving this data');
    console.log('3. Check if theme context is causing issues');
    console.log('4. Ensure UserSession.getCurrentUser() is working');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
};

testLiveBiddingFrontend();