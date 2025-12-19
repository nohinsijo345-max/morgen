const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User'); // Use the actual User model

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

const createUser = async () => {
  await connectDB();
  
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ farmerId: 'FAR-369' });
    if (existingUser) {
      console.log('✅ User already exists, updating...');
      
      // Update PIN
      const pin = '1234';
      const hashedPin = await bcrypt.hash(pin, 10);
      
      await User.updateOne(
        { farmerId: 'FAR-369' },
        { pin: hashedPin }
      );
      
      console.log('✅ PIN updated successfully');
    } else {
      // Hash the PIN
      const pin = '1234';
      const hashedPin = await bcrypt.hash(pin, 10);
      
      // Create new user
      const newUser = new User({
        name: 'Nohin Sijo',
        farmerId: 'FAR-369',
        email: 'nohinsijo345@gmail.com',
        phone: '8078532484',
        pin: hashedPin,
        role: 'farmer',
        state: 'kerala',
        district: 'ernakulam',
        city: 'Ernakulam',
        pinCode: '683545',
        panchayat: '',
        landSize: 15,
        cropTypes: ['rice', 'wheat', 'sugarcane'],
        subsidyRequested: false,
        subsidyStatus: 'none',
        reputationScore: 0,
        totalSales: 0,
        averageRating: 0,
        badge: 'none',
        totalPurchases: 0,
        maxBidLimit: 10000,
        language: 'english',
        voiceAssist: false,
        notifications: true,
        isActive: true,
        location: {
          type: 'Point',
          coordinates: [0, 0]
        },
        crops: [],
        lastLogin: new Date()
      });
      
      await newUser.save();
      console.log('✅ User created successfully');
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔐 Login credentials:');
    console.log('   Farmer ID: FAR-369');
    console.log('   PIN: 1234');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // Test login
    console.log('\n🧪 Testing login...');
    const testUser = await User.findOne({ farmerId: 'FAR-369' });
    if (testUser) {
      const isMatch = await bcrypt.compare('1234', testUser.pin);
      console.log(`✅ PIN verification: ${isMatch ? 'SUCCESS' : 'FAILED'}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
};

createUser();