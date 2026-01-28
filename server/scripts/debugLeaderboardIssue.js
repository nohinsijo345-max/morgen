const mongoose = require('mongoose');
const User = require('../models/User');
const Sale = require('../models/Sale');
const Bid = require('../models/Bid');
const Order = require('../models/Order');
require('dotenv').config();

const debugLeaderboard = async () => {
  try {
    console.log('🔍 Debugging leaderboard calculation...');
    
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Step 1: Check sales data
    console.log('\n1️⃣ Checking Sales collection:');
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
    console.log('Sales data:', salesData);

    // Step 2: Check order data
    console.log('\n2️⃣ Checking Orders collection (completed):');
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
    console.log('Order data:', orderData);

    // Step 3: Check bidding data
    console.log('\n3️⃣ Checking Bids collection:');
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
    console.log('Bidding data:', biddingData);

    // Step 4: Check user data
    console.log('\n4️⃣ Checking Users collection (farmers):');
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
        createdAt: 1
      }
    );
    console.log('User data:', userData);

    // Step 5: Combine data manually
    console.log('\n5️⃣ Combining data:');
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
    
    const mergedSalesData = Object.values(combinedSalesData);
    console.log('Merged sales data:', mergedSalesData);

    // Step 6: Calculate performance scores
    console.log('\n6️⃣ Calculating performance scores:');
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
        
        // Activity metrics
        isActive: (sales.lastSaleDate || bidding.lastBidDate) > 
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Active in last 30 days
        joinedDate: user.createdAt,
        daysSinceJoined: Math.floor((Date.now() - user.createdAt) / (1000 * 60 * 60 * 24))
      };

      // Calculate performance score
      const {
        totalSales: farmTotalSales = 0,
        totalRevenue: farmTotalRevenue = 0,
        avgRating = 0,
        totalBids = 0,
        wonBids = 0,
        activeBids = 0,
        completionRate: farmCompletionRate = 0
      } = farmerData;

      // Weighted scoring system
      const salesScore = farmTotalSales * 10; // 10 points per sale
      const revenueScore = (farmTotalRevenue / 1000) * 5; // 5 points per 1000 revenue
      const ratingScore = avgRating * 20; // 20 points per rating point
      const biddingScore = (wonBids / Math.max(totalBids, 1)) * 50; // Win rate bonus
      const activityScore = Math.min(activeBids * 5, 25); // Activity bonus (max 25)
      const reliabilityScore = farmCompletionRate * 30; // Completion rate bonus

      farmerData.performanceScore = Math.round(
        salesScore + 
        revenueScore + 
        ratingScore + 
        biddingScore + 
        activityScore + 
        reliabilityScore
      );
      
      return farmerData;
    });

    console.log('Combined data with scores:', combinedData);

    // Step 7: Filter and sort
    const sortedFarmers = combinedData
      .filter(farmer => farmer.performanceScore > 0) // Only include farmers with activity
      .sort((a, b) => {
        // Primary sort: Performance score
        if (b.performanceScore !== a.performanceScore) {
          return b.performanceScore - a.performanceScore;
        }
        // Secondary sort: Total revenue
        if (b.totalRevenue !== a.totalRevenue) {
          return b.totalRevenue - a.totalRevenue;
        }
        // Tertiary sort: Total transactions
        return b.totalTransactions - a.totalTransactions;
      })
      .map((farmer, index) => ({
        ...farmer,
        rank: index + 1,
        badge: index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : 'none',
        tier: index < 10 ? 'elite' : index < 50 ? 'advanced' : 'standard'
      }));

    console.log('\n🏆 Final leaderboard:', sortedFarmers);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
};

debugLeaderboard();