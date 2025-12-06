const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const checkUserRoles = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://admin:morgen123@localhost:27017/morgenDB?authSource=admin';
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB\n');
    
    const db = mongoose.connection.db;
    
    console.log('📋 Users with Role Information:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const users = await db.collection('Users').find({}).toArray();
    
    if (users.length === 0) {
      console.log('❌ No users found');
    } else {
      users.forEach((user, index) => {
        console.log(`${index + 1}. Name: ${user.name}`);
        console.log(`   Farmer ID: ${user.farmerId}`);
        console.log(`   Role: ${user.role || 'undefined'}`);
        console.log(`   Phone: ${user.phone}`);
        console.log(`   Email: ${user.email || 'N/A'}`);
        console.log(`   District: ${user.district}`);
        console.log('');
      });
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`\nTotal: ${users.length} users\n`);
    
    // Count by role
    const roleCount = {};
    users.forEach(user => {
      const role = user.role || 'undefined';
      roleCount[role] = (roleCount[role] || 0) + 1;
    });
    
    console.log('📊 Role Distribution:');
    Object.entries(roleCount).forEach(([role, count]) => {
      console.log(`   ${role}: ${count} users`);
    });
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    mongoose.connection.close();
  }
};

checkUserRoles();