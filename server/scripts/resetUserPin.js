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

const resetUserPin = async () => {
  await connectDB();
  
  try {
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    
    const user = await User.findOne({ farmerId: 'FAR-369' });
    
    if (user) {
      console.log('🔍 User found:');
      console.log(`Name: ${user.name}`);
      console.log(`Farmer ID: ${user.farmerId}`);
      
      // Set new PIN to 1234
      const newPin = '1234';
      const hashedPin = await bcrypt.hash(newPin, 10);
      
      await User.updateOne(
        { farmerId: 'FAR-369' },
        { pin: hashedPin }
      );
      
      console.log(`✅ PIN reset successfully to: ${newPin}`);
      console.log('🔐 You can now login with PIN: 1234');
      
    } else {
      console.log('❌ User not found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
};

resetUserPin();