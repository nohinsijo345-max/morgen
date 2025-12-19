const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Connect to MongoDB Atlas
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb+srv://admin:morgen123@cluster0.qmcd0d4.mongodb.net/morgenDB?retryWrites=true&w=majority&appName=Cluster0');
    console.log('✅ Connected to MongoDB Atlas');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const findUserInDB = async () => {
  await connectDB();
  
  try {
    // Check all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📋 Available collections:');
    collections.forEach(col => console.log(`  - ${col.name}`));
    
    // Try different collection names
    const collectionNames = ['users', 'Users', 'farmers', 'Farmers'];
    
    for (const collectionName of collectionNames) {
      console.log(`\n🔍 Checking collection: ${collectionName}`);
      
      try {
        const Collection = mongoose.model(collectionName, new mongoose.Schema({}, { strict: false }));
        const users = await Collection.find({ farmerId: 'FAR-369' });
        
        if (users.length > 0) {
          console.log(`✅ Found user in ${collectionName}:`);
          users.forEach(user => {
            console.log(`  Name: ${user.name}`);
            console.log(`  Farmer ID: ${user.farmerId}`);
            console.log(`  Email: ${user.email}`);
            console.log(`  PIN (hashed): ${user.pin}`);
          });
          
          // Reset PIN for this user
          const newPin = '1234';
          const hashedPin = await bcrypt.hash(newPin, 10);
          
          await Collection.updateOne(
            { farmerId: 'FAR-369' },
            { pin: hashedPin }
          );
          
          console.log(`✅ PIN reset successfully to: ${newPin}`);
          break;
        } else {
          console.log(`❌ No user found in ${collectionName}`);
        }
      } catch (error) {
        console.log(`❌ Error checking ${collectionName}:`, error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
};

findUserInDB();