const mongoose = require('mongoose');
const Crop = require('../models/Crop');
const User = require('../models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/morgem', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const debugCropAvailability = async () => {
  try {
    console.log('🔍 Debugging crop availability for public buyers...\n');

    // 1. Check all crops in database
    const allCrops = await Crop.find({});
    console.log(`📊 Total crops in database: ${allCrops.length}`);
    
    // 2. Check available crops
    const availableCrops = await Crop.find({ available: true });
    console.log(`✅ Available crops: ${availableCrops.length}`);
    
    // 3. Check crops with location data
    const cropsWithLocation = await Crop.find({ 
      available: true,
      'location.state': { $exists: true, $ne: null },
      'location.district': { $exists: true, $ne: null }
    });
    console.log(`📍 Available crops with location: ${cropsWithLocation.length}`);
    
    // 4. Show sample crop data
    if (availableCrops.length > 0) {
      console.log('\n📋 Sample crop data:');
      const sampleCrop = availableCrops[0];
      console.log({
        id: sampleCrop._id,
        name: sampleCrop.name,
        farmerId: sampleCrop.farmerId,
        farmerName: sampleCrop.farmerName,
        available: sampleCrop.available,
        location: sampleCrop.location,
        createdAt: sampleCrop.createdAt
      });
    }
    
    // 5. Check public buyers
    const publicBuyers = await User.find({ 
      role: 'buyer', 
      buyerType: 'public' 
    });
    console.log(`\n👥 Public buyers in database: ${publicBuyers.length}`);
    
    if (publicBuyers.length > 0) {
      const sampleBuyer = publicBuyers[0];
      console.log('\n📋 Sample public buyer data:');
      console.log({
        buyerId: sampleBuyer.buyerId,
        name: sampleBuyer.name,
        state: sampleBuyer.state,
        district: sampleBuyer.district,
        city: sampleBuyer.city,
        pinCode: sampleBuyer.pinCode
      });
      
      // 6. Test filtering by buyer's location
      const buyerState = sampleBuyer.state;
      const buyerDistrict = sampleBuyer.district;
      
      console.log(`\n🔍 Testing filter for ${buyerState}, ${buyerDistrict}:`);
      
      const filteredCrops = await Crop.find({
        available: true,
        'location.state': buyerState,
        'location.district': buyerDistrict
      });
      
      console.log(`📊 Crops matching buyer location: ${filteredCrops.length}`);
      
      if (filteredCrops.length > 0) {
        console.log('\n✅ Matching crops:');
        filteredCrops.forEach((crop, index) => {
          console.log(`${index + 1}. ${crop.name} by ${crop.farmerName} - ${crop.location.district}, ${crop.location.state}`);
        });
      } else {
        console.log('\n❌ No crops found for this location');
        
        // Check what locations exist
        const distinctLocations = await Crop.aggregate([
          { $match: { available: true } },
          { 
            $group: { 
              _id: { 
                state: '$location.state', 
                district: '$location.district' 
              },
              count: { $sum: 1 }
            }
          }
        ]);
        
        console.log('\n📍 Available crop locations:');
        distinctLocations.forEach(loc => {
          console.log(`- ${loc._id.district}, ${loc._id.state} (${loc.count} crops)`);
        });
      }
    }
    
    // 7. Check if pinCode filtering is needed
    console.log('\n🔍 Checking if pinCode-based filtering is needed...');
    
    const farmersWithPinCode = await User.find({ 
      role: 'farmer',
      pinCode: { $exists: true, $ne: null, $ne: '' }
    });
    console.log(`📊 Farmers with pinCode: ${farmersWithPinCode.length}`);
    
    const buyersWithPinCode = await User.find({ 
      role: 'buyer',
      buyerType: 'public',
      pinCode: { $exists: true, $ne: null, $ne: '' }
    });
    console.log(`📊 Public buyers with pinCode: ${buyersWithPinCode.length}`);
    
    if (farmersWithPinCode.length > 0 && buyersWithPinCode.length > 0) {
      console.log('\n💡 Recommendation: Implement pinCode-based filtering for more precise location matching');
      
      // Show sample pinCodes
      console.log('\nSample farmer pinCodes:');
      farmersWithPinCode.slice(0, 3).forEach(farmer => {
        console.log(`- ${farmer.name}: ${farmer.pinCode} (${farmer.district}, ${farmer.state})`);
      });
      
      console.log('\nSample buyer pinCodes:');
      buyersWithPinCode.slice(0, 3).forEach(buyer => {
        console.log(`- ${buyer.name}: ${buyer.pinCode} (${buyer.district}, ${buyer.state})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error debugging crop availability:', error);
  } finally {
    mongoose.connection.close();
  }
};

debugCropAvailability();