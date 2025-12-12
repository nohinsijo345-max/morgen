const axios = require('axios');

const API_URL = 'http://localhost:5050';

async function checkAllNotifications() {
  console.log('🔍 Checking All Farmer Notifications');
  console.log('=' .repeat(40));

  try {
    // Get all notifications for the farmer
    const dashboardResponse = await axios.get(`${API_URL}/api/dashboard/farmer/FAR-369`);
    const updates = dashboardResponse.data.updates || [];
    
    console.log(`📢 Total notifications: ${updates.length}`);
    
    // Filter profile-related notifications
    const profileUpdates = updates.filter(u => u.category === 'profile');
    console.log(`📋 Profile-related notifications: ${profileUpdates.length}`);
    
    console.log('\n📝 All profile notifications (newest first):');
    profileUpdates.forEach((update, index) => {
      console.log(`${index + 1}. ${update.title}`);
      console.log(`   Message: ${update.message}`);
      console.log(`   Created: ${new Date(update.createdAt).toLocaleString()}`);
      console.log(`   ID: ${update._id}`);
      console.log('');
    });
    
    // Check if there are any very recent ones (last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const recentUpdates = profileUpdates.filter(u => new Date(u.createdAt) > fiveMinutesAgo);
    
    console.log(`🕐 Recent notifications (last 5 minutes): ${recentUpdates.length}`);
    recentUpdates.forEach((update, index) => {
      console.log(`${index + 1}. ${update.title} - ${update.message}`);
    });

  } catch (error) {
    console.error('❌ Failed to check notifications:', error.message);
  }
}

checkAllNotifications();