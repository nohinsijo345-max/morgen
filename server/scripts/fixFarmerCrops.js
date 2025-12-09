const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');

async function fixFarmerCrops() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('❌ MONGO_URI not found in .env file');
      console.log('Please make sure you have MONGO_URI set in server/.env');
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Find the farmer by name (since we can see "Nohin Sijo" in the screenshot)
    const farmer = await User.findOne({ name: 'Nohin Sijo', role: 'farmer' });
    
    if (!farmer) {
      console.log('❌ Farmer "Nohin Sijo" not found');
      
      // List all farmers
      const allFarmers = await User.find({ role: 'farmer' }).select('name farmerId cropTypes');
      console.log('\n📋 All farmers in database:');
      allFarmers.forEach(f => {
        console.log(`  - ${f.name} (${f.farmerId}): ${f.cropTypes?.length || 0} crops - ${f.cropTypes?.join(', ') || 'none'}`);
      });
      
      process.exit(1);
    }

    console.log('\n✅ Found farmer:', farmer.name);
    console.log('Farmer ID:', farmer.farmerId);
    console.log('Current cropTypes:', farmer.cropTypes);

    // Add crops
    const cropsToAdd = ['rice', 'wheat'];
    farmer.cropTypes = cropsToAdd;
    await farmer.save();

    console.log('\n✅ Successfully updated crops!');
    console.log('New cropTypes:', farmer.cropTypes);
    console.log('\n🎉 Done! You can now use the harvest countdown feature.');
    console.log('👉 Go to Harvest Countdown and click "Refresh Crops" button');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixFarmerCrops();
