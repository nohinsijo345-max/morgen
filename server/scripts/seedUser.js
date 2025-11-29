const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');

const seedUser = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Check if user already exists
    const existingUser = await User.findOne({ farmerId: 'FAR-1001' });
    if (existingUser) {
      console.log('Test user already exists');
      process.exit(0);
    }

    // Create test user
    const hashedPin = await bcrypt.hash('1234', 10);
    const testUser = new User({
      name: 'Ravi Kumar',
      role: 'farmer',
      farmerId: 'FAR-1001',
      pin: hashedPin,
      district: 'Ernakulam',
      landSize: 5,
      points: 92
    });

    await testUser.save();
    console.log('✅ Test user created successfully!');
    console.log('Farmer ID: FAR-1001');
    console.log('PIN: 1234');
    
    process.exit(0);
  } catch (err) {
    console.error('Error seeding user:', err);
    process.exit(1);
  }
};

seedUser();
