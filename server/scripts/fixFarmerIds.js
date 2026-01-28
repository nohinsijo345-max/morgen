const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');

const fixFarmerIds = async () => {
  try {
    console.log('🔧 Fixing missing farmer IDs...\n');
    
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find all users without proper farmer IDs but who should be farmers
    const usersWithoutFarmerIds = await User.find({
      $or: [
        { farmerId: { $exists: false } },
        { farmerId: undefined },
        { farmerId: null },
        { farmerId: '' }
      ]
    });

    console.log(`Found ${usersWithoutFarmerIds.length} users without farmer IDs:`);
    
    let farmerCount = 0;
    let buyerCount = 0;
    let adminCount = 0;

    for (const user of usersWithoutFarmerIds) {
      console.log(`\n📋 Processing: ${user.name} (${user.phone})`);
      
      // Skip admin users
      if (user.name.toLowerCase().includes('admin')) {
        console.log('  → Skipping admin user');
        adminCount++;
        continue;
      }
      
      // Check if this looks like a buyer (has "buyer" in name or specific patterns)
      if (user.name.toLowerCase().includes('buyer') || 
          user.name.toLowerCase().includes('commercial') ||
          user.name.toLowerCase().includes('public')) {
        
        // Generate buyer ID
        const existingBuyers = await User.countDocuments({ 
          buyerId: { $exists: true, $ne: null } 
        });
        const buyerId = `BUY-${String(existingBuyers + buyerCount + 1).padStart(3, '0')}`;
        
        await User.updateOne(
          { _id: user._id },
          { 
            $set: { 
              buyerId: buyerId,
              role: 'buyer'
            }
          }
        );
        
        console.log(`  ✅ Updated as buyer: ${buyerId}`);
        buyerCount++;
      } else {
        // Generate farmer ID
        const existingFarmers = await User.countDocuments({ 
          farmerId: { $exists: true, $ne: null } 
        });
        const farmerId = `FAR-${String(existingFarmers + farmerCount + 1).padStart(3, '0')}`;
        
        await User.updateOne(
          { _id: user._id },
          { 
            $set: { 
              farmerId: farmerId,
              role: 'farmer',
              isActive: true // Make sure they're active
            }
          }
        );
        
        console.log(`  ✅ Updated as farmer: ${farmerId}`);
        farmerCount++;
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`  - Farmers created: ${farmerCount}`);
    console.log(`  - Buyers created: ${buyerCount}`);
    console.log(`  - Admins skipped: ${adminCount}`);

    // Now let's check all farmers
    console.log(`\n👥 All farmers in database:`);
    const allFarmers = await User.find({ role: 'farmer' });
    allFarmers.forEach((farmer, index) => {
      console.log(`${index + 1}. ${farmer.name} (${farmer.farmerId}) - Active: ${farmer.isActive}`);
    });

    console.log(`\n✅ Fix complete! Total farmers: ${allFarmers.length}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
};

fixFarmerIds();