const mongoose = require('mongoose');
const User = require('../models/User');
const Sale = require('../models/Sale');
const Bid = require('../models/Bid');
require('dotenv').config();

const cleanTestDataAndShowRealUsers = async () => {
  try {
    console.log('🧹 Cleaning test data and showing real users...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // First, let's see all current users
    console.log('\n📋 Current users in database:');
    const allUsers = await User.find({}).select('name farmerId buyerId role phone email createdAt');
    console.log(`Found ${allUsers.length} total users:`);
    
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.role})`);
      console.log(`   ID: ${user.farmerId || user.buyerId || 'N/A'}`);
      console.log(`   Phone: ${user.phone}`);
      console.log(`   Email: ${user.email || 'N/A'}`);
      console.log(`   Created: ${user.createdAt.toLocaleDateString()}`);
      console.log('');
    });

    // Identify test farmers (those created by our seeding script)
    const testFarmerIds = [
      'FAR001', 'FAR002', 'FAR003', 'FAR004', 'FAR005',
      'FAR006', 'FAR007', 'FAR008', 'FAR009', 'FAR010'
    ];

    console.log('🔍 Identifying test data to remove...');
    
    // Find test users
    const testUsers = await User.find({ 
      farmerId: { $in: testFarmerIds } 
    });
    
    console.log(`Found ${testUsers.length} test farmers to remove:`);
    testUsers.forEach(user => {
      console.log(`   - ${user.name} (${user.farmerId})`);
    });

    // Remove test sales data
    console.log('\n🗑️ Removing test sales data...');
    const testSalesResult = await Sale.deleteMany({ 
      farmerId: { $in: testFarmerIds } 
    });
    console.log(`✅ Removed ${testSalesResult.deletedCount} test sales records`);

    // Remove test bid data
    console.log('🗑️ Removing test bid data...');
    const testBidsResult = await Bid.deleteMany({ 
      farmerId: { $in: testFarmerIds } 
    });
    console.log(`✅ Removed ${testBidsResult.deletedCount} test bid records`);

    // Remove test users
    console.log('🗑️ Removing test users...');
    const testUsersResult = await User.deleteMany({ 
      farmerId: { $in: testFarmerIds } 
    });
    console.log(`✅ Removed ${testUsersResult.deletedCount} test users`);

    // Show remaining real users
    console.log('\n👥 Remaining real users:');
    const realUsers = await User.find({}).select('name farmerId buyerId role phone email createdAt totalSales reputationScore');
    
    if (realUsers.length === 0) {
      console.log('❌ No real users found in database');
      console.log('💡 The leaderboard will be empty until real users register and make sales/bids');
    } else {
      console.log(`✅ Found ${realUsers.length} real users:`);
      
      realUsers.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name} (${user.role})`);
        console.log(`   ID: ${user.farmerId || user.buyerId || 'N/A'}`);
        console.log(`   Phone: ${user.phone}`);
        console.log(`   Email: ${user.email || 'N/A'}`);
        console.log(`   Total Sales: ${user.totalSales || 0}`);
        console.log(`   Reputation: ${user.reputationScore || 0}`);
        console.log(`   Registered: ${user.createdAt.toLocaleDateString()}`);
        console.log('');
      });
    }

    // Check remaining sales and bids
    const remainingSales = await Sale.countDocuments();
    const remainingBids = await Bid.countDocuments();
    
    console.log('📊 Database summary after cleanup:');
    console.log(`   Users: ${realUsers.length}`);
    console.log(`   Sales: ${remainingSales}`);
    console.log(`   Bids: ${remainingBids}`);

    if (remainingSales === 0 && remainingBids === 0) {
      console.log('\n💡 Leaderboard will show "No performance data yet" until real users make transactions');
    }

    // Force refresh leaderboard cache
    console.log('\n🔄 Refreshing leaderboard cache...');
    try {
      const axios = require('axios');
      const response = await axios.post('http://localhost:5050/api/leaderboard/refresh');
      console.log('✅ Leaderboard cache refreshed successfully');
    } catch (error) {
      console.log('⚠️ Could not refresh leaderboard cache (server might not be running)');
    }

    console.log('\n🎉 Cleanup completed successfully!');
    console.log('📱 The leaderboard now shows only real registered users');
    console.log('🔄 Refresh your browser to see the updated leaderboard');

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

// Run the cleanup
cleanTestDataAndShowRealUsers();