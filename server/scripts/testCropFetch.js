const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');

async function testCropFetch() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find a farmer with crops
    const farmer = await User.findOne({ role: 'farmer', farmerId: { $exists: true } });
    
    if (!farmer) {
      console.log('❌ No farmer found');
      return;
    }

    console.log('\n📋 Farmer Details:');
    console.log('Name:', farmer.name);
    console.log('Farmer ID:', farmer.farmerId);
    console.log('Crop Types:', farmer.cropTypes);
    console.log('Crops (ObjectIds):', farmer.crops);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testCropFetch();
