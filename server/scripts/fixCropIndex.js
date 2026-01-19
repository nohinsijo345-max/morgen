const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function fixCropIndex() {
  try {
    console.log('🔧 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('Crops');

    // List all indexes
    console.log('\n📋 Current indexes on Crops collection:');
    const indexes = await collection.indexes();
    indexes.forEach(idx => {
      console.log(`  - ${idx.name}: ${JSON.stringify(idx.key)}`);
    });

    // Drop any geospatial index on 'location' field
    for (const idx of indexes) {
      if (idx.key && (idx.key.location || idx.key['location.coordinates'])) {
        console.log(`\n🗑️ Dropping problematic index: ${idx.name}`);
        try {
          await collection.dropIndex(idx.name);
          console.log(`✅ Dropped index: ${idx.name}`);
        } catch (err) {
          console.log(`⚠️ Could not drop index ${idx.name}: ${err.message}`);
        }
      }
    }

    // List indexes after cleanup
    console.log('\n📋 Indexes after cleanup:');
    const newIndexes = await collection.indexes();
    newIndexes.forEach(idx => {
      console.log(`  - ${idx.name}: ${JSON.stringify(idx.key)}`);
    });

    // Test creating a crop
    console.log('\n🧪 Testing crop creation...');
    const Crop = require('../models/Crop');
    
    const testCrop = new Crop({
      farmerId: 'MGF_TEST',
      farmerName: 'Test Farmer',
      name: 'Test Tomatoes',
      category: 'vegetables',
      quantity: 100,
      unit: 'kg',
      basePrice: 50,
      pricePerUnit: 50,
      quality: 'A',
      harvestDate: new Date('2026-02-15'),
      description: 'Test crop for index fix',
      location: {
        state: 'kerala',
        district: 'ernakulam',
        city: 'Kochi'
      },
      available: true,
      status: 'listed'
    });

    const savedCrop = await testCrop.save();
    console.log('✅ Test crop created successfully:', savedCrop._id);

    // Clean up test crop
    await Crop.findByIdAndDelete(savedCrop._id);
    console.log('🧹 Test crop cleaned up');

    console.log('\n✅ Crop index fix complete!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

fixCropIndex();
