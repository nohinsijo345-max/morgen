const mongoose = require('mongoose');
require('dotenv').config();

const migrateUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://admin:morgen123@localhost:27017/morgenDB?authSource=admin');
    console.log('✅ Connected to MongoDB\n');
    
    const db = mongoose.connection.db;
    
    // Get old users from lowercase collection
    const oldUsers = await db.collection('users').find({}).toArray();
    console.log(`Found ${oldUsers.length} user(s) in "users" collection`);
    
    if (oldUsers.length > 0) {
      // Copy to new Users collection
      for (const user of oldUsers) {
        const exists = await db.collection('Users').findOne({ farmerId: user.farmerId });
        if (!exists) {
          await db.collection('Users').insertOne(user);
          console.log(`✅ Migrated: ${user.name || user.farmerId}`);
        } else {
          console.log(`⚠️  Already exists: ${user.farmerId}`);
        }
      }
      
      console.log('\n🎉 Migration complete!');
      console.log('\n📊 Final count:');
      const totalUsers = await db.collection('Users').countDocuments();
      console.log(`Total users in "Users" collection: ${totalUsers}`);
    }
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    mongoose.connection.close();
  }
};

migrateUsers();
