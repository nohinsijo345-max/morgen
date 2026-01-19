const mongoose = require('mongoose');
const Bid = require('../models/Bid');
const Crop = require('../models/Crop');

async function testBiddingAndCrops() {
  try {
    await mongoose.connect('mongodb+srv://morgenagri:morgenagri123@cluster0.mongodb.net/morgen-agri?retryWrites=true&w=majority');
    console.log('✅ Connected to MongoDB');
    
    // Test Bid model
    const bidCount = await Bid.countDocuments();
    console.log('📊 Total bids in database:', bidCount);
    
    // Test Crop model  
    const cropCount = await Crop.countDocuments();
    console.log('📊 Total crops in database:', cropCount);
    
    // Test active bids
    const activeBids = await Bid.find({ status: 'active' }).limit(3);
    console.log('🔥 Active bids:', activeBids.length);
    if (activeBids.length > 0) {
      console.log('Sample active bid:', {
        bidId: activeBids[0].bidId,
        cropName: activeBids[0].cropName,
        currentPrice: activeBids[0].currentPrice,
        totalBids: activeBids[0].bids?.length || 0
      });
    }
    
    // Test available crops
    const availableCrops = await Crop.find({ available: true }).limit(3);
    console.log('🌾 Available crops:', availableCrops.length);
    if (availableCrops.length > 0) {
      console.log('Sample available crop:', {
        name: availableCrops[0].name,
        quantity: availableCrops[0].quantity,
        pricePerUnit: availableCrops[0].pricePerUnit,
        farmerId: availableCrops[0].farmerId
      });
    }
    
    // Test API endpoints simulation
    console.log('\n🧪 Testing API endpoint logic...');
    
    // Test bidding active endpoint logic
    const activeBidsQuery = await Bid.find({ 
      status: 'active',
      bidEndDate: { $gt: new Date() }
    }).limit(5);
    console.log('✅ Active bids query works:', activeBidsQuery.length);
    
    // Test crops available endpoint logic
    const availableCropsQuery = await Crop.find({ available: true }).limit(5);
    console.log('✅ Available crops query works:', availableCropsQuery.length);
    
    console.log('\n✅ All tests completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testBiddingAndCrops();