const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

async function quickFix() {
  try {
    console.log('🔧 Quick Fix: Resetting FAR-369 PIN...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://admin:morgen123@cluster0.qmcd0d4.mongodb.net/morgenDB?retryWrites=true&w=majority&appName=Cluster0');
    console.log('✅ Connected to MongoDB');
    
    // Hash the PIN properly
    const hashedPin = await bcrypt.hash('1234', 10);
    
    // Update the user
    const result = await User.findOneAndUpdate(
      { farmerId: 'FAR-369' },
      { pin: hashedPin },
      { new: true }
    );
    
    if (result) {
      console.log('✅ PIN updated successfully for FAR-369');
      
      // Test login immediately
      const isValid = await bcrypt.compare('1234', result.pin);
      console.log('✅ PIN verification test:', isValid ? 'SUCCESS' : 'FAILED');
      
      console.log('\n🔑 Login credentials:');
      console.log('   Farmer ID: FAR-369');
      console.log('   PIN: 1234');
      
    } else {
      console.log('❌ User FAR-369 not found');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

quickFix();