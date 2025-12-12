#!/usr/bin/env node

/**
 * Direct Database Test Script
 * Tests the ProfileChangeRequest model directly
 */

const mongoose = require('mongoose');
const User = require('../models/User');
const ProfileChangeRequest = require('../models/ProfileChangeRequest');

const directDatabaseTest = async () => {
  try {
    console.log('🧪 Direct Database Test\n');
    
    // Load environment variables
    require('dotenv').config();
    
    // Connect to database
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/farmconnect';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to database');
    
    // Test 1: Find test user
    console.log('\n📋 Test 1: Find Test User');
    
    const testUser = await User.findOne({ farmerId: 'FAR-369' });
    if (!testUser) {
      console.log('❌ Test user not found');
      return;
    }
    console.log(`✅ Found test user: ${testUser.name} (${testUser.farmerId})`);
    
    // Test 2: Create ProfileChangeRequest directly
    console.log('\n📋 Test 2: Create ProfileChangeRequest Directly');
    
    const changes = { pinCode: '999111' };
    console.log(`🔍 Creating request with changes:`, JSON.stringify(changes, null, 2));
    
    const changeRequest = new ProfileChangeRequest({
      userId: testUser._id,
      changes: changes
    });
    
    console.log(`🔍 Before save:`, JSON.stringify(changeRequest.changes, null, 2));
    
    await changeRequest.save();
    
    console.log(`🔍 After save:`, JSON.stringify(changeRequest.changes, null, 2));
    console.log(`✅ Request saved with ID: ${changeRequest._id}`);
    
    // Test 3: Retrieve from database
    console.log('\n📋 Test 3: Retrieve from Database');
    
    const retrievedRequest = await ProfileChangeRequest.findById(changeRequest._id);
    console.log(`🔍 Retrieved changes:`, JSON.stringify(retrievedRequest.changes, null, 2));
    
    // Test 4: Check schema
    console.log('\n📋 Test 4: Check Schema');
    
    const schema = ProfileChangeRequest.schema;
    console.log(`🔍 Schema paths:`, Object.keys(schema.paths));
    console.log(`🔍 Changes schema:`, schema.paths.changes);
    
    if (schema.paths.changes && schema.paths.changes.schema) {
      console.log(`🔍 Changes sub-schema paths:`, Object.keys(schema.paths.changes.schema.paths));
    }
    
    // Test 5: Test with minimal changes object
    console.log('\n📋 Test 5: Test with Minimal Changes Object');
    
    const minimalRequest = new ProfileChangeRequest({
      userId: testUser._id,
      changes: { pinCode: '888999' }
    });
    
    // Don't save, just check the object
    console.log(`🔍 Minimal request changes:`, JSON.stringify(minimalRequest.changes, null, 2));
    console.log(`🔍 Minimal request toObject:`, JSON.stringify(minimalRequest.toObject().changes, null, 2));
    
    console.log('\n🎉 Direct Database Test Complete!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from database');
  }
};

// Run the test
directDatabaseTest();