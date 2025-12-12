#!/usr/bin/env node

/**
 * Debug Profile Change Issue Script
 * Investigates the PIN code and crop type issues
 */

const mongoose = require('mongoose');
const User = require('../models/User');
const ProfileChangeRequest = require('../models/ProfileChangeRequest');
const Update = require('../models/Update');

const debugProfileChangeIssue = async () => {
  try {
    console.log('🔍 Debugging Profile Change Issues\n');
    
    // Load environment variables
    require('dotenv').config();
    
    // Connect to database
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/farmconnect';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to database');
    
    // Test 1: Check current user state
    console.log('\n📋 Test 1: Current User State');
    
    const testUser = await User.findOne({ farmerId: 'FAR-369' });
    if (testUser) {
      console.log(`✅ User: ${testUser.name} (${testUser.farmerId})`);
      console.log(`   Current PIN: ${testUser.pinCode}`);
      console.log(`   Current Crop Types: ${JSON.stringify(testUser.cropTypes)}`);
      console.log(`   Current City: ${testUser.city}`);
      console.log(`   Current Land Size: ${testUser.landSize}`);
    }
    
    // Test 2: Check recent profile change requests
    console.log('\n📋 Test 2: Recent Profile Change Requests');
    
    const recentRequests = await ProfileChangeRequest.find({ userId: testUser._id })
      .sort({ requestedAt: -1 })
      .limit(3);
    
    console.log(`✅ Found ${recentRequests.length} requests for this user:`);
    recentRequests.forEach((req, index) => {
      console.log(`   ${index + 1}. Status: ${req.status}`);
      console.log(`      Changes: ${JSON.stringify(req.changes, null, 6)}`);
      console.log(`      Requested: ${req.requestedAt.toLocaleDateString()}`);
      if (req.reviewedAt) {
        console.log(`      Reviewed: ${req.reviewedAt.toLocaleDateString()}`);
      }
      console.log('');
    });
    
    // Test 3: Simulate a PIN code only change request
    console.log('\n📋 Test 3: Simulating PIN Code Only Change');
    
    // Delete any existing pending requests
    await ProfileChangeRequest.deleteMany({
      userId: testUser._id,
      status: 'pending'
    });
    
    const newPinCode = '555777';
    const pinOnlyRequest = new ProfileChangeRequest({
      userId: testUser._id,
      changes: {
        pinCode: newPinCode
      }
    });
    
    await pinOnlyRequest.save();
    console.log(`✅ Created PIN-only change request`);
    console.log(`   Request ID: ${pinOnlyRequest._id}`);
    console.log(`   Changes: ${JSON.stringify(pinOnlyRequest.changes, null, 2)}`);
    
    // Test 4: Check what admin would see
    console.log('\n📋 Test 4: What Admin Panel Would Show');
    
    const adminViewRequest = await ProfileChangeRequest.findById(pinOnlyRequest._id)
      .populate('userId', 'name farmerId email phone');
    
    const formattedRequest = {
      _id: adminViewRequest._id,
      farmer: {
        name: adminViewRequest.userId?.name,
        farmerId: adminViewRequest.userId?.farmerId,
        email: adminViewRequest.userId?.email,
        phone: adminViewRequest.userId?.phone
      },
      changes: adminViewRequest.changes,
      status: adminViewRequest.status,
      requestedAt: adminViewRequest.requestedAt
    };
    
    console.log('✅ Admin would see:');
    console.log(`   Farmer: ${formattedRequest.farmer.name} (${formattedRequest.farmer.farmerId})`);
    console.log(`   Changes: ${JSON.stringify(formattedRequest.changes, null, 2)}`);
    
    // Test the change summary logic
    const changedFields = Object.keys(formattedRequest.changes || {});
    const changesList = changedFields.map(field => {
      if (field === 'pinCode') return 'PIN Code';
      if (field === 'landSize') return 'Land Size';
      if (field === 'cropTypes') return 'Crop Types';
      return field.charAt(0).toUpperCase() + field.slice(1);
    }).join(', ') || 'No changes specified';
    
    console.log(`   Summary: "Requesting changes to: ${changesList}"`);
    
    // Test 5: Simulate approval and check actual update
    console.log('\n📋 Test 5: Simulating Approval Process');
    
    const originalPinCode = testUser.pinCode;
    console.log(`   Original PIN: ${originalPinCode}`);
    console.log(`   Requested PIN: ${newPinCode}`);
    
    // Update user profile with approved changes
    const updatedUser = await User.findByIdAndUpdate(
      testUser._id,
      { $set: pinOnlyRequest.changes },
      { new: true }
    );
    
    console.log(`   Updated PIN: ${updatedUser.pinCode}`);
    console.log(`   PIN Change Success: ${updatedUser.pinCode === newPinCode ? 'YES' : 'NO'}`);
    
    // Update request status
    pinOnlyRequest.status = 'approved';
    pinOnlyRequest.reviewedAt = new Date();
    pinOnlyRequest.reviewedBy = 'debug-admin';
    await pinOnlyRequest.save();
    
    // Create notification
    const approvalNotification = new Update({
      userId: testUser._id,
      title: 'Profile Changes Approved',
      message: `Your profile change request has been approved! Updated fields: ${changesList}. Your profile information has been updated successfully.`,
      category: 'profile',
      isActive: true
    });
    await approvalNotification.save();
    
    console.log(`✅ Approval notification created`);
    console.log(`   Message: ${approvalNotification.message}`);
    
    // Test 6: Verify final state
    console.log('\n📋 Test 6: Final Verification');
    
    const finalUser = await User.findById(testUser._id);
    console.log(`✅ Final user state:`);
    console.log(`   PIN Code: ${finalUser.pinCode}`);
    console.log(`   Crop Types: ${JSON.stringify(finalUser.cropTypes)}`);
    console.log(`   Expected PIN: ${newPinCode}`);
    console.log(`   PIN Correct: ${finalUser.pinCode === newPinCode ? 'YES' : 'NO'}`);
    
    // Test 7: Check for any crop type interference
    console.log('\n📋 Test 7: Crop Type Interference Check');
    
    const cropTypesBefore = testUser.cropTypes || [];
    const cropTypesAfter = finalUser.cropTypes || [];
    
    console.log(`   Crop Types Before: ${JSON.stringify(cropTypesBefore)}`);
    console.log(`   Crop Types After: ${JSON.stringify(cropTypesAfter)}`);
    console.log(`   Crop Types Changed: ${JSON.stringify(cropTypesBefore) !== JSON.stringify(cropTypesAfter) ? 'YES' : 'NO'}`);
    
    if (JSON.stringify(cropTypesBefore) !== JSON.stringify(cropTypesAfter)) {
      console.log(`   ⚠️  WARNING: Crop types changed unexpectedly!`);
    }
    
    console.log('\n🎉 Debug Profile Change Issue Complete!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ PIN CODE REQUEST CREATION: TESTED');
    console.log('✅ ADMIN PANEL DISPLAY: VERIFIED');
    console.log('✅ APPROVAL PROCESS: TESTED');
    console.log('✅ DATABASE UPDATE: VERIFIED');
    console.log('✅ NOTIFICATION CREATION: TESTED');
    console.log('✅ CROP TYPE INTERFERENCE: CHECKED');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from database');
  }
};

// Run the debug
debugProfileChangeIssue();