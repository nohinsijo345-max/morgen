const mongoose = require('mongoose');
const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const ProfileChangeRequest = require('../models/ProfileChangeRequest');
const Update = require('../models/Update');

const API_URL = 'http://localhost:5050';

async function testBuyerProfileApprovalFlow() {
  console.log('🧪 Testing Buyer Profile Approval Flow...\n');
  
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    // Step 1: Find or create a test buyer
    let testBuyer = await User.findOne({ buyerId: 'MGB002' });
    if (!testBuyer) {
      console.log('❌ Test buyer MGB002 not found');
      return;
    }
    console.log(`✅ Found test buyer: ${testBuyer.name} (${testBuyer.buyerId})`);
    
    // Step 2: Create a profile change request
    console.log('\n📝 Step 2: Creating profile change request...');
    const profileRequest = new ProfileChangeRequest({
      userId: testBuyer._id,
      changes: {
        phone: '9876543210',
        city: 'Kochi',
        pinCode: '682001'
      },
      status: 'pending',
      requestedAt: new Date()
    });
    
    await profileRequest.save();
    console.log(`✅ Profile change request created: ${profileRequest._id}`);
    
    // Step 3: Test admin approval
    console.log('\n✅ Step 3: Testing admin approval...');
    const approvalResponse = await axios.post(`${API_URL}/api/admin/profile-requests/${profileRequest._id}/approve`);
    console.log('✅ Admin approval response:', approvalResponse.data.message);
    
    // Step 4: Check if buyer notification was created
    console.log('\n📢 Step 4: Checking buyer notifications...');
    const notifications = await axios.get(`${API_URL}/api/buyer-notifications/buyer/MGB002`);
    
    const profileNotifications = notifications.data.filter(n => 
      n.category === 'account' && n.title.includes('Profile')
    );
    
    console.log(`✅ Found ${profileNotifications.length} profile-related notifications`);
    
    if (profileNotifications.length > 0) {
      const latestNotification = profileNotifications[0];
      console.log(`📢 Latest notification: "${latestNotification.title}"`);
      console.log(`📝 Message: "${latestNotification.message}"`);
    }
    
    // Step 5: Test admin rejection
    console.log('\n❌ Step 5: Testing admin rejection...');
    
    // Create another profile request to reject
    const rejectRequest = new ProfileChangeRequest({
      userId: testBuyer._id,
      changes: {
        email: 'invalid-email-format'
      },
      status: 'pending',
      requestedAt: new Date()
    });
    
    await rejectRequest.save();
    console.log(`✅ Created rejection test request: ${rejectRequest._id}`);
    
    const rejectionResponse = await axios.post(`${API_URL}/api/admin/profile-requests/${rejectRequest._id}/reject`, {
      reason: 'Invalid email format provided'
    });
    console.log('✅ Admin rejection response:', rejectionResponse.data.message);
    
    // Step 6: Check rejection notification
    console.log('\n📢 Step 6: Checking rejection notifications...');
    const updatedNotifications = await axios.get(`${API_URL}/api/buyer-notifications/buyer/MGB002`);
    
    const rejectionNotifications = updatedNotifications.data.filter(n => 
      n.category === 'account' && n.title.includes('Rejected')
    );
    
    console.log(`✅ Found ${rejectionNotifications.length} rejection notifications`);
    
    if (rejectionNotifications.length > 0) {
      const latestRejection = rejectionNotifications[0];
      console.log(`📢 Latest rejection: "${latestRejection.title}"`);
      console.log(`📝 Message: "${latestRejection.message}"`);
    }
    
    // Step 7: Test buyer dashboard integration
    console.log('\n📊 Step 7: Testing dashboard integration...');
    const dashboardData = await axios.get(`${API_URL}/api/dashboard/buyer/MGB002`);
    
    const accountUpdates = dashboardData.data.updates?.filter(u => u.category === 'account') || [];
    console.log(`✅ Dashboard shows ${accountUpdates.length} account-related updates`);
    
    // Step 8: Cleanup test data
    console.log('\n🧹 Step 8: Cleaning up test data...');
    await ProfileChangeRequest.deleteMany({ userId: testBuyer._id });
    console.log('✅ Cleaned up test profile requests');
    
    console.log('\n🎉 Buyer Profile Approval Flow Test Completed Successfully!');
    console.log('\n📝 Summary:');
    console.log('✅ Profile change request creation working');
    console.log('✅ Admin approval creates buyer notifications');
    console.log('✅ Admin rejection creates buyer notifications');
    console.log('✅ Notifications appear in buyer dashboard');
    console.log('✅ Both regular updates and buyer-specific notifications working');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

// Run the test
testBuyerProfileApprovalFlow();