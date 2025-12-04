const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');

const deleteOldFarUsers = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://admin:morgen123@localhost:27017/morgenDB?authSource=admin';
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB\n');
    
    // Delete all FAR-* users except FAR-369
    const result = await User.deleteMany({
      farmerId: { 
        $regex: /^FAR-/i,
        $ne: 'FAR-369'
      }
    });
    
    console.log(`🗑️  Deleted ${result.deletedCount} old FAR-* users (kept FAR-369)`);
    console.log('✅ Cleanup complete!\n');
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    mongoose.connection.close();
  }
};

deleteOldFarUsers();
