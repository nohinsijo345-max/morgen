const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/morgen', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const checkUserPin = async () => {
  await connectDB();
  
  try {
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    
    const user = await User.findOne({ farmerId: 'FAR-369' });
    
    if (user) {
      console.log('🔍 User found:');
      console.log(`Name: ${user.name}`);
      console.log(`Farmer ID: ${user.farmerId}`);
      console.log(`PIN (hashed): ${user.pin}`);
      
      // Test common PINs
      const commonPins = ['1234', '0000', '1111', '2222', '3333', '4444'];
      
      console.log('\n🔐 Testing common PINs...');
      for (const pin of commonPins) {
        const isMatch = await bcrypt.compare(pin, user.pin);
        if (isMatch) {
          console.log(`✅ Correct PIN found: ${pin}`);
          break;
        } else {
          console.log(`❌ PIN ${pin} - incorrect`);
        }
      }
      
    } else {
      console.log('❌ User not found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
};

checkUserPin();