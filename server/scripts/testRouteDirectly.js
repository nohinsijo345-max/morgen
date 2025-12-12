#!/usr/bin/env node

/**
 * Test Route Directly Script
 * Tests the profile route logic directly without HTTP
 */

const mongoose = require('mongoose');
const User = require('../models/User');
const ProfileChangeRequest = require('../models/ProfileChangeRequest');

const testRouteDirectly = async () => {
  try {
    console.log('🧪 Test Route Logic Directly\n');
    
    // Load environment variables
    require('dotenv').config();
    
    // Connect to database
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/farmconnect';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to database');
    
    // Clear existing requests
    await ProfileChangeRequest.deleteMany({});
    console.log('✅ Cleared existing requests');
    
    // Test the route logic directly
    console.log('\n📋 Testing Route Logic Directly');
    
    const farmerId = 'FAR-369';
    const user = await User.findOne({ farmerId });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    // Simulate the request body
    let changes = { pinCode: '555999' };
    console.log(`🔍 Original changes:`, JSON.stringify(changes, null, 2));
    
    // Apply the route logic
    // Validate changes
    if (!changes || Object.keys(changes).length === 0) {
      console.log('❌ No changes provided');
      return;
    }

    // Remove cropTypes completely - they are handled separately in Account Centre
    if (changes.cropTypes !== undefined) {
      delete changes.cropTypes;
      console.log('🔍 Removed cropTypes from changes');
    }

    // Check if there are still changes after filtering
    if (Object.keys(changes).length === 0) {
      console.log('❌ No valid changes provided');
      return;
    }

    console.log(`🔍 Filtered changes:`, JSON.stringify(changes, null, 2));

    // City validation - must contain at least one letter
    if (changes.city && !/[a-zA-Z]/.test(changes.city)) {
      console.log('❌ Invalid city name');
      return;
    }

    // Check if there's already a pending request
    const existingRequest = await ProfileChangeRequest.findOne({
      userId: user._id,
      status: 'pending'
    });

    if (existingRequest) {
      console.log('❌ Existing request found');
      return;
    }

    console.log(`🔍 Creating request with changes:`, JSON.stringify(changes, null, 2));

    const changeRequest = new ProfileChangeRequest({
      userId: user._id,
      changes
    });

    console.log(`🔍 Before save:`, JSON.stringify(changeRequest.changes, null, 2));
    
    await changeRequest.save();
    
    console.log(`🔍 After save:`, JSON.stringify(changeRequest.changes, null, 2));
    console.log(`✅ Profile change request created successfully`);
    
    // Test with cropTypes included
    console.log('\n📋 Testing with cropTypes Included');
    
    await ProfileChangeRequest.deleteMany({});
    
    let changesWithCropTypes = { 
      pinCode: '666999',
      cropTypes: []
    };
    console.log(`🔍 Original changes with cropTypes:`, JSON.stringify(changesWithCropTypes, null, 2));
    
    // Apply the route logic
    if (changesWithCropTypes.cropTypes !== undefined) {
      delete changesWithCropTypes.cropTypes;
      console.log('🔍 Removed cropTypes from changes');
    }
    
    console.log(`🔍 Filtered changes:`, JSON.stringify(changesWithCropTypes, null, 2));
    
    const changeRequest2 = new ProfileChangeRequest({
      userId: user._id,
      changes: changesWithCropTypes
    });

    console.log(`🔍 Before save (with cropTypes removed):`, JSON.stringify(changeRequest2.changes, null, 2));
    
    await changeRequest2.save();
    
    console.log(`🔍 After save (with cropTypes removed):`, JSON.stringify(changeRequest2.changes, null, 2));
    console.log(`✅ Profile change request created successfully (cropTypes removed)`);
    
    console.log('\n🎉 Route Logic Test Complete!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from database');
  }
};

// Run the test
testRouteDirectly();