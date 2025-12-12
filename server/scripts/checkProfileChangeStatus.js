#!/usr/bin/env node

/**
 * Check Profile Change Status Script
 * Checks the current state of profile change requests and notifications
 */

const mongoose = require('mongoose');
const User = require('../models/User');
const Update = require('../models/Update');
const ProfileChangeRequest = require('../models/ProfileChangeRequest');

const checkProfileChangeStatus = async () => {
  try {
    console.log('🔍 Checking Profile Change System Status\n');
    
    // Load environment variables
    require('dotenv').config();
    
    // Connect to database
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/farmconnect';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to database');
    
    // Check 1: Profile Change Request Model
    console.log('\n📋 Check 1: Profile Change Request Model');
    
    const allRequests = await ProfileChangeRequest.find().populate('userId', 'name farmerId');
    console.log(`✅ Found ${allRequests.length} total profile change requests`);
    
    const pendingRequests = allRequests.filter(req => req.status === 'pending');
    const approvedRequests = allRequests.filter(req => req.status === 'approved');
    const rejectedRequests = allRequests.filter(req => req.status === 'rejected');
    
    console.log(`   - Pending: ${pendingRequests.length}`);
    console.log(`   - Approved: ${approvedRequests.length}`);
    console.log(`   - Rejected: ${rejectedRequests.length}`);
    
    // Show recent requests
    if (allRequests.length > 0) {
      console.log('\n📋 Recent Profile Change Requests:');
      allRequests.slice(-5).forEach((req, index) => {
        const userName = req.userId?.name || 'Unknown';
        const farmerId = req.userId?.farmerId || 'N/A';
        console.log(`   ${index + 1}. ${userName} (${farmerId}) - Status: ${req.status}`);
        console.log(`      Changes: ${JSON.stringify(req.changes, null, 6)}`);
        console.log(`      Requested: ${req.requestedAt.toLocaleDateString()}`);
        if (req.reviewedAt) {
          console.log(`      Reviewed: ${req.reviewedAt.toLocaleDateString()}`);
        }
        console.log('');
      });
    }
    
    // Check 2: PIN Code Integration
    console.log('\n📋 Check 2: PIN Code Integration in User Model');
    
    const usersWithPinCodes = await User.find({ pinCode: { $exists: true, $ne: '' } });
    console.log(`✅ Found ${usersWithPinCodes.length} users with PIN codes`);
    
    if (usersWithPinCodes.length > 0) {
      console.log('   Sample users with PIN codes:');
      usersWithPinCodes.slice(0, 3).forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.name} (${user.farmerId}): PIN ${user.pinCode}`);
      });
    }
    
    // Check 3: Profile-related Notifications
    console.log('\n📋 Check 3: Profile-related Notifications');
    
    const profileNotifications = await Update.find({ 
      category: 'profile' 
    }).populate('userId', 'name farmerId').sort({ createdAt: -1 });
    
    console.log(`✅ Found ${profileNotifications.length} profile-related notifications`);
    
    if (profileNotifications.length > 0) {
      console.log('   Recent profile notifications:');
      profileNotifications.slice(0, 5).forEach((update, index) => {
        const userName = update.userId?.name || 'Unknown';
        const farmerId = update.userId?.farmerId || 'N/A';
        console.log(`   ${index + 1}. To: ${userName} (${farmerId})`);
        console.log(`      Title: ${update.title}`);
        console.log(`      Message: ${update.message.substring(0, 80)}...`);
        console.log(`      Created: ${update.createdAt.toLocaleString()}`);
        console.log('');
      });
    }
    
    // Check 4: Transport Notifications
    console.log('\n📋 Check 4: Transport-related Notifications');
    
    const transportNotifications = await Update.find({ 
      category: 'transport' 
    }).populate('userId', 'name farmerId').sort({ createdAt: -1 });
    
    console.log(`✅ Found ${transportNotifications.length} transport-related notifications`);
    
    if (transportNotifications.length > 0) {
      console.log('   Recent transport notifications:');
      transportNotifications.slice(0, 3).forEach((update, index) => {
        const userName = update.userId?.name || 'Unknown';
        const farmerId = update.userId?.farmerId || 'N/A';
        console.log(`   ${index + 1}. To: ${userName} (${farmerId})`);
        console.log(`      Title: ${update.title}`);
        console.log(`      Created: ${update.createdAt.toLocaleString()}`);
      });
    }
    
    // Check 5: Overall System Health
    console.log('\n📋 Check 5: System Health Summary');
    
    const totalUsers = await User.countDocuments();
    const totalUpdates = await Update.countDocuments();
    const activeUpdates = await Update.countDocuments({ isActive: true });
    
    console.log('✅ System Statistics:');
    console.log(`   - Total Users: ${totalUsers}`);
    console.log(`   - Total Updates: ${totalUpdates}`);
    console.log(`   - Active Updates: ${activeUpdates}`);
    console.log(`   - Profile Change Requests: ${allRequests.length}`);
    console.log(`   - Users with PIN Codes: ${usersWithPinCodes.length}`);
    
    // Check 6: Test Specific Farmers
    console.log('\n📋 Check 6: Test Farmer Status');
    
    const testFarmers = ['MGN001', 'MGN002', 'MGN003'];
    
    for (const farmerId of testFarmers) {
      const user = await User.findOne({ farmerId });
      if (user) {
        const pendingRequest = await ProfileChangeRequest.findOne({
          userId: user._id,
          status: 'pending'
        });
        
        const recentUpdates = await Update.find({ userId: user._id })
          .sort({ createdAt: -1 })
          .limit(3);
        
        console.log(`   ${farmerId} (${user.name}):`);
        console.log(`     PIN Code: ${user.pinCode || 'Not set'}`);
        console.log(`     Pending Request: ${pendingRequest ? 'Yes' : 'No'}`);
        console.log(`     Recent Updates: ${recentUpdates.length}`);
      } else {
        console.log(`   ${farmerId}: User not found`);
      }
    }
    
    console.log('\n🎉 Profile Change Status Check Complete!');
    
  } catch (error) {
    console.error('❌ Check failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from database');
  }
};

// Run the check
checkProfileChangeStatus();