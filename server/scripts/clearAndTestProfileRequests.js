#!/usr/bin/env node

/**
 * Clear and Test Profile Requests Script
 * Clears all existing requests and tests with fresh data
 */

const mongoose = require('mongoose');
const ProfileChangeRequest = require('../models/ProfileChangeRequest');
const axios = require('axios');

const API_URL = 'http://localhost:5050';

const clearAndTestProfileRequests = async () => {
  try {
    console.log('🧪 Clear and Test Profile Requests\n');
    
    // Load environment variables
    require('dotenv').config();
    
    // Connect to database
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/farmconnect';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to database');
    
    // Step 1: Clear all existing profile change requests
    console.log('\n📋 Step 1: Clearing All Existing Profile Change Requests');
    
    const deletedCount = await ProfileChangeRequest.deleteMany({});
    console.log(`✅ Deleted ${deletedCount.deletedCount} existing profile change requests`);
    
    // Step 2: Submit a fresh PIN code only request
    console.log('\n📋 Step 2: Submit Fresh PIN Code Only Request');
    
    const testFarmerId = 'FAR-369';
    const newPinCode = '777888';
    
    const profileChangeData = {
      farmerId: testFarmerId,
      changes: {
        pinCode: newPinCode
      }
    };
    
    try {
      const response = await axios.post(`${API_URL}/api/profile/request-change`, profileChangeData);
      console.log('✅ Fresh profile change request submitted successfully');
      console.log(`   Request ID: ${response.data.request._id}`);
      console.log(`   Changes sent: ${JSON.stringify(profileChangeData.changes, null, 2)}`);
      
      // Step 3: Check what's actually stored in database
      console.log('\n📋 Step 3: Check Database Storage');
      
      const storedRequest = await ProfileChangeRequest.findById(response.data.request._id);
      console.log(`✅ Stored request changes: ${JSON.stringify(storedRequest.changes, null, 2)}`);
      
      // Step 4: Check admin panel view
      console.log('\n📋 Step 4: Check Admin Panel View');
      
      const requestsResponse = await axios.get(`${API_URL}/api/admin/profile-requests`);
      const testRequest = requestsResponse.data.find(req => req.farmer?.farmerId === testFarmerId);
      
      if (testRequest) {
        console.log('✅ Found test request in admin panel');
        console.log(`   Changes: ${JSON.stringify(testRequest.changes, null, 2)}`);
        
        // Test the filtering logic
        const changedFields = Object.keys(testRequest.changes || {}).filter(field => {
          // Filter out empty cropTypes arrays
          if (field === 'cropTypes' && Array.isArray(testRequest.changes[field]) && testRequest.changes[field].length === 0) {
            return false;
          }
          return true;
        });
        
        const changesList = changedFields.map(field => {
          if (field === 'pinCode') return 'PIN Code';
          if (field === 'landSize') return 'Land Size';
          if (field === 'cropTypes') return 'Crop Types';
          return field.charAt(0).toUpperCase() + field.slice(1);
        }).join(', ') || 'No changes specified';
        
        console.log(`   Admin Summary: "Requesting changes to: ${changesList}"`);
        console.log(`   Correct Summary: ${changesList === 'PIN Code' ? '✅ YES' : '❌ NO'}`);
        
        // Step 5: Test approval
        console.log('\n📋 Step 5: Test Approval Process');
        
        const approvalResponse = await axios.post(`${API_URL}/api/admin/profile-requests/${testRequest._id}/approve`);
        console.log('✅ Profile change request approved');
        
        // Check notification
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const dashboardResponse = await axios.get(`${API_URL}/api/dashboard/farmer/${testFarmerId}`);
        const updates = dashboardResponse.data.updates || [];
        
        const profileApprovalUpdate = updates.find(update => 
          update.title.includes('Profile Changes Approved') && 
          update.category === 'profile'
        );
        
        if (profileApprovalUpdate) {
          console.log('✅ Profile approval notification found!');
          console.log(`   Message: ${profileApprovalUpdate.message}`);
          
          const correctMessage = profileApprovalUpdate.message.includes('PIN Code') && 
                                !profileApprovalUpdate.message.includes('Name, State, District, City') &&
                                !profileApprovalUpdate.message.includes('Crop Types');
          
          console.log(`   Correct Message: ${correctMessage ? '✅ YES' : '❌ NO'}`);
        } else {
          console.log('❌ Profile approval notification not found');
        }
        
      } else {
        console.log('❌ Test request not found in admin panel');
      }
      
    } catch (error) {
      console.log('❌ Failed to submit request:', error.response?.data?.error || error.message);
    }
    
    console.log('\n🎉 Clear and Test Profile Requests Complete!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from database');
  }
};

// Run the test
clearAndTestProfileRequests();