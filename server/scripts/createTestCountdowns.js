const axios = require('axios');

const API_URL = 'http://localhost:5050';

async function createTestCountdowns() {
  console.log('🧪 Creating Test Countdown Crops');
  console.log('=' .repeat(40));

  try {
    // Create test countdowns with different harvest dates
    const testCountdowns = [
      {
        cropName: 'tomato',
        category: 'vegetables',
        quantity: 50,
        unit: 'kg',
        plantedDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
        harvestDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        farmerId: 'FAR-369',
        farmerName: 'Nohin Sijo'
      },
      {
        cropName: 'wheat',
        category: 'grains',
        quantity: 100,
        unit: 'kg',
        plantedDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
        harvestDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        farmerId: 'FAR-369',
        farmerName: 'Nohin Sijo'
      }
    ];

    console.log('\n📝 Creating test countdowns...');
    
    for (const countdown of testCountdowns) {
      try {
        const response = await axios.post(`${API_URL}/api/harvest/countdowns`, countdown);
        console.log(`✅ Created ${countdown.cropName} countdown`);
        console.log(`   Harvest Date: ${countdown.harvestDate.toLocaleDateString()}`);
        console.log(`   Days Left: ${response.data.countdown.daysLeft}`);
      } catch (error) {
        if (error.response?.status === 400 && error.response?.data?.error?.includes('Maximum')) {
          console.log(`⚠️  Cannot create ${countdown.cropName}: Maximum countdowns reached`);
        } else {
          console.log(`❌ Failed to create ${countdown.cropName}:`, error.response?.data?.error || error.message);
        }
      }
    }

    // Get updated countdowns
    console.log('\n📋 Current countdowns after creation:');
    try {
      const countdownsResponse = await axios.get(`${API_URL}/api/harvest/countdowns/FAR-369`);
      const countdowns = countdownsResponse.data;
      
      countdowns.forEach((countdown, index) => {
        console.log(`${index + 1}. ${countdown.cropName}:`);
        console.log(`   Days Left: ${countdown.daysLeft}`);
        console.log(`   Status: ${countdown.status}`);
        console.log(`   Harvest Date: ${new Date(countdown.harvestDate).toLocaleDateString()}`);
        console.log(`   Quantity: ${countdown.quantity} ${countdown.unit}`);
      });
    } catch (error) {
      console.log('❌ Failed to get countdowns:', error.response?.data?.error || error.message);
    }

    // Trigger update to test notifications
    console.log('\n🔄 Triggering countdown update to test notifications...');
    try {
      const updateResponse = await axios.post(`${API_URL}/api/harvest/update-all-countdowns`);
      console.log('✅ Update completed');
      console.log(`📊 Notifications sent: ${updateResponse.data.summary.notificationsSent}`);
    } catch (error) {
      console.log('❌ Update failed:', error.response?.data?.error || error.message);
    }

    // Check notifications
    console.log('\n📢 Checking for new notifications...');
    try {
      const dashboardResponse = await axios.get(`${API_URL}/api/dashboard/farmer/FAR-369`);
      const updates = dashboardResponse.data.updates || [];
      const harvestUpdates = updates.filter(u => u.category === 'harvest');
      
      console.log(`Found ${harvestUpdates.length} harvest notifications:`);
      harvestUpdates.forEach((update, index) => {
        console.log(`${index + 1}. ${update.title}`);
        console.log(`   ${update.message}`);
        console.log(`   Created: ${new Date(update.createdAt).toLocaleString()}`);
      });
    } catch (error) {
      console.log('❌ Failed to check notifications:', error.response?.data?.error || error.message);
    }

    console.log('\n🎉 Test countdown creation completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

createTestCountdowns();