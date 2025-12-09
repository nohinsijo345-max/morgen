const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');

async function checkFarmer() {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('❌ MONGO_URI not found in .env file');
      console.log('Please make sure you have MONGO_URI set in server/.env');
      process.exit(1);
    }
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    // Find all farmers
    const farmers = await User.find({ role: 'farmer' }).select('name farmerId cropTypes');
    
    console.log('📋 All farmers in database:');
    console.log('═══════════════════════════════════════\n');
    
    farmers.forEach(f => {
      console.log(`Name: ${f.name}`);
      console.log(`Farmer ID: ${f.farmerId}`);
      console.log(`Crop Types: ${f.cropTypes?.join(', ') || 'none'}`);
      console.log(`Number of crops: ${f.cropTypes?.length || 0}`);
      console.log('─────────────────────────────────────\n');
    });

    // Specifically check for FAR-369
    console.log('\n🔍 Checking for FAR-369 specifically:');
    const far369 = await User.findOne({ farmerId: 'FAR-369' });
    if (far369) {
      console.log('✅ FOUND!');
      console.log('Name:', far369.name);
      console.log('Crops:', far369.cropTypes);
    } else {
      console.log('❌ NOT FOUND with farmerId: FAR-369');
    }

    // Check by name
    console.log('\n🔍 Checking for "Nohin Sijo":');
    const byName = await User.findOne({ name: 'Nohin Sijo', role: 'farmer' });
    if (byName) {
      console.log('✅ FOUND!');
      console.log('Farmer ID:', byName.farmerId);
      console.log('Crops:', byName.cropTypes);
    } else {
      console.log('❌ NOT FOUND');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkFarmer();
