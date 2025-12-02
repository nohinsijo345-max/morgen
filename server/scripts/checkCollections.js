const mongoose = require('mongoose');
require('dotenv').config();

const checkCollections = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://admin:morgen123@localhost:27017/morgenDB?authSource=admin');
    console.log('✅ Connected to MongoDB\n');
    
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    console.log('📋 Available Collections:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    collections.forEach(col => {
      console.log(`  - ${col.name}`);
    });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    // Count documents in each collection
    for (const col of collections) {
      const count = await mongoose.connection.db.collection(col.name).countDocuments();
      console.log(`${col.name}: ${count} documents`);
    }
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    mongoose.connection.close();
  }
};

checkCollections();
