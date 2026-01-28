const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');
const Sale = require('../models/Sale');
const Bid = require('../models/Bid');
const Order = require('../models/Order');

// Calculate comprehensive farmer performance score
const calculatePerformanceScore = (farmer) => {
  const {
    totalSales = 0,
    totalRevenue = 0,
    avgRating = 0,
    totalBids = 0,
    wonBids = 0,
    activeBids = 0,
    completionRate = 0
  } = farmer;

  // Weighted scoring system
  const salesScore = totalSales * 10; // 10 points per sale
  const revenueScore = (totalRevenue / 1000) * 5; // 5 points per 1000 revenue
  const ratingScore = avgRating * 20; // 20 points per rating point
  const biddingScore = (wonBids / Math.max(totalBids, 1)) * 50; // Win rate bonus
  const activityScore = Math.min(activeBids * 5, 25); // Activity bonus (max 25)
  const reliabilityScore = completionRate * 30; // Completion rate bonus

  return Math.round(
    salesScore + 
    revenueScore + 
    ratingScore + 
    biddingScore + 
    activityScore + 
    reliabilityScore
  );
};

// Get comprehensive leaderboard data (exact copy from route)
const getLeaderboardData = async () => {
  try {
    console.log('🔄 Starting leaderboard calculation...');
    
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
        combinedSalesData[order._id].crops = [...new Set([
          ...combinedSalesData[order._id].crops,
          ...order.crops
        ])];
        combinedSalesData[order._id].lastSaleDate = new Date(Math.max(
          new Date(combinedSalesData[order._id].lastSaleDate),
          new Date(order.lastSaleDate)
        ));
      } else {
        // Add new farmer data
        combinedSalesData[order._id] = order;
      }
    });
    
    // Convert back to array format
    const mergedSalesData = Object.values(combinedSalesData);

    // Get bidding data aggregated by farmer
    const biddingData = await Bid.aggregate([
      {
        $group: {
          _id: '$farmerId',
          totalBids: { $sum: 1 },
          wonBids: { 
            $sum: { 
              $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] 
            }
          },
          activeBids: { 
            $sum: { 
              $cond: [{ $eq: ['$status', 'active'] }, 1, 0] 
            }
          },
          totalBidRevenue: {
            $sum: {
              $cond: [
                { $eq: ['$status', 'completed'] },
                '$winningAmount',
                0
              ]
            }
          },
          avgBidValue: { $avg: '$currentPrice' },
          lastBidDate: { $max: '$createdAt' }
        }
      }
    ]);

    console.log(`📊 Data collected:`);
    console.log(`- Sales data: ${salesData.length} farmers`);
    console.log(`- Order data: ${orderData.length} farmers`);
    console.log(`- Merged sales data: ${mergedSalesData.length} farmers`);
    console.log(`- Bidding data: ${biddingData.length} farmers`);

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

    console.log(`👥 User profile data: ${userData.length} farmers`);
    userData.forEach(user => {
      console.log(`- ${user.name} (${user.farmerId}) - Active: ${user.isActive}`);
    });

    // Combine all data sources
    const combinedData = userData.map(user => {
      const sales = mergedSalesData.find(s => s._id === user.farmerId) || {};
      const bidding = biddingData.find(b => b._id === user.farmerId) || {};
      
      const totalTransactions = (sales.totalSales || 0) + (bidding.wonBids || 0);
      const totalRevenue = (sales.totalRevenue || 0) + (bidding.totalBidRevenue || 0);
      const completionRate = totalTransactions > 0 ? 
        ((sales.totalSales || 0) + (bidding.wonBids || 0)) / 
        ((sales.totalSales || 0) + (bidding.totalBids || 0)) : 0;

      const farmerData = {
        _id: user.farmerId,
        name: user.name,
        profileImage: user.profileImage,
        state: user.state,
        district: user.district,
        city: user.city,
        landSize: user.landSize,
        cropTypes: user.cropTypes || [],
        
        // Sales metrics
        totalSales: sales.totalSales || 0,
        salesRevenue: sales.totalRevenue || 0,
        avgRating: sales.avgRating || 0,
        lastSaleDate: sales.lastSaleDate,
        cropsGrown: sales.crops || [],
        
        // Bidding metrics
        totalBids: bidding.totalBids || 0,
        wonBids: bidding.wonBids || 0,
        activeBids: bidding.activeBids || 0,
        biddingRevenue: bidding.totalBidRevenue || 0,
        avgBidValue: bidding.avgBidValue || 0,
        lastBidDate: bidding.lastBidDate,
        
        // Combined metrics
        totalRevenue,
        totalTransactions,
        completionRate: Math.round(completionRate * 100),
        winRate: bidding.totalBids > 0 ? 
          Math.round((bidding.wonBids / bidding.totalBids) * 100) : 0,
        
        // Activity metrics - use database isActive field
        isActive: user.isActive,
        joinedDate: user.createdAt,
        daysSinceJoined: Math.floor((Date.now() - user.createdAt) / (1000 * 60 * 60 * 24))
      };

      // Calculate performance score
      farmerData.performanceScore = calculatePerformanceScore(farmerData);
      
      console.log(`🧮 Calculated data for ${farmerData.name}:`);
      console.log(`- Total Sales: ${farmerData.totalSales}`);
      console.log(`- Total Revenue: ₹${farmerData.totalRevenue}`);
      console.log(`- Is Active: ${farmerData.isActive}`);
      console.log(`- Performance Score: ${farmerData.performanceScore}`);
      
      return farmerData;
    });

    console.log(`🔗 Combined data: ${combinedData.length} farmers`);

    // Sort by sales count and add rankings (include all active farmers)
    const sortedFarmers = combinedData
      .filter(farmer => {
        console.log(`🔍 Filtering ${farmer.name}: isActive = ${farmer.isActive} (${typeof farmer.isActive})`);
        return farmer.isActive;
      })
      .sort((a, b) => {
        // Primary sort: Total sales count (most important)
        if (b.totalSales !== a.totalSales) {
          return b.totalSales - a.totalSales;
        }
        // Secondary sort: Total revenue (if sales count is equal)
        if (b.totalRevenue !== a.totalRevenue) {
          return b.totalRevenue - a.totalRevenue;
        }
        // Tertiary sort: Total transactions (including bids)
        if (b.totalTransactions !== a.totalTransactions) {
          return b.totalTransactions - a.totalTransactions;
        }
        // Quaternary sort: Join date (newer farmers first if all else equal)
        return new Date(b.joinedDate) - new Date(a.joinedDate);
      })
      .map((farmer, index) => ({
        ...farmer,
        rank: index + 1,
        badge: farmer.totalSales > 0 ? 
          (index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : 'none') : 'none',
        tier: farmer.totalSales > 0 ? 
          (index < 10 ? 'elite' : index < 50 ? 'advanced' : 'standard') : 'newcomer'
      }));

    console.log(`✅ Final sorted farmers: ${sortedFarmers.length}`);
    sortedFarmers.forEach((farmer, index) => {
      console.log(`${index + 1}. ${farmer.name} (${farmer._id}) - Sales: ${farmer.totalSales}, Revenue: ₹${farmer.totalRevenue}, Score: ${farmer.performanceScore}`);
    });

    return sortedFarmers;
  } catch (error) {
    console.error('Error calculating leaderboard:', error);
    throw error;
  }
};

const testLeaderboard = async () => {
  try {
    console.log('🧪 Testing leaderboard API logic...\n');
    
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    const result = await getLeaderboardData();
    
    console.log(`\n🏆 Final Result: ${result.length} farmers in leaderboard`);
    
  } catch (error) {
    console.error('❌ Test error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
};

testLeaderboard();