const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import User model
const User = require('../models/User');

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://admin:morgen123@localhost:27017/morgenDB?authSource=admin');
    console.log('✅ MongoDB Connected');
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err.message);
    process.exit(1);
  }
};

// Create test farmers
const seedUsers = async () => {
  try {
    // Hash the PIN
    const hashedPin = await bcrypt.hash('1234', 10);

    const testFarmers = [
      {
        name: 'User 1',
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
          coordinates: [76.0856, 10.5276] // Thrissur coordinates
        }
      },
      {
        name: 'User 2',
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
        name: 'User 3',
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
      },
      {
        name: 'User 4',
        role: 'farmer',
        farmerId: 'FAR-1004',
        pin: hashedPin,
        phone: '9876543204',
        district: 'Kozhikode',
        panchayat: 'Vadakara',
        landSize: 4.5,
        reputationScore: 68,
        badge: 'bronze',
        language: 'malayalam',
        location: {
          type: 'Point',
          coordinates: [75.7804, 11.2588]
        }
      },
      {
        name: 'User 5',
        role: 'farmer',
        farmerId: 'FAR-1005',
        pin: hashedPin,
        phone: '9876543205',
        district: 'Kannur',
        panchayat: 'Thalassery',
        landSize: 6.3,
        reputationScore: 78,
        badge: 'silver',
        language: 'english',
        location: {
          type: 'Point',
          coordinates: [75.4897, 11.7480]
        }
      }
    ];

    // Check if users already exist
    for (const farmer of testFarmers) {
      const existingUser = await User.findOne({ farmerId: farmer.farmerId });
      if (existingUser) {
        console.log(`⚠️  ${farmer.name} (${farmer.farmerId}) already exists, skipping...`);
      } else {
        await User.create(farmer);
        console.log(`✅ Created ${farmer.name} (${farmer.farmerId})`);
      }
    }

    console.log('\n🎉 Seed completed successfully!');
    console.log('\n📋 Test Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    testFarmers.forEach(farmer => {
      console.log(`Farmer ID: ${farmer.farmerId} | PIN: 1234 | Name: ${farmer.name}`);
    });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (err) {
    console.error('❌ Error seeding users:', err.message);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run the seed
connectDB().then(() => seedUsers());
