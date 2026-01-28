const router = require('express').Router();
const User = require('../models/User');
const Sale = require('../models/Sale');
const Bid = require('../models/Bid');
const Order = require('../models/Order');

// Cache for leaderboard data (updates every hour)
let leaderboardCache = {
  data: null,
  lastUpdated: null,
  updateInterval: 60 * 60 * 1000 // 1 hour in milliseconds
};

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

// Get comprehensive leaderboard data
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
    
    console.log(`👥 Found ${userData.length} farmers in database`);
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
      
      console.log(`🧮 Processing ${farmerData.name}: Sales=${farmerData.totalSales}, Active=${farmerData.isActive}`);
      
      return farmerData;
    });

    console.log(`🔗 Combined ${combinedData.length} farmers`);

    // Sort by sales count and add rankings (include all active farmers)
    const sortedFarmers = combinedData
      .filter(farmer => {
        console.log(`🔍 Filtering ${farmer.name}: isActive=${farmer.isActive} (${typeof farmer.isActive})`);
        return farmer.isActive; // Include all active farmers
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

    console.log(`✅ Final result: ${sortedFarmers.length} farmers in leaderboard`);

    console.log(`✅ Leaderboard calculated: ${sortedFarmers.length} farmers`);
    return sortedFarmers;
  } catch (error) {
    console.error('Error calculating leaderboard:', error);
    throw error;
  }
};

// Get top farmers with caching and real-time updates
router.get('/top', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const forceRefresh = req.query.refresh === 'true';
    
    // Check if cache is valid
    const now = Date.now();
    const cacheValid = leaderboardCache.data && 
                      leaderboardCache.lastUpdated && 
                      (now - leaderboardCache.lastUpdated) < leaderboardCache.updateInterval;

    if (!cacheValid || forceRefresh) {
      console.log('🔄 Refreshing leaderboard cache...');
      leaderboardCache.data = await getLeaderboardData();
      leaderboardCache.lastUpdated = now;
      
      // Emit real-time update to connected clients
      const io = req.app.get('io');
      if (io) {
        io.emit('leaderboard-updated', {
          timestamp: now,
          topFarmers: leaderboardCache.data.slice(0, 10)
        });
      }
    }

    const topFarmers = leaderboardCache.data.slice(0, limit);
    
    res.json({
      success: true,
      data: topFarmers,
      meta: {
        total: leaderboardCache.data.length,
        lastUpdated: leaderboardCache.lastUpdated,
        nextUpdate: leaderboardCache.lastUpdated + leaderboardCache.updateInterval
      }
    });
  } catch (err) {
    console.error('Leaderboard error:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch leaderboard data',
      message: err.message 
    });
  }
});

// Get farmer details by ID
router.get('/farmer/:farmerId', async (req, res) => {
  try {
    const { farmerId } = req.params;
    
    if (!leaderboardCache.data) {
      leaderboardCache.data = await getLeaderboardData();
      leaderboardCache.lastUpdated = Date.now();
    }
    
    const farmer = leaderboardCache.data.find(f => f._id === farmerId);
    
    if (!farmer) {
      return res.status(404).json({
        success: false,
        error: 'Farmer not found in leaderboard'
      });
    }
    
    res.json({
      success: true,
      data: farmer
    });
  } catch (err) {
    console.error('Farmer details error:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch farmer details' 
    });
  }
});

// Get leaderboard statistics
router.get('/stats', async (req, res) => {
  try {
    if (!leaderboardCache.data) {
      leaderboardCache.data = await getLeaderboardData();
      leaderboardCache.lastUpdated = Date.now();
    }
    
    const data = leaderboardCache.data;
    
    const stats = {
      totalFarmers: data.length,
      activeFarmers: data.filter(f => f.isActive).length,
      totalSales: data.reduce((sum, f) => sum + f.totalSales, 0),
      totalRevenue: data.reduce((sum, f) => sum + f.totalRevenue, 0),
      totalBids: data.reduce((sum, f) => sum + f.totalBids, 0),
      avgPerformanceScore: data.length > 0 ? Math.round(
        data.reduce((sum, f) => sum + f.performanceScore, 0) / data.length
      ) : 0,
      topPerformer: data[0] || null,
      recentActivity: data.filter(f => 
        f.lastSaleDate > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) ||
        f.lastBidDate > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ).length
    };
    
    res.json({
      success: true,
      data: stats,
      lastUpdated: leaderboardCache.lastUpdated
    });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch statistics' 
    });
  }
});

// Get regional leaderboard (by state/district)
router.get('/region/:type/:name', async (req, res) => {
  try {
    const { type, name } = req.params; // type: 'state' or 'district'
    const limit = parseInt(req.query.limit) || 20;
    
    if (!leaderboardCache.data) {
      leaderboardCache.data = await getLeaderboardData();
      leaderboardCache.lastUpdated = Date.now();
    }
    
    const filteredFarmers = leaderboardCache.data
      .filter(farmer => {
        if (type === 'state') return farmer.state === name;
        if (type === 'district') return farmer.district === name;
        return false;
      })
      .slice(0, limit)
      .map((farmer, index) => ({
        ...farmer,
        regionalRank: index + 1
      }));
    
    res.json({
      success: true,
      data: filteredFarmers,
      region: { type, name },
      total: filteredFarmers.length
    });
  } catch (err) {
    console.error('Regional leaderboard error:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch regional leaderboard' 
    });
  }
});

// Force refresh leaderboard (admin only)
router.post('/refresh', async (req, res) => {
  try {
    console.log('🔄 Force refreshing leaderboard...');
    leaderboardCache.data = await getLeaderboardData();
    leaderboardCache.lastUpdated = Date.now();
    
    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
      io.emit('leaderboard-updated', {
        timestamp: leaderboardCache.lastUpdated,
        topFarmers: leaderboardCache.data.slice(0, 10)
      });
    }
    
    res.json({
      success: true,
      message: 'Leaderboard refreshed successfully',
      timestamp: leaderboardCache.lastUpdated,
      totalFarmers: leaderboardCache.data.length
    });
  } catch (err) {
    console.error('Refresh error:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to refresh leaderboard' 
    });
  }
});

// Schedule automatic daily updates
const scheduleLeaderboardUpdate = () => {
  const updateInterval = 24 * 60 * 60 * 1000; // 24 hours
  
  setInterval(async () => {
    try {
      console.log('🕐 Scheduled leaderboard update starting...');
      leaderboardCache.data = await getLeaderboardData();
      leaderboardCache.lastUpdated = Date.now();
      
      // Emit real-time update
      const io = require('../index').io;
      if (io) {
        io.emit('leaderboard-updated', {
          timestamp: leaderboardCache.lastUpdated,
          topFarmers: leaderboardCache.data.slice(0, 10),
          isScheduledUpdate: true
        });
      }
      
      console.log('✅ Scheduled leaderboard update completed');
    } catch (error) {
      console.error('❌ Scheduled leaderboard update failed:', error);
    }
  }, updateInterval);
  
  console.log('📅 Leaderboard auto-update scheduled (every 24 hours)');
};

// Initialize scheduled updates
scheduleLeaderboardUpdate();

module.exports = router;