const mongoose = require('mongoose');
const User = require('../models/User');
const Order = require('../models/Order');
require('dotenv').config();

const createTestFarmers = async () => {
  try {
    console.log('🌱 Creating test farmers for leaderboard demonstration...');
    
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Create test farmers with different activity levels
    const testFarmers = [
      {
        name: 'Rajesh Kumar',
        farmerId: 'FAR-TEST-001',
        role: 'farmer',
        phone: '9876543210',
        email: 'rajesh@test.com',
        pin: 'test123',
        state: 'kerala',
        district: 'ernakulam',
        city: 'Ernakulam',
        pinCode: '683542',
        landSize: 15,
        cropTypes: ['rice', 'coconut'],
        isActive: true,
        createdAt: new Date('2025-12-01')
      },
      {
        name: 'Priya Sharma',
        farmerId: 'FAR-TEST-002',
        role: 'farmer',
        phone: '9876543220',
        email: 'priya@test.com',
        pin: 'test123',
        state: 'kerala',
        district: 'ernakulam',
        city: 'Ernakulam',
        pinCode: '683542',
        landSize: 20,
        cropTypes: ['wheat', 'tomato'],
        isActive: true,
        createdAt: new Date('2025-11-15')
      },
      {
        name: 'Arjun Patel',
        farmerId: 'FAR-TEST-003',
        role: 'farmer',
        phone: '9876543230',
        email: 'arjun@test.com',
        pin: 'test123',
        state: 'kerala',
        district: 'ernakulam',
        city: 'Ernakulam',
        pinCode: '683542',
        landSize: 10,
        cropTypes: ['rice'],
        isActive: true,
        createdAt: new Date('2026-01-20')
      }
    ];

    // Create farmers
    for (const farmerData of testFarmers) {
      const existingFarmer = await User.findOne({ farmerId: farmerData.farmerId });
      if (!existingFarmer) {
        const farmer = new User(farmerData);
        await farmer.save();
        console.log(`✅ Created farmer: ${farmerData.name} (${farmerData.farmerId})`);
      } else {
        console.log(`⚠️ Farmer already exists: ${farmerData.name} (${farmerData.farmerId})`);
      }
    }

    // Create test orders for different farmers to show sales ranking
    const testOrders = [
      // Rajesh Kumar - 3 completed sales (highest)
      {
        orderId: 'TEST-ORD-001',
        farmerId: 'FAR-TEST-001',
        farmerName: 'Rajesh Kumar',
        buyerId: 'MGPB001',
        buyerName: 'Test Buyer',
        buyerType: 'public',
        cropId: new mongoose.Types.ObjectId(),
        cropDetails: { name: 'Rice', category: 'grains', quality: 'A', unit: 'kg' },
        quantity: 50,
        pricePerUnit: 45,
        totalAmount: 2250,
        status: 'completed',
        completedAt: new Date('2026-01-15'),
        createdAt: new Date('2026-01-15')
      },
      {
        orderId: 'TEST-ORD-002',
        farmerId: 'FAR-TEST-001',
        farmerName: 'Rajesh Kumar',
        buyerId: 'MGPB001',
        buyerName: 'Test Buyer',
        buyerType: 'public',
        cropId: new mongoose.Types.ObjectId(),
        cropDetails: { name: 'Coconut', category: 'fruits', quality: 'A', unit: 'piece' },
        quantity: 100,
        pricePerUnit: 15,
        totalAmount: 1500,
        status: 'completed',
        completedAt: new Date('2026-01-20'),
        createdAt: new Date('2026-01-20')
      },
      {
        orderId: 'TEST-ORD-003',
        farmerId: 'FAR-TEST-001',
        farmerName: 'Rajesh Kumar',
        buyerId: 'MGPB001',
        buyerName: 'Test Buyer',
        buyerType: 'public',
        cropId: new mongoose.Types.ObjectId(),
        cropDetails: { name: 'Rice', category: 'grains', quality: 'B', unit: 'kg' },
        quantity: 30,
        pricePerUnit: 40,
        totalAmount: 1200,
        status: 'completed',
        completedAt: new Date('2026-01-25'),
        createdAt: new Date('2026-01-25')
      },
      
      // Priya Sharma - 1 completed sale (middle)
      {
        orderId: 'TEST-ORD-004',
        farmerId: 'FAR-TEST-002',
        farmerName: 'Priya Sharma',
        buyerId: 'MGPB001',
        buyerName: 'Test Buyer',
        buyerType: 'public',
        cropId: new mongoose.Types.ObjectId(),
        cropDetails: { name: 'Wheat', category: 'grains', quality: 'A', unit: 'kg' },
        quantity: 75,
        pricePerUnit: 35,
        totalAmount: 2625,
        status: 'completed',
        completedAt: new Date('2026-01-22'),
        createdAt: new Date('2026-01-22')
      }
      
      // Arjun Patel - 0 sales (but active, should still appear)
    ];

    // Create orders
    for (const orderData of testOrders) {
      const existingOrder = await Order.findOne({ orderId: orderData.orderId });
      if (!existingOrder) {
        const order = new Order(orderData);
        await order.save();
        console.log(`✅ Created order: ${orderData.orderId} for ${orderData.farmerName}`);
      } else {
        console.log(`⚠️ Order already exists: ${orderData.orderId}`);
      }
    }

    console.log('\n🎉 Test farmers and orders created successfully!');
    console.log('\n📊 Expected leaderboard order:');
    console.log('1. Rajesh Kumar (FAR-TEST-001) - 3 sales, ₹4950 revenue');
    console.log('2. Nohin Sijo (FAR-369) - 2 sales, ₹330.6 revenue');
    console.log('3. Priya Sharma (FAR-TEST-002) - 1 sale, ₹2625 revenue');
    console.log('4. Arjun Patel (FAR-TEST-003) - 0 sales (but active)');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
};

createTestFarmers();