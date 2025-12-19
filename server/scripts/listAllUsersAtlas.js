const mongoose = require('mongoose');

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

const listAllUsers = async () => {
  await connectDB();
  
  try {
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    const users = await User.find({});
    
    console.log(`📋 Found ${users.length} users in Atlas database:`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. Name: ${user.name || 'N/A'}`);
      console.log(`   Farmer ID: ${user.farmerId || 'N/A'}`);
      console.log(`   Email: ${user.email || 'N/A'}`);
      console.log(`   Phone: ${user.phone || 'N/A'}`);
      console.log(`   Role: ${user.role || 'N/A'}`);
      console.log('   ─────────────────────────────────────────────────────');
    });
    
    if (users.length === 0) {
      console.log('❌ No users found in Atlas database');
      console.log('💡 This might explain why the Account Centre is failing');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
};

listAllUsers();