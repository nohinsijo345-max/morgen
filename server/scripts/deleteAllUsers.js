const mongoose = require('mongoose');
require('dotenv').config();

const deleteAllUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://admin:morgen123@localhost:27017/morgenDB?authSource=admin');
    console.log('✅ Connected to MongoDB\n');
    
    const db = mongoose.connection.db;
    
    // Delete from Users collection
    const result1 = await db.collection('Users').deleteMany({});
    console.log(`🗑️  Deleted ${result1.deletedCount} users from "Users" collection`);
    
    // Delete from users collection (lowercase)
    const result2 = await db.collection('users').deleteMany({});
    console.log(`🗑️  Deleted ${result2.deletedCount} users from "users" collection`);
    
    console.log('\n✅ All users deleted successfully!\n');
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    mongoose.connection.close();
  }
};

deleteAllUsers();
