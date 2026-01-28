const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');
const Sale = require('../models/Sale');
const Order = require('../models/Order');
const Bid = require('../models/Bid');

const debugLeaderboard = async () => {
  try {
    console.log('🔍 Debugging empty leaderboard issue...\n');
    
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // 1. Check all users with role farmer
    console.log('1️⃣ Checking all farmers in database:');
    const allFarmers = await User.find({ role: 'farmer' });
    console.log(`Total farmers found: ${allFarmers.length}`);
    
    allFarmers.forEach((farmer, index) => {
      console.log(`${index + 1}. ${farmer.name} (${farmer.farmerId}) - Active: ${farmer.isActive}`);
    });
    console.log('');

    // 2. Check active farmers specifically
    console.log('2️⃣ Checking active farmers:');
    const activeFarmers = await User.find({ role: 'farmer', isActive: true });
    console.log(`Active farmers found: ${activeFarmers.length}`);
    
    activeFarmers.forEach((farmer, index) => {
      console.log(`${index + 1}. ${farmer.name} (${farmer.farmerId})`);
    });
    console.log('');

    // 3. Check Sales collection
    console.log('3️⃣ Checking Sales collection:');
    const salesCount = await Sale.countDocuments();
    console.log(`Total sales records: ${salesCount}`);
    
    if (salesCount > 0) {
      const salesData = await Sale.find().limit(5);
      console.log('Sample sales:');
      salesData.forEach((sale, index) => {
        console.log(`${index + 1}. Farmer: ${sale.farmerId} - Amount: ₹${sale.totalAmount}`);
      });
    }
    console.log('');

    // 4. Check Orders collection for completed orders
    console.log('4️⃣ Checking completed orders:');
    const completedOrders = await Order.find({ status: 'completed' });
    console.log(`Completed orders found: ${completedOrders.length}`);
    
    completedOrders.forEach((order, index) => {
      console.log(`${index + 1}. Farmer: ${order.farmerId} - Amount: ₹${order.totalAmount} - Status: ${order.status}`);
    });
    console.log('');

    // 5. Check Bids collection
    console.log('5️⃣ Checking Bids collection:');
    const bidsCount = await Bid.countDocuments();
    console.log(`Total bids: ${bidsCount}`);
    
    if (bidsCount > 0) {
      const bidsData = await Bid.find().limit(5);
      console.log('Sample bids:');
      bidsData.forEach((bid, index) => {
        console.log(`${index + 1}. Farmer: ${bid.farmerId} - Status: ${bid.status}`);
      });
    }
    console.log('');

    // 6. Test the leaderboard calculation logic
    console.log('6️⃣ Testing leaderboard calculation logic:');
    
    // Get sales data from Sales collection
    const salesData = await Sale.aggregate([
      {
        $group: {
          _id: '$farmerId',
          farmerName: { $first: '$farmerName' },
          totalSales: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
          avgRating: { $avg: '$rating' },
          lastSaleDate: { $max: '$saleDate' },
          crops: { $addToSet: '$cropName' }
        }
      }
    ]);
    console.log(`Sales aggregation result: ${salesData.length} farmers`);

    // Get order data (completed orders act as sales)
    const orderData = await Order.aggregate([
      {
        $match: { status: 'completed' }
      },
      {
        $group: {
          _id: '$farmerId',
          farmerName: { $first: '$farmerName' },
          totalSales: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
          lastSaleDate: { $max: '$completedAt' },
          crops: { $addToSet: '$cropDetails.name' }
        }
      }
    ]);
    console.log(`Order aggregation result: ${orderData.length} farmers`);

    // Combine sales data from both sources
    const combinedSalesData = {};
    
    // Add traditional sales data
    salesData.forEach(sale => {
      combinedSalesData[sale._id] = sale;
    });
    
    // Add order-based sales data
    orderData.forEach(order => {
      if (combinedSalesData[order._id]) {
        // Merge with existing data
        combinedSalesData[order._id].totalSales += order.totalSales;
        combinedSalesData[order._id].totalRevenue += order.totalRevenue;
      } else {
        // Add new farmer data
        combinedSalesData[order._id] = order;
      }
    });
    
    const mergedSalesData = Object.values(combinedSalesData);
    console.log(`Combined sales data: ${mergedSalesData.length} farmers with sales`);

    // Get user profile data
    const userData = await User.find(
      { role: 'farmer' },
      {
        farmerId: 1,
        name: 1,
        state: 1,
        district: 1,
        city: 1,
        landSize: 1,
        cropTypes: 1,
        profileImage: 1,
        reputationScore: 1,
        badge: 1,
        createdAt: 1,
        isActive: 1
      }
    );
    console.log(`User profile data: ${userData.length} farmers`);

    // Combine all data sources
    const combinedData = userData.map(user => {
      const sales = mergedSalesData.find(s => s._id === user.farmerId) || {};
      
      const farmerData = {
        _id: user.farmerId,
        name: user.name,
        totalSales: sales.totalSales || 0,
        totalRevenue: sales.totalRevenue || 0,
        isActive: user.isActive
      };
      
      return farmerData;
    });

    console.log(`Combined data: ${combinedData.length} farmers`);

    // Filter active farmers
    const activeFarmersData = combinedData.filter(farmer => farmer.isActive);
    console.log(`Active farmers in combined data: ${activeFarmersData.length}`);

    // Show the active farmers
    console.log('\n7️⃣ Active farmers with their data:');
    activeFarmersData.forEach((farmer, index) => {
      console.log(`${index + 1}. ${farmer.name} (${farmer._id}) - Sales: ${farmer.totalSales}, Revenue: ₹${farmer.totalRevenue}, Active: ${farmer.isActive}`);
    });

    // 8. Check the isActive field specifically
    console.log('\n8️⃣ Checking isActive field for all farmers:');
    const farmersWithActiveStatus = await User.find({ role: 'farmer' }, { farmerId: 1, name: 1, isActive: 1 });
    farmersWithActiveStatus.forEach((farmer, index) => {
      console.log(`${index + 1}. ${farmer.name} (${farmer.farmerId}) - isActive: ${farmer.isActive} (type: ${typeof farmer.isActive})`);
    });

    console.log('\n✅ Debug complete!');
    
  } catch (error) {
    console.error('❌ Debug error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

debugLeaderboard();