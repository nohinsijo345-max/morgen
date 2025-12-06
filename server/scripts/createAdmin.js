const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const createAdmin = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://admin:morgen123@localhost:27017/morgenDB?authSource=admin';
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB\n');
    
    const db = mongoose.connection.db;
    
    // Check if admin already exists
    const existingAdmin = await db.collection('Users').findOne({ farmerId: 'ADMIN001' });
    
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      console.log('   Farmer ID: ADMIN001');
      console.log('   PIN: 1234');
      mongoose.connection.close();
      return;
    }
    
    // Create admin user
    const hashedPin = await bcrypt.hash('1234', 10);
    
    const adminUser = {
      name: 'Admin',
      role: 'admin',
      farmerId: 'ADMIN001',
      pin: hashedPin,
      phone: '9999999999',
      email: 'admin@morgen.com',
      district: 'Admin',
      state: 'Admin',
      city: 'Admin',
      landSize: 0,
      cropTypes: [],
      subsidyRequested: false,
      subsidyStatus: 'none',
      badge: 'admin',
      createdAt: new Date(),
      lastLogin: null
    };
    
    await db.collection('Users').insertOne(adminUser);
    
    console.log('✅ Admin user created successfully!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('   Farmer ID: ADMIN001');
    console.log('   PIN: 1234');
    console.log('   Email: admin@morgen.com');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🌐 Access admin panel at: http://localhost:5173/admin');
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    mongoose.connection.close();
  }
};

createAdmin();
