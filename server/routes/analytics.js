const router = require('express').Router();
const Bid = require('../models/Bid');
const Order = require('../models/Order');
const Crop = require('../models/Crop');
const User = require('../models/User');

// Get admin bidding analytics
router.get('/admin/bidding', async (req, res) => {
  try {
    // Get all bids
    const allBids = await Bid.find({});
    const activeBids = await Bid.find({ status: 'active' });
    const endedBids = await Bid.find({ status: 'ended' });

    // Calculate total bids
    const totalBids = allBids.length;

    // Calculate unique active bidders
    const activeBidderIds = new Set();
    activeBids.forEach(bid => {
      bid.bids.forEach(b => activeBidderIds.add(b.buyerId));
    });
    const activeBidders = activeBidderIds.size;

    // Calculate average bid amount
    let totalBidAmount = 0;
    let bidCount = 0;
    allBids.forEach(bid => {
      bid.bids.forEach(b => {
        totalBidAmount += b.bidAmount;
        bidCount++;
      });
    });
    const averageBidAmount = bidCount > 0 ? Math.round(totalBidAmount / bidCount) : 0;

    // Calculate success rate (bids with winners / total ended bids)
    const successfulBids = endedBids.filter(bid => bid.winnerId).length;
    const successRate = endedBids.length > 0 
      ? ((successfulBids / endedBids.length) * 100).toFixed(1) 
      : 0;

    // Get top bidders
    const bidderStats = {};
    allBids.forEach(bid => {
      bid.bids.forEach(b => {
        if (!bidderStats[b.buyerId]) {
          bidderStats[b.buyerId] = {
            buyerId: b.buyerId,
            name: b.buyerName,
            totalBids: 0,
            wins: 0,
            totalSpent: 0
          };
        }
        bidderStats[b.buyerId].totalBids++;
      });
    });

    // Add win data
    endedBids.forEach(bid => {
      if (bid.winnerId && bidderStats[bid.winnerId]) {
        bidderStats[bid.winnerId].wins++;
        bidderStats[bid.winnerId].totalSpent += bid.winningAmount || 0;
      }
    });

    // Convert to array and calculate win rates
    const topBidders = Object.values(bidderStats)
      .map(bidder => ({
        ...bidder,
        winRate: bidder.totalBids > 0 
          ? ((bidder.wins / bidder.totalBids) * 100).toFixed(1) 
          : 0
      }))
      .sort((a, b) => b.totalBids - a.totalBids)
      .slice(0, 5);

    // Get recent activity
    const recentBids = await Bid.find({})
      .sort({ updatedAt: -1 })
      .limit(10);

    const recentActivity = [];
    recentBids.forEach(bid => {
      if (bid.bids.length > 0) {
        const latestBid = bid.bids[bid.bids.length - 1];
        recentActivity.push({
          type: bid.status === 'ended' && bid.winnerId === latestBid.buyerId ? 'bid_won' : 'bid_placed',
          buyerId: latestBid.buyerId,
          amount: latestBid.bidAmount,
          product: bid.cropName,
          time: latestBid.bidTime
        });
      }
    });

    res.json({
      totalBids,
      activeBidders,
      averageBidAmount,
      successRate: parseFloat(successRate),
      topBidders,
      recentActivity: recentActivity.slice(0, 5)
    });

  } catch (err) {
    console.error('Error fetching bidding analytics:', err);
    res.status(500).json({ error: 'Failed to fetch analytics', details: err.message });
  }
});

// Get buyer statistics for admin buyer management
router.get('/admin/buyers', async (req, res) => {
  try {
    const buyers = await User.find({ role: 'buyer' });
    
    const buyerStats = await Promise.all(buyers.map(async (buyer) => {
      // Count orders for this buyer
      const orders = await Order.find({ buyerId: buyer.buyerId });
      const totalOrders = orders.length;
      const totalSpent = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

      // Count bids for commercial buyers
      let totalBids = 0;
      if (buyer.buyerType === 'commercial') {
        const bids = await Bid.find({ 'bids.buyerId': buyer.buyerId });
        totalBids = bids.reduce((sum, bid) => {
          return sum + bid.bids.filter(b => b.buyerId === buyer.buyerId).length;
        }, 0);
      }

      return {
        _id: buyer._id,
        name: buyer.name,
        buyerId: buyer.buyerId,
        buyerType: buyer.buyerType,
        email: buyer.email,
        phone: buyer.phone,
        city: buyer.city,
        state: buyer.state,
        district: buyer.district,
        pinCode: buyer.pinCode,
        profileImage: buyer.profileImage,
        totalPurchases: totalOrders,
        totalSpent: Math.round(totalSpent),
        totalBids,
        maxBidLimit: buyer.maxBidLimit || 100000,
        isActive: buyer.isActive !== false,
        createdAt: buyer.createdAt
      };
    }));

    res.json(buyerStats);

  } catch (err) {
    console.error('Error fetching buyer statistics:', err);
    res.status(500).json({ error: 'Failed to fetch buyer statistics', details: err.message });
  }
});

// Get available crops for public buyers (by district)
router.get('/public-buyer/crops', async (req, res) => {
  try {
    const { state, district } = req.query;

    let query = { available: true, status: { $in: ['ready', 'listed'] } };
    
    // Filter by district for public buyers
    if (state && district) {
      query['location.state'] = state;
      query['location.district'] = district;
    }

    const crops = await Crop.find(query);
    
    const availableCount = crops.length;
    const avgPrice = crops.length > 0 
      ? Math.round(crops.reduce((sum, crop) => sum + (crop.pricePerUnit || crop.basePrice || 0), 0) / crops.length)
      : 0;

    res.json({
      availableCount,
      avgPrice,
      crops: crops.slice(0, 10) // Return first 10 for preview
    });

  } catch (err) {
    console.error('Error fetching public buyer crops:', err);
    res.status(500).json({ error: 'Failed to fetch crops', details: err.message });
  }
});

module.exports = router;
