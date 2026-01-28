const mongoose = require('mongoose');
require('dotenv').config();

const Update = require('../models/Update');
const User = require('../models/User');

const createSampleUpdates = async () => {
  try {
    console.log('📢 Creating sample updates for farmers...\n');
    
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all farmers
    const farmers = await User.find({ role: 'farmer' });
    console.log(`Found ${farmers.length} farmers:`);
    farmers.forEach((farmer, index) => {
      console.log(`${index + 1}. ${farmer.name} (${farmer.farmerId})`);
    });

    // Sample updates for farmers
    const sampleUpdates = [
      {
        title: 'Bid Completed - Winner Declared!',
        message: 'Congratulations! Your bid for rice has been accepted. The buyer will contact you soon for delivery arrangements.',
        type: 'market',
        category: 'bidding',
        priority: 'high'
      },
      {
        title: 'Profile Changes Approved',
        message: 'Your recent profile update request has been approved by the admin. All changes are now active.',
        type: 'general',
        category: 'profile',
        priority: 'medium'
      },
      {
        title: 'New Connection Request',
        message: 'A new buyer has sent you a connection request. Check your connections page to accept or decline.',
        type: 'general',
        category: 'account',
        priority: 'medium'
      },
      {
        title: 'Weather Alert',
        message: 'Heavy rainfall expected in your area for the next 3 days. Please take necessary precautions for your crops.',
        type: 'weather',
        category: 'weather',
        priority: 'high'
      },
      {
        title: 'Price Forecast Update',
        message: 'Rice prices are expected to increase by 8% this week. Consider timing your sales accordingly.',
        type: 'market',
        category: 'market',
        priority: 'medium'
      }
    ];

    console.log(`\n📦 Creating updates for each farmer...`);

    for (const farmer of farmers) {
      // Create 2-3 random updates for each farmer
      const numUpdates = Math.floor(Math.random() * 2) + 2; // 2-3 updates
      const selectedUpdates = sampleUpdates
        .sort(() => 0.5 - Math.random())
        .slice(0, numUpdates);

      for (const updateData of selectedUpdates) {
        // Check if similar update already exists
        const existingUpdate = await Update.findOne({
          userId: farmer._id,
          title: updateData.title
        });

        if (!existingUpdate) {
          const update = new Update({
            ...updateData,
            userId: farmer._id, // Use the MongoDB ObjectId
            createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random time in last 7 days
            isActive: true,
            createdBy: 'system'
          });

          await update.save();
          console.log(`  ✅ Created update for ${farmer.name}: "${updateData.title}"`);
        } else {
          console.log(`  ⏭️  Update already exists for ${farmer.name}: "${updateData.title}"`);
        }
      }
    }

    // Check the results
    console.log(`\n📊 Updates summary by farmer:`);
    for (const farmer of farmers) {
      const updates = await Update.find({ userId: farmer._id });
      console.log(`  ${farmer.name} (${farmer.farmerId}): ${updates.length} updates`);
    }

    console.log(`\n✅ Sample updates created successfully!`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
};

createSampleUpdates();