const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');

async function createAdminUser() {
  try {
    console.log('🔍 Checking for admin users and creating if needed...\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://nohinsijo345:Nohin%40123@cluster0.aqcqo.mongodb.net/morgen?retryWrites=true&w=majority');
    console.log('✅ Connected to MongoDB');

    // Check if admin users exist
    const existingAdmins = await User.find({ role: 'admin' });
    console.log(`📊 Found ${existingAdmins.length} existing admin users`);

    if (existingAdmins.length > 0) {
      console.log('\n📋 Existing admin users:');
      existingAdmins.forEach((admin, index) => {
        console.log(`${index + 1}. Admin ID: ${admin.farmerId}, Name: ${admin.name}, Email: ${admin.email}`);
      });
      
      console.log('\n✅ Admin users already exist. You can login with:');
      console.log(`   Admin ID: ${existingAdmins[0].farmerId}`);
      console.log(`   PIN: [Use the PIN set during admin creation]`);
    } else {
      console.log('❌ No admin users found. Creating default admin user...');
      
      // Create default admin user
      const hashedPin = await bcrypt.hash('1234', 10);
      
      // Get next admin ID
      const lastAdmin = await User.findOne({ role: 'admin' }).sort({ farmerId: -1 });
      let nextAdminId = 'ADM-001';
      
      if (lastAdmin && lastAdmin.farmerId) {
        const lastNumber = parseInt(lastAdmin.farmerId.split('-')[1]);
        nextAdminId = `ADM-${String(lastNumber + 1).padStart(3, '0')}`;
      }

      const adminUser = new User({
        name: 'System Administrator',
        farmerId: nextAdminId,
        email: 'admin@morgen.com',
        phone: '9999999999',
        pin: hashedPin,
        role: 'admin',
        state: 'kerala',
        district: 'ernakulam',
        city: 'Kochi',
        pinCode: '682001',
        panchayat: 'Admin',
        landSize: 0,
        cropTypes: [],
        subsidyRequested: false,
        subsidyStatus: 'not_requested',
        isActive: true,
        createdAt: new Date(),
        lastLogin: null
      });

      await adminUser.save();
      console.log('✅ Default admin user created successfully!');
      console.log('\n📋 Admin Login Credentials:');
      console.log(`   Admin ID: ${nextAdminId}`);
      console.log(`   PIN: 1234`);
      console.log(`   Email: admin@morgen.com`);
      console.log(`   Name: System Administrator`);
    }

    // Test admin login
    console.log('\n🔍 Testing admin login...');
    const testAdmin = await User.findOne({ role: 'admin' });
    if (testAdmin) {
      const isValidPin = await bcrypt.compare('1234', testAdmin.pin);
      if (isValidPin) {
        console.log('✅ Admin login test successful');
        console.log('\n🎯 ADMIN ACCESS INSTRUCTIONS:');
        console.log('1. Go to: http://localhost:3000/admin-login');
        console.log(`2. Admin ID: ${testAdmin.farmerId}`);
        console.log('3. PIN: 1234');
        console.log('4. Click "Sign In"');
      } else {
        console.log('❌ Admin PIN test failed');
      }
    }

    await mongoose.disconnect();
    console.log('\n✅ Database connection closed');

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    await mongoose.disconnect();
  }
}

// Load environment variables
require('dotenv').config();
createAdminUser();