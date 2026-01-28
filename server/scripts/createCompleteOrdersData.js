const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');
const Order = require('../models/Order');
const Crop = require('../models/Crop');

const createCompleteOrdersData = async () => {
  try {
    console.log('📊 Creating complete orders data for farmers...\n');
    
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all farmers
    const farmers = await User.find({ role: 'farmer' });
    console.log(`Found ${farmers.length} farmers:`);
    farmers.forEach((farmer, index) => {
      console.log(`${index + 1}. ${farmer.name} (${farmer.farmerId})`);
    });

    // Check if we have any crops
    const existingCrops = await Crop.find().limit(5);
    console.log(`\nFound ${existingCrops.length} existing crops`);

    let cropId;
    if (existingCrops.length > 0) {
      cropId = existingCrops[0]._id;
      console.log(`Using existing crop: ${existingCrops[0].name} (${cropId})`);
    } else {
      // Create a sample crop
      const sampleCrop = new Crop({
        name: 'Rice',
        category: 'Grains',
        farmerId: 'FAR-369',
        farmerName: 'Nohin Sijo',
        quantity: 100,
        pricePerUnit: 25,
        unit: 'kg',
        quality: 'Premium',
        harvestDate: new Date(),
        location: {
          state: 'Kerala',
          district: 'Ernakulam',
          city: 'Kochi'
        },
        isActive: true
      });
      
      await sampleCrop.save();
      cropId = sampleCrop._id;
      console.log(`Created sample crop: ${sampleCrop.name} (${cropId})`);
    }

    // Create sample orders with all required fields
    const sampleOrders = [
      {
        farmerId: 'FAR-003',
        farmerName: 'Nohin Sijo',
        buyerId: 'BUY-001',
        buyerName: 'Sample Commercial Buyer',
        buyerType: 'commercial',
        cropId: cropId,
        quantity: 20,
        pricePerUnit: 22.5,
        totalAmount: 450.0,
        status: 'completed',
        completedAt: new Date('2026-01-20T10:30:00Z'),
        cropDetails: { name: 'Rice', category: 'Grains', quality: 'Premium', unit: 'kg' }
      },
      {
        farmerId: 'FAR-005',
        farmerName: 'NEW COM',
        buyerId: 'BUY-002',
        buyerName: 'Public Buyer 1',
        buyerType: 'public',
        cropId: cropId,
        quantity: 12,
        pricePerUnit: 23.375,
        totalAmount: 280.5,
        status: 'completed',
        completedAt: new Date('2026-01-22T14:15:00Z'),
        cropDetails: { name: 'Rice', category: 'Grains', quality: 'Premium', unit: 'kg' }
      },
      {
        farmerId: 'FAR-005',
        farmerName: 'NEW COM',
        buyerId: 'BUY-003',
        buyerName: 'Commercial Buyer 2',
        buyerType: 'commercial',
        cropId: cropId,
        quantity: 16,
        pricePerUnit: 20.0,
        totalAmount: 320.0,
        status: 'completed',
        completedAt: new Date('2026-01-25T09:45:00Z'),
        cropDetails: { name: 'Rice', category: 'Grains', quality: 'Premium', unit: 'kg' }
      },
      {
        farmerId: 'FAR-003',
        farmerName: 'Nohin Sijo',
        buyerId: 'BUY-001',
        buyerName: 'Sample Commercial Buyer',
        buyerType: 'commercial',
        cropId: cropId,
        quantity: 8,
        pricePerUnit: 22.59375,
        totalAmount: 180.75,
        status: 'completed',
        completedAt: new Date('2026-01-26T16:20:00Z'),
        cropDetails: { name: 'Rice', category: 'Grains', quality: 'Premium', unit: 'kg' }
      }
    ];

    console.log(`\n📦 Creating ${sampleOrders.length} complete orders...`);

    for (const orderData of sampleOrders) {
      // Check if order already exists
      const existingOrder = await Order.findOne({
        farmerId: orderData.farmerId,
        totalAmount: orderData.totalAmount,
        status: 'completed'
      });

      if (!existingOrder) {
        // Generate unique order ID
        const orderId = await Order.generateOrderId();
        
        const order = new Order({
          ...orderData,
          orderId: orderId,
          createdAt: orderData.completedAt,
          updatedAt: orderData.completedAt
        });

        await order.save();
        console.log(`  ✅ Created order ${orderId} for ${orderData.farmerName}: ₹${orderData.totalAmount}`);
      } else {
        console.log(`  ⏭️  Order already exists for ${orderData.farmerName}: ₹${orderData.totalAmount}`);
      }
    }

    // Check the results
    console.log(`\n📊 Sales summary by farmer:`);
    for (const farmer of farmers) {
      const completedOrders = await Order.find({
        farmerId: farmer.farmerId,
        status: 'completed'
      });

      const totalSales = completedOrders.length;
      const totalRevenue = completedOrders.reduce((sum, order) => sum + order.totalAmount, 0);

      console.log(`  ${farmer.name} (${farmer.farmerId}):`);
      console.log(`    - Sales: ${totalSales}`);
      console.log(`    - Revenue: ₹${totalRevenue.toFixed(2)}`);
    }

    console.log(`\n✅ Complete orders data created successfully!`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
};

createCompleteOrdersData();