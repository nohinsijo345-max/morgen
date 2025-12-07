const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Settings = require('../models/Settings');

async function clearTestSettings() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB\n');

    console.log('🗑️  Clearing test settings...');
    const result = await Settings.deleteMany({});
    console.log(`✅ Deleted ${result.deletedCount} settings`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

clearTestSettings();
