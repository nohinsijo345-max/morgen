const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Settings = require('../models/Settings');

async function testImageSave() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB\n');

    // Test saving an image setting
    const testImagePath = 'http://localhost:5050/uploads/images/test-123.jpg';
    
    console.log('💾 Saving test image...');
    const result = await Settings.findOneAndUpdate(
      { key: 'loginPageImage' },
      { value: testImagePath, updatedAt: new Date() },
      { upsert: true, new: true }
    );
    
    console.log('✅ Saved:', result);
    
    // Verify it was saved
    console.log('\n🔍 Fetching saved image...');
    const fetched = await Settings.findOne({ key: 'loginPageImage' });
    console.log('✅ Fetched:', fetched);
    
    if (fetched && fetched.value === testImagePath) {
      console.log('\n✅ SUCCESS: Image save and fetch working correctly!');
    } else {
      console.log('\n❌ FAILED: Image not saved correctly');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testImageSave();
