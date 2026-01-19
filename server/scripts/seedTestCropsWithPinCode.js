const mongoose = require('mongoose');
const Crop = require('../models/Crop');
const User = require('../models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/morgem', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const seedTestCropsWithPinCode = async () => {
  try {
    console.log('🌱 Seeding test crops with pinCode data...\n');

    // First, let's check if we have farmers with pinCodes
    const farmersWithPinCode = await User.find({ 
      role: 'farmer',
      pinCode: { $exists: true, $ne: null, $ne: '' }
    }).limit(5);

    console.log(`📊 Found ${farmersWithPinCode.length} farmers with pinCode`);

    if (farmersWithPinCode.length === 0) {
      console.log('⚠️ No farmers with pinCode found. Creating test farmers...');
      
      // Create test farmers with pinCodes
      const testFarmers = [
        {
          name: 'Ravi Kumar',
          role: 'farmer',
          farmerId: 'MGF001',
          pin: '1234',
          phone: '9876543210',
          state: 'Kerala',
          district: 'Ernakulam',
          city: 'Kochi',
          pinCode: '682001'
        },
        {
          name: 'Priya Nair',
          role: 'farmer',
          farmerId: 'MGF002',
          pin: '5678',
          phone: '9876543211',
          state: 'Kerala',
          district: 'Ernakulam',
          city: 'Kochi',
          pinCode: '682001'
        },
        {
          name: 'Suresh Menon',
          role: 'farmer',
          farmerId: 'MGF003',
          pin: '9012',
          phone: '9876543212',
          state: 'Kerala',
          district: 'Ernakulam',
          city: 'Aluva',
          pinCode: '683101'
        }
      ];

      for (const farmerData of testFarmers) {
        const existingFarmer = await User.findOne({ farmerId: farmerData.farmerId });
        if (!existingFarmer) {
          const farmer = new User(farmerData);
          await farmer.save();
          console.log(`✅ Created farmer: ${farmerData.name} (PIN: ${farmerData.pinCode})`);
        }
      }

      // Refresh the farmers list
      const updatedFarmers = await User.find({ 
        role: 'farmer',
        pinCode: { $exists: true, $ne: null, $ne: '' }
      }).limit(5);
      
      farmersWithPinCode.push(...updatedFarmers);
    }

    // Create test crops for these farmers
    const testCrops = [
      {
        farmerId: 'MGF001',
        farmerName: 'Ravi Kumar',
        name: 'Organic Rice',
        category: 'grains',
        quantity: 50,
        unit: 'kg',
        pricePerUnit: 45,
        basePrice: 45,
        quality: 'A',
        harvestDate: new Date('2026-03-15'),
        description: 'Premium organic rice, pesticide-free',
        location: {
          state: 'Kerala',
          district: 'Ernakulam',
          city: 'Kochi'
        },
        available: true,
        status: 'listed'
      },
      {
        farmerId: 'MGF002',
        farmerName: 'Priya Nair',
        name: 'Fresh Tomatoes',
        category: 'vegetables',
        quantity: 25,
        unit: 'kg',
        pricePerUnit: 35,
        basePrice: 35,
        quality: 'A',
        harvestDate: new Date('2026-02-20'),
        description: 'Vine-ripened tomatoes, perfect for cooking',
        location: {
          state: 'Kerala',
          district: 'Ernakulam',
          city: 'Kochi'
        },
        available: true,
        status: 'listed'
      },
      {
        farmerId: 'MGF003',
        farmerName: 'Suresh Menon',
        name: 'Coconuts',
        category: 'fruits',
        quantity: 100,
        unit: 'piece',
        pricePerUnit: 15,
        basePrice: 15,
        quality: 'A',
        harvestDate: new Date('2026-02-25'),
        description: 'Fresh coconuts from organic farm',
        location: {
          state: 'Kerala',
          district: 'Ernakulam',
          city: 'Aluva'
        },
        available: true,
        status: 'listed'
      }
    ];

    console.log('\n🌾 Creating test crops...');
    
    for (const cropData of testCrops) {
      // Check if crop already exists
      const existingCrop = await Crop.findOne({ 
        farmerId: cropData.farmerId,
        name: cropData.name 
      });
      
      if (!existingCrop) {
        const crop = new Crop(cropData);
        await crop.save();
        console.log(`✅ Created crop: ${cropData.name} by ${cropData.farmerName}`);
      } else {
        console.log(`⚠️ Crop already exists: ${cropData.name} by ${cropData.farmerName}`);
      }
    }

    // Create test public buyers with pinCodes
    console.log('\n👥 Creating test public buyers...');
    
    const testBuyers = [
      {
        name: 'Anjali Pillai',
        role: 'buyer',
        buyerId: 'MGPB001',
        buyerType: 'public',
        pin: '1111',
        phone: '9876543220',
        state: 'Kerala',
        district: 'Ernakulam',
        city: 'Kochi',
        pinCode: '682001' // Same as farmers MGF001 and MGF002
      },
      {
        name: 'Rajesh Nair',
        role: 'buyer',
        buyerId: 'MGPB002',
        buyerType: 'public',
        pin: '2222',
        phone: '9876543221',
        state: 'Kerala',
        district: 'Ernakulam',
        city: 'Aluva',
        pinCode: '683101' // Same as farmer MGF003
      }
    ];

    for (const buyerData of testBuyers) {
      const existingBuyer = await User.findOne({ buyerId: buyerData.buyerId });
      if (!existingBuyer) {
        const buyer = new User(buyerData);
        await buyer.save();
        console.log(`✅ Created buyer: ${buyerData.name} (PIN: ${buyerData.pinCode})`);
      } else {
        console.log(`⚠️ Buyer already exists: ${buyerData.name}`);
      }
    }

    console.log('\n🎉 Test data seeding completed!');
    console.log('\n📋 Summary:');
    console.log('- Farmers in PIN 682001: Ravi Kumar, Priya Nair');
    console.log('- Farmer in PIN 683101: Suresh Menon');
    console.log('- Public buyer in PIN 682001: Anjali Pillai (should see Rice & Tomatoes)');
    console.log('- Public buyer in PIN 683101: Rajesh Nair (should see Coconuts)');

  } catch (error) {
    console.error('❌ Error seeding test data:', error);
  } finally {
    mongoose.connection.close();
  }
};

seedTestCropsWithPinCode();