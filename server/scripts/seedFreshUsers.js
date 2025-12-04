const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');

const connectDB = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://admin:morgen123@localhost:27017/morgenDB?authSource=admin';
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB Connected\n');
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err.message);
    process.exit(1);
  }
};

const seedFreshUsers = async () => {
  try {
    // Hash the PIN
    const hashedPin = await bcrypt.hash('1234', 10);

    const testFarmers = [
      {
        name: 'Rajesh Kumar',
        role: 'farmer',
        farmerId: 'FAR-1001',
        pin: hashedPin,
        phone: '9876543201',
        district: 'Thrissur',
        panchayat: 'Chavakkad',
        landSize: 5.5,
        reputationScore: 85,
        badge: 'silver',
        language: 'english',
        location: {
          type: 'Point',
          coordinates: [76.0856, 10.5276]
        }
      },
      {
        name: 'Priya Menon',
        role: 'farmer',
        farmerId: 'FAR-1002',
        pin: hashedPin,
        phone: '9876543202',
        district: 'Ernakulam',
        panchayat: 'Aluva',
        landSize: 3.2,
        reputationScore: 72,
        badge: 'bronze',
        language: 'malayalam',
        location: {
          type: 'Point',
          coordinates: [76.3500, 10.1100]
        }
      },
      {
        name: 'Suresh Nair',
        role: 'farmer',
        farmerId: 'FAR-1003',
        pin: hashedPin,
        phone: '9876543203',
        district: 'Palakkad',
        panchayat: 'Ottapalam',
        landSize: 8.0,
        reputationScore: 95,
        badge: 'gold',
        language: 'english',
        location: {
          type: 'Point',
          coordinates: [76.3773, 10.7740]
        }
      }
    ];

    // Clear existing users first
    await User.deleteMany({});
    console.log('🗑️  Cleared existing users\n');

    // Insert new users
    for (const farmer of testFarmers) {
      await User.create(farmer);
      console.log(`✅ Created ${farmer.name} (${farmer.farmerId})`);
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 SEED COMPLETED SUCCESSFULLY!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n📋 TEST LOGIN CREDENTIALS:\n');
    testFarmers.forEach(farmer => {
      console.log(`👤 ${farmer.name}`);
      console.log(`   Farmer ID: ${farmer.farmerId}`);
      console.log(`   PIN: 1234`);
      console.log(`   Phone: ${farmer.phone}`);
      console.log(`   District: ${farmer.district}\n`);
    });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (err) {
    console.error('❌ Error seeding users:', err.message);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

connectDB().then(() => seedFreshUsers());
