const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();

const API_URL = 'http://localhost:5050';

async function testBuyerNotificationSystem() {
  console.log('🧪 Testing Buyer Notification System...\n');
  
  try {
    // Test 1: Create order notification
    console.log('📦 Test 1: Creating order notification...');
    const orderNotification = await axios.post(`${API_URL}/api/buyer-notifications/order-notification`, {
      buyerId: 'MGB002',
      type: 'order_placed',
      orderDetails: {
        product: 'Organic Tomatoes',
        quantity: '50 kg',
        orderId: 'ORD-2024-001'
      }
    });
    console.log('✅ Order notification created:', orderNotification.data.message);
    
    // Test 2: Create bidding notification
    console.log('\n🔨 Test 2: Creating bidding notification...');
    const biddingNotification = await axios.post(`${API_URL}/api/buyer-notifications/bidding-notification`, {
      buyerId: 'MGB002',
      type: 'bid_won',
      biddingDetails: {
        product: 'Premium Rice',
        amount: 2500
      }
    });
    console.log('✅ Bidding notification created:', biddingNotification.data.message);
    
    // Test 3: Create account notification
    console.log('\n👤 Test 3: Creating account notification...');
    const accountNotification = await axios.post(`${API_URL}/api/buyer-notifications/account-notification`, {
      buyerId: 'MGB002',
      type: 'profile_updated',
      details: {
        changes: 'Phone Number, Address'
      }
    });
    console.log('✅ Account notification created:', accountNotification.data.message);
    
    // Test 4: Create system notification for all buyers
    console.log('\n🌐 Test 4: Creating system notification...');
    const systemNotification = await axios.post(`${API_URL}/api/buyer-notifications/system-notification`, {
      title: 'Platform Maintenance Notice',
      message: 'The platform will undergo scheduled maintenance on Sunday from 2 AM to 4 AM. All services will be temporarily unavailable during this time.',
      category: 'system'
    });
    console.log('✅ System notification created:', systemNotification.data.message);
    
    // Test 5: Fetch buyer notifications
    console.log('\n📋 Test 5: Fetching buyer notifications...');
    const notifications = await axios.get(`${API_URL}/api/buyer-notifications/buyer/MGB002`);
    console.log(`✅ Retrieved ${notifications.data.length} notifications for buyer MGB002`);
    
    // Display recent notifications
    console.log('\n📢 Recent notifications:');
    notifications.data.slice(0, 3).forEach((notification, index) => {
      console.log(`${index + 1}. ${notification.title}`);
      console.log(`   ${notification.message}`);
      console.log(`   Category: ${notification.category} | Created: ${new Date(notification.createdAt).toLocaleString()}\n`);
    });
    
    // Test 6: Test buyer dashboard integration
    console.log('📊 Test 6: Testing buyer dashboard integration...');
    const dashboardData = await axios.get(`${API_URL}/api/dashboard/buyer/MGB002`);
    console.log(`✅ Dashboard loaded with ${dashboardData.data.updates?.length || 0} updates`);
    
    if (dashboardData.data.updates && dashboardData.data.updates.length > 0) {
      console.log('📢 Updates in dashboard:');
      dashboardData.data.updates.slice(0, 2).forEach((update, index) => {
        console.log(`${index + 1}. ${update.title} (${update.category})`);
      });
    }
    
    console.log('\n🎉 All buyer notification tests completed successfully!');
    console.log('\n📝 Summary:');
    console.log('✅ Order notifications working');
    console.log('✅ Bidding notifications working');
    console.log('✅ Account notifications working');
    console.log('✅ System notifications working');
    console.log('✅ Notification retrieval working');
    console.log('✅ Dashboard integration working');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response?.status === 404) {
      console.log('\n💡 Tip: Make sure the buyer notification routes are properly added to server/index.js');
    }
  }
}

// Run the test
testBuyerNotificationSystem();