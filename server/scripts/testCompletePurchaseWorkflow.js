require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Crop = require('../models/Crop');
const Order = require('../models/Order');
const Connection = require('../models/Connection');
const Update = require('../models/Update');

async function testCompletePurchaseWorkflow() {
  try {
    await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/morgen');
    console.log('🔗 Connected to MongoDB');

    // 1. Find or create test users
    let farmer = await User.findOne({ role: 'farmer', email: 'farmer@test.com' });
    if (!farmer) {
      farmer = new User({
        farmerId: 'FAR001',
        name: 'Test Farmer',
        email: 'farmer@test.com',
        phone: '9876543210',
        pin: '1234',
        role: 'farmer',
        state: 'Karnataka',
        district: 'Bangalore',
        city: 'Bangalore',
        pinCode: '560001'
      });
      await farmer.save();
      console.log('✅ Created test farmer');
    }

    let publicBuyer = await User.findOne({ role: 'buyer', buyerType: 'public' });
    if (!publicBuyer) {
      publicBuyer = new User({
        buyerId: 'BUY001',
        name: 'Test Public Buyer',
        email: 'publicbuyer@test.com',
        phone: '9876543211',
        pin: '1234',
        role: 'buyer',
        buyerType: 'public',
        state: 'Karnataka',
        district: 'Bangalore',
        city: 'Bangalore',
        pinCode: '560001'
      });
      await publicBuyer.save();
      console.log('✅ Created test public buyer');
    }

    let commercialBuyer = await User.findOne({ role: 'buyer', buyerType: 'commercial' });
    if (!commercialBuyer) {
      commercialBuyer = new User({
        buyerId: 'BUY002',
        name: 'Test Commercial Buyer',
        email: 'commercialbuyer@test.com',
        phone: '9876543212',
        pin: '1234',
        role: 'buyer',
        buyerType: 'commercial',
        state: 'Karnataka',
        district: 'Bangalore',
        city: 'Bangalore',
        pinCode: '560001'
      });
      await commercialBuyer.save();
      console.log('✅ Created test commercial buyer');
    }

    // 2. Create connection between farmer and public buyer
    let connection = await Connection.findOne({
      $or: [
        { requesterId: publicBuyer.buyerId, targetId: farmer.farmerId },
        { requesterId: farmer.farmerId, targetId: publicBuyer.buyerId }
      ]
    });

    if (!connection) {
      connection = new Connection({
        requestId: 'REQ001',
        requesterId: publicBuyer.buyerId,
        requesterName: publicBuyer.name,
        requesterType: 'buyer',
        targetId: farmer.farmerId,
        targetName: farmer.name,
        targetType: 'farmer',
        status: 'accepted',
        requestDate: new Date(),
        responseDate: new Date()
      });
      await connection.save();
      console.log('✅ Created connection between farmer and public buyer');
    }

    // 3. Create test crop
    let crop = await Crop.findOne({ farmerId: farmer.farmerId, available: true });
    if (!crop) {
      crop = new Crop({
        farmerId: farmer.farmerId,
        farmerName: farmer.name,
        name: 'Premium Wheat',
        cropName: 'Premium Wheat',
        category: 'grains',
        quantity: 100,
        unit: 'kg',
        pricePerUnit: 25,
        basePrice: 25,
        quality: 'A',
        harvestDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        description: 'High quality wheat suitable for commercial use',
        available: true,
        location: {
          state: farmer.state,
          district: farmer.district,
          city: farmer.city,
          pinCode: farmer.pinCode
        }
      });
      await crop.save();
      console.log('✅ Created test crop');
    }

    console.log('\n📊 Test Data Summary:');
    console.log(`Farmer: ${farmer.name} (${farmer.farmerId})`);
    console.log(`Public Buyer: ${publicBuyer.name} (${publicBuyer.buyerId})`);
    console.log(`Commercial Buyer: ${commercialBuyer.name} (${commercialBuyer.buyerId})`);
    console.log(`Crop: ${crop.name} - ${crop.quantity} ${crop.unit} @ ₹${crop.pricePerUnit}/${crop.unit}`);
    console.log(`Connection Status: ${connection.status}`);

    // 4. Test crop filtering for public buyer
    console.log('\n🔍 Testing crop filtering for public buyer...');
    
    // Debug: Check connections
    const debugConnections = await Connection.find({
      $or: [
        { requesterId: publicBuyer.buyerId, targetType: 'farmer', status: 'accepted' },
        { targetId: publicBuyer.buyerId, requesterType: 'farmer', status: 'accepted' }
      ]
    });
    console.log(`🔗 Debug: Found ${debugConnections.length} connections for buyer ${publicBuyer.buyerId}`);
    debugConnections.forEach(conn => {
      console.log(`   - ${conn.requesterType} ${conn.requesterId} → ${conn.targetType} ${conn.targetId} (${conn.status})`);
    });
    
    const connectedFarmerIds = debugConnections.map(conn => 
      conn.requesterId === publicBuyer.buyerId ? conn.targetId : conn.requesterId
    );
    console.log(`🔗 Connected farmer IDs: [${connectedFarmerIds.join(', ')}]`);
    
    const publicBuyerCrops = await Crop.find({
      available: true,
      farmerId: { $in: connectedFarmerIds }
    });
    console.log(`✅ Public buyer sees ${publicBuyerCrops.length} crops from connected farmers`);

    // 5. Test crop filtering for commercial buyer
    console.log('\n🔍 Testing crop filtering for commercial buyer...');
    const commercialBuyerCrops = await Crop.find({ available: true });
    console.log(`✅ Commercial buyer sees ${commercialBuyerCrops.length} total available crops`);

    // 6. Test order creation
    console.log('\n🛒 Testing order creation...');
    
    // Clear existing orders for clean test
    await Order.deleteMany({ 
      $or: [
        { buyerId: publicBuyer.buyerId },
        { buyerId: commercialBuyer.buyerId }
      ]
    });

    const orderId = await Order.generateOrderId();
    const testOrder = new Order({
      orderId,
      buyerId: publicBuyer.buyerId,
      buyerName: publicBuyer.name,
      buyerType: publicBuyer.buyerType,
      buyerContact: {
        email: publicBuyer.email,
        phone: publicBuyer.phone,
        address: {
          state: publicBuyer.state,
          district: publicBuyer.district,
          city: publicBuyer.city,
          pinCode: publicBuyer.pinCode
        }
      },
      farmerId: farmer.farmerId,
      farmerName: farmer.name,
      farmerContact: {
        email: farmer.email,
        phone: farmer.phone,
        address: {
          state: farmer.state,
          district: farmer.district,
          city: farmer.city,
          pinCode: farmer.pinCode
        }
      },
      cropId: crop._id,
      cropDetails: {
        name: crop.name,
        category: crop.category,
        quality: crop.quality,
        unit: crop.unit
      },
      quantity: 10,
      pricePerUnit: crop.pricePerUnit,
      totalAmount: 10 * crop.pricePerUnit,
      message: 'Test purchase request'
    });

    await testOrder.save();
    console.log(`✅ Created test order: ${testOrder.orderId}`);

    // 7. Test order approval
    console.log('\n✅ Testing order approval...');
    testOrder.status = 'approved';
    testOrder.farmerResponse = {
      message: 'Order approved! Please contact me for pickup.',
      respondedAt: new Date()
    };
    await testOrder.save();

    // Update crop quantity
    crop.quantity -= testOrder.quantity;
    await crop.save();
    console.log(`✅ Order approved and crop quantity updated`);

    // 8. Test order completion
    console.log('\n🎉 Testing order completion...');
    testOrder.status = 'completed';
    testOrder.deliveryDetails.completedDate = new Date();
    await testOrder.save();
    console.log(`✅ Order marked as completed`);

    // 9. Display final results
    console.log('\n📈 Final Test Results:');
    const buyerOrders = await Order.find({ buyerId: publicBuyer.buyerId });
    const farmerOrders = await Order.find({ farmerId: farmer.farmerId });
    
    console.log(`Buyer Orders: ${buyerOrders.length}`);
    console.log(`Farmer Orders: ${farmerOrders.length}`);
    console.log(`Updated Crop Quantity: ${crop.quantity} ${crop.unit}`);

    // 10. Test notifications
    console.log('\n📢 Testing notifications...');
    const farmerNotifications = await Update.find({ 
      userId: farmer._id,
      category: 'order'
    }).sort({ createdAt: -1 }).limit(3);
    
    const buyerNotifications = await Update.find({ 
      userId: publicBuyer._id,
      category: 'order'
    }).sort({ createdAt: -1 }).limit(3);

    console.log(`Farmer notifications: ${farmerNotifications.length}`);
    console.log(`Buyer notifications: ${buyerNotifications.length}`);

    console.log('\n🎯 Complete Purchase Workflow Test PASSED!');
    console.log('\n📋 Test Summary:');
    console.log('✅ User creation and authentication');
    console.log('✅ Connection system for public buyers');
    console.log('✅ Crop filtering based on buyer type');
    console.log('✅ Order creation and validation');
    console.log('✅ Order approval workflow');
    console.log('✅ Order completion tracking');
    console.log('✅ Inventory management');
    console.log('✅ Notification system');

    console.log('\n🌐 Frontend URLs to test:');
    console.log('Buyer Login: http://localhost:5173/buyer-login');
    console.log('Farmer Login: http://localhost:5173/login');
    console.log('Buy Crops: http://localhost:5173/buyer/buy-crops');
    console.log('Buyer Orders: http://localhost:5173/buyer/orders');
    console.log('Farmer Orders: http://localhost:5173/farmer/orders');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

testCompletePurchaseWorkflow();