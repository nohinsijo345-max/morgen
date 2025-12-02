const mongoose = require('mongoose');
require('dotenv').config();

const listUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://admin:morgen123@localhost:27017/morgenDB?authSource=admin');
    console.log('✅ Connected to MongoDB\n');
    
    const db = mongoose.connection.db;
    
    // Check Users collection (capital U)
    console.log('📋 Users in "Users" collection:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const users = await db.collection('Users').find({}).toArray();
    
    if (users.length === 0) {
      console.log('❌ No users found in "Users" collection');
    } else {
      users.forEach((user, index) => {
        console.log(`${index + 1}. Name: ${user.name}`);
        console.log(`   Farmer ID: ${user.farmerId}`);
        console.log(`   Phone: ${user.phone}`);
        console.log(`   District: ${user.district}`);
        console.log(`   Badge: ${user.badge}`);
        console.log('');
      });
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`\nTotal: ${users.length} users\n`);
    
    // Also check lowercase users collection
    const oldUsers = await db.collection('users').countDocuments();
    console.log(`📊 Old "users" collection: ${oldUsers} documents`);
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    mongoose.connection.close();
  }
};

listUsers();
