const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');
const Order = require('../models/Order');

const createSampleSalesData = async () => {
  try {
    console.log('📊 Creating sample sales data for farmers...\n');
    
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all farmers
    const farmers = await User.find({ role: 'farmer' });
    console.log(`Found ${farmers.length} farmers:`);
    farmers.forEach((farmer, index) => {
      console.log(`${index + 1}. ${farmer.name} (${farmer.farmerId})`);
    });

    // Create sample orders for farmers who don't have any
    const sampleOrders = [
      {
        farmerId: 'FAR-003',
        farmerName: 'Nohin Sijo',
        totalAmount: 450.0,
        status: 'completed',
        completedAt: new Date('2026-01-20T10:30:00Z'),
        cropDetails: { name: 'Wheat' },
        buyerId: 'BUY-001',
        buyerName: 'Sample Buyer 1'
      },
      {
        farmerId: 'FAR-005',
        farmerName: 'NEW COM',
        totalAmount: 280.5,
        status: 'completed',
        completedAt: new Date('2026-01-22T14:15:00Z'),
        cropDetails: { name: 'Rice' },
        buyerId: 'BUY-002',
        buyerName: 'Sample Buyer 2'
      },
      {
        farmerId: 'FAR-005',
        farmerName: 'NEW COM',
        totalAmount: 320.0,
        status: 'completed',
        completedAt: new Date('2026-01-25T09:45:00Z'),
        cropDetails: { name: 'Corn' },
        buyerId: 'BUY-003',
        buyerName: 'Sample Buyer 3'
      },
      {
        farmerId: 'FAR-003',
        farmerName: 'Nohin Sijo',
        totalAmount: 180.75,
        status: 'completed',
        completedAt: new Date('2026-01-26T16:20:00Z'),
        cropDetails: { name: 'Barley' },
        buyerId: 'BUY-001',
        buyerName: 'Sample Buyer 1'
      }
    ];

    console.log(`\n📦 Creating ${sampleOrders.length} sample orders...`);

    for (const orderData of sampleOrders) {
      // Check if order already exists
      const existingOrder = await Order.findOne({
        farmerId: orderData.farmerId,
        totalAmount: orderData.totalAmount,
        status: 'completed'
      });

      if (!existingOrder) {
        const order = new Order({
          ...orderData,
          orderId: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          createdAt: orderData.completedAt,
          updatedAt: orderData.completedAt
        });

        await order.save();
        console.log(`  ✅ Created order for ${orderData.farmerName}: ₹${orderData.totalAmount}`);
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

    console.log(`\n✅ Sample sales data created successfully!`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
};

createSampleSalesData();