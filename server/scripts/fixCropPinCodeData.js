const mongoose = require('mongoose');
const Crop = require('../models/Crop');
const User = require('../models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/morgem', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const fixCropPinCodeData = async () => {
  try {
    console.log('🔧 Fixing crop pinCode data...\n');

    // Get all crops that don't have pinCode in location
    const cropsWithoutPinCode = await Crop.find({
      $or: [
        { 'location.pinCode': { $exists: false } },
        { 'location.pinCode': null },
        { 'location.pinCode': '' }
      ]
    });

    console.log(`📊 Found ${cropsWithoutPinCode.length} crops without pinCode`);

    let updatedCount = 0;
    let errorCount = 0;

    for (const crop of cropsWithoutPinCode) {
      try {
        // Find the farmer for this crop
        const farmer = await User.findOne({ 
          farmerId: crop.farmerId, 
          role: 'farmer' 
        });

        if (farmer && farmer.pinCode) {
          // Update the crop with farmer's pinCode
          await Crop.updateOne(
            { _id: crop._id },
            { 
              $set: { 
                'location.pinCode': farmer.pinCode,
                'location.state': farmer.state || crop.location?.state,
                'location.district': farmer.district || crop.location?.district,
                'location.city': farmer.city || crop.location?.city
              }
            }
          );

          console.log(`✅ Updated ${crop.name} by ${crop.farmerName} with pinCode ${farmer.pinCode}`);
          updatedCount++;
        } else {
          console.log(`⚠️ No pinCode found for farmer ${crop.farmerName} (${crop.farmerId})`);
        }
      } catch (error) {
        console.error(`❌ Error updating crop ${crop._id}:`, error.message);
        errorCount++;
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`✅ Updated: ${updatedCount} crops`);
    console.log(`⚠️ Errors: ${errorCount} crops`);
    console.log(`📍 Remaining without pinCode: ${cropsWithoutPinCode.length - updatedCount}`);

    // Verify the fix
    console.log('\n🔍 Verifying fix...');
    const cropsWithPinCode = await Crop.find({
      'location.pinCode': { $exists: true, $ne: null, $ne: '' }
    });

    console.log(`✅ Crops with pinCode after fix: ${cropsWithPinCode.length}`);

    // Show sample data
    if (cropsWithPinCode.length > 0) {
      console.log('\n📋 Sample crops with pinCode:');
      cropsWithPinCode.slice(0, 3).forEach((crop, index) => {
        console.log(`${index + 1}. ${crop.name} by ${crop.farmerName} - PIN ${crop.location.pinCode}`);
      });
    }

  } catch (error) {
    console.error('❌ Error fixing crop pinCode data:', error);
  } finally {
    mongoose.connection.close();
  }
};

fixCropPinCodeData();