const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');

async function addCropsToFarmer() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const farmerId = 'FAR-369'; // From the console log
    
    // Find the farmer
    const farmer = await User.findOne({ farmerId });
    
    if (!farmer) {
      console.log('❌ Farmer not found with farmerId:', farmerId);
      
      // List all farmers
      const allFarmers = await User.find({ role: 'farmer' }).select('name farmerId cropTypes');
      console.log('\n📋 All farmers in database:');
      allFarmers.forEach(f => {
        console.log(`  - ${f.name} (${f.farmerId}): ${f.cropTypes?.length || 0} crops`);
      });
      
      process.exit(1);
    }

    console.log('\n✅ Found farmer:', farmer.name);
    console.log('Current cropTypes:', farmer.cropTypes);

    // Add crops if not present
    if (!farmer.cropTypes || farmer.cropTypes.length === 0) {
      farmer.cropTypes = ['rice', 'wheat'];
      await farmer.save();
      console.log('✅ Added crops to farmer');
    } else {
      console.log('✅ Farmer already has crops');
    }

    console.log('Final cropTypes:', farmer.cropTypes);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addCropsToFarmer();
