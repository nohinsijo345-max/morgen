const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');

const seedUser = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Delete existing user if exists
    await User.deleteOne({ farmerId: 'FAR-1001' });
    console.log('Removed old test user if existed');

    // Create test user with hashed PIN
    const hashedPin = await bcrypt.hash('1234', 10);
    const testUser = new User({
      name: 'Ravi Kumar',
      role: 'farmer',
      farmerId: 'FAR-1001',
      pin: hashedPin,
      phone: '+919876543210',
      district: 'Ernakulam',
      panchayat: 'Ernakulam',
      landSize: 5,
      reputationScore: 92,
      location: {
        type: 'Point',
        coordinates: [76.2711, 9.9312] // Ernakulam coordinates
      }
    });

    await testUser.save();
    console.log('✅ Test user created successfully!');
    console.log('');
    console.log('Login Credentials:');
    console.log('==================');
    console.log('Farmer ID: FAR-1001');
    console.log('PIN: 1234');
    console.log('');
    console.log('You can now login at: http://localhost:5173');
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding user:', err);
    process.exit(1);
  }
};

seedUser();
