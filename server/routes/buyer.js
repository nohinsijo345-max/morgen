const router = require('express').Router();
const User = require('../models/User');
const BidLimitRequest = require('../models/BidLimitRequest');

// Request bid limit increase
router.post('/request-bid-limit-increase', async (req, res) => {
  try {
    const { buyerId, requestedLimit, reason, currentLimit } = req.body;

    // Validation
    if (!buyerId || !requestedLimit || !reason) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (parseFloat(requestedLimit) <= parseFloat(currentLimit)) {
      return res.status(400).json({ error: 'Requested limit must be greater than current limit' });
    }

    if (reason.trim().length < 10) {
      return res.status(400).json({ error: 'Reason must be at least 10 characters' });
    }

    // Find the buyer
    const buyer = await User.findOne({ buyerId, role: 'buyer' });
    if (!buyer) {
      return res.status(404).json({ error: 'Buyer not found' });
    }

    // Check if buyer is commercial
    if (buyer.buyerType !== 'commercial') {
      return res.status(403).json({ error: 'Only commercial buyers can request bid limit increases' });
    }

    // Check if there's already a pending request
    const existingRequest = await BidLimitRequest.findOne({
      buyerId,
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(400).json({ 
        error: 'You already have a pending bid limit request. Please wait for admin approval.' 
      });
    }

    // Create the bid limit request
    const bidLimitRequest = new BidLimitRequest({
      buyerId,
      buyerName: buyer.name,
      currentLimit: parseFloat(currentLimit),
      requestedLimit: parseFloat(requestedLimit),
      reason: reason.trim()
    });

    await bidLimitRequest.save();

    console.log('✅ Bid limit request saved to database:', bidLimitRequest._id);
    console.log(`   Buyer: ${buyer.name} (${buyerId})`);
    console.log(`   Current Limit: ₹${currentLimit}`);
    console.log(`   Requested Limit: ₹${requestedLimit}`);

    res.json({
      message: 'Bid limit increase request submitted successfully',
      request: {
        id: bidLimitRequest._id,
        buyerId,
        buyerName: buyer.name,
        currentLimit: bidLimitRequest.currentLimit,
        requestedLimit: bidLimitRequest.requestedLimit,
        status: bidLimitRequest.status,
        requestedAt: bidLimitRequest.requestedAt
      }
    });

  } catch (err) {
    console.error('Error processing bid limit request:', err);
    res.status(500).json({ error: 'Failed to process request', details: err.message });
  }
});

// Get buyer profile
router.get('/profile/:buyerId', async (req, res) => {
  try {
    const { buyerId } = req.params;
    
    const buyer = await User.findOne({ buyerId, role: 'buyer' });
    if (!buyer) {
      return res.status(404).json({ error: 'Buyer not found' });
    }

    res.json({
      buyerId: buyer.buyerId,
      name: buyer.name,
      email: buyer.email,
      phone: buyer.phone,
      state: buyer.state,
      district: buyer.district,
      city: buyer.city,
      pinCode: buyer.pinCode,
      buyerType: buyer.buyerType,
      maxBidLimit: buyer.maxBidLimit,
      totalPurchases: buyer.totalPurchases || 0,
      totalBids: buyer.totalBids || 0,
      activeBids: buyer.activeBids || 0,
      wonBids: buyer.wonBids || 0,
      profileImage: buyer.profileImage,
      isActive: buyer.isActive,
      createdAt: buyer.createdAt
    });

  } catch (err) {
    console.error('Error fetching buyer profile:', err);
    res.status(500).json({ error: 'Failed to fetch profile', details: err.message });
  }
});

module.exports = router;