const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Settings = require('../models/Settings');

async function checkSettings() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const settings = await Settings.find({});
    console.log('\n📋 All Settings:');
    settings.forEach(setting => {
      console.log(`\nKey: ${setting.key}`);
      console.log(`Value: ${setting.value}`);
      console.log(`Updated: ${setting.updatedAt}`);
    });

    if (settings.length === 0) {
      console.log('\n⚠️  No settings found in database');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkSettings();
