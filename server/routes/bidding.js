const router = require('express').Router();
const Bid = require('../models/Bid');
const User = require('../models/User');
const Connection = require('../models/Connection');

// Generate next Bid ID
const generateBidId = async () => {
  try {
    const lastBid = await Bid.findOne({ 
      bidId: { $regex: /^BID\d+$/ } 
    }).sort({ bidId: -1 });
    
    if (!lastBid || !lastBid.bidId) {
      return 'BID001';
    }
    
    const lastNumber = parseInt(lastBid.bidId.replace('BID', ''));
    const nextNumber = lastNumber + 1;
    
    return `BID${String(nextNumber).padStart(3, '0')}`;
  } catch (err) {
    console.error('Error generating bid ID:', err);
    return 'BID001';
  }
};

// Create a new bid (Farmer only)
router.post('/create', async (req, res) => {
  try {
    const { 
      farmerId, 
      cropName, 
      quantity, 
      unit, 
      quality, 
      harvestDate, 
      expiryDate, 
      bidEndDate, 
      startingPrice 
    } = req.body;

    // Validation
    if (!farmerId || !cropName || !quantity || !quality || !harvestDate || !expiryDate || !bidEndDate || !startingPrice) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Verify farmer exists
    const farmer = await User.findOne({ farmerId, role: 'farmer' });
    if (!farmer) {
      return res.status(404).json({ error: 'Farmer not found' });
    }

    // Validate dates
    const now = new Date();
    const harvest = new Date(harvestDate);
    const expiry = new Date(expiryDate);
    const bidEnd = new Date(bidEndDate);

    if (harvest <= now) {
      return res.status(400).json({ error: 'Harvest date must be in the future' });
    }
    if (expiry <= harvest) {
      return res.status(400).json({ error: 'Expiry date must be after harvest date' });
    }
    if (bidEnd <= now) {
      return res.status(400).json({ error: 'Bid end date must be in the future' });
    }
    if (bidEnd >= harvest) {
      return res.status(400).json({ error: 'Bid must end before harvest date' });
    }

    // Generate bid ID
    const bidId = await generateBidId();

    // Create new bid
    const newBid = new Bid({
      bidId,
      farmerId,
      farmerName: farmer.name,
      cropName,
      quantity,
      unit: unit || 'kg',
      quality,
      harvestDate: harvest,
      expiryDate: expiry,
      bidEndDate: bidEnd,
      startingPrice,
      currentPrice: startingPrice,
      state: farmer.state,
      district: farmer.district,
      city: farmer.city
    });

    const savedBid = await newBid.save();

    // Notify connected buyers
    try {
      const connections = await Connection.find({ farmerId });
      const buyerIds = connections.map(conn => conn.buyerId);
      
      // Here you would typically send notifications to buyers
      // For now, we'll just log it
      console.log(`📢 New bid ${bidId} created by ${farmer.name}, notifying ${buyerIds.length} connected buyers`);
    } catch (notifyError) {
      console.error('Error notifying buyers:', notifyError);
    }

    res.status(201).json({
      message: 'Bid created successfully',
      bid: savedBid
    });

  } catch (err) {
    console.error('Error creating bid:', err);
    res.status(500).json({ error: 'Failed to create bid', details: err.message });
  }
});

// Get active bids for buyers
router.get('/active', async (req, res) => {
  try {
    const { buyerId, buyerType, state, district } = req.query;

    let query = { 
      status: 'active',
      bidEndDate: { $gt: new Date() }
    };

    // For public buyers, only show bids from same district
    if (buyerType === 'public' && state && district) {
      query.state = state;
      query.district = district;
    }

    const bids = await Bid.find(query)
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ bids });

  } catch (err) {
    console.error('Error fetching active bids:', err);
    res.status(500).json({ error: 'Failed to fetch bids', details: err.message });
  }
});

// Get bids for a specific farmer
router.get('/farmer/:farmerId', async (req, res) => {
  try {
    const { farmerId } = req.params;

    const bids = await Bid.find({ farmerId })
      .sort({ createdAt: -1 });

    res.json({ bids });

  } catch (err) {
    console.error('Error fetching farmer bids:', err);
    res.status(500).json({ error: 'Failed to fetch farmer bids', details: err.message });
  }
});

// Place a bid (Buyer only)
router.post('/place', async (req, res) => {
  try {
    const { bidId, buyerId, bidAmount } = req.body;

    // Validation
    if (!bidId || !buyerId || !bidAmount) {
      return res.status(400).json({ error: 'Bid ID, Buyer ID, and bid amount are required' });
    }

    // Verify buyer exists and is commercial (public buyers can't bid)
    const buyer = await User.findOne({ buyerId, role: 'buyer' });
    if (!buyer) {
      return res.status(404).json({ error: 'Buyer not found' });
    }

    if (buyer.buyerType === 'public') {
      return res.status(403).json({ error: 'Public buyers cannot participate in bidding' });
    }

    // Check bid limit
    if (bidAmount > buyer.maxBidLimit) {
      return res.status(400).json({ error: `Bid amount exceeds your limit of ₹${buyer.maxBidLimit}` });
    }

    // Find the bid
    const bid = await Bid.findOne({ bidId });
    if (!bid) {
      return res.status(404).json({ error: 'Bid not found' });
    }

    // Check if bid is still active
    if (bid.status !== 'active' || new Date() > bid.bidEndDate) {
      return res.status(400).json({ error: 'Bid is no longer active' });
    }

    // Check if bid amount is higher than current price
    if (bidAmount <= bid.currentPrice) {
      return res.status(400).json({ error: `Bid amount must be higher than current price of ₹${bid.currentPrice}` });
    }

    // Add the bid
    const newBidEntry = {
      buyerId,
      buyerName: buyer.name,
      bidAmount,
      bidTime: new Date()
    };

    bid.bids.push(newBidEntry);
    bid.currentPrice = bidAmount;
    bid.totalBids = bid.bids.length;
    
    // Calculate unique bidders
    const uniqueBidders = new Set(bid.bids.map(b => b.buyerId));
    bid.uniqueBidders = uniqueBidders.size;

    await bid.save();

    // Update buyer stats
    buyer.totalBids = (buyer.totalBids || 0) + 1;
    buyer.activeBids = await Bid.countDocuments({ 
      'bids.buyerId': buyerId, 
      status: 'active' 
    });
    await buyer.save();

    res.json({
      message: 'Bid placed successfully',
      currentPrice: bid.currentPrice,
      totalBids: bid.totalBids,
      yourBid: newBidEntry
    });

  } catch (err) {
    console.error('Error placing bid:', err);
    res.status(500).json({ error: 'Failed to place bid', details: err.message });
  }
});

// Get bid details
router.get('/:bidId', async (req, res) => {
  try {
    const { bidId } = req.params;

    const bid = await Bid.findOne({ bidId });
    if (!bid) {
      return res.status(404).json({ error: 'Bid not found' });
    }

    res.json({ bid });

  } catch (err) {
    console.error('Error fetching bid details:', err);
    res.status(500).json({ error: 'Failed to fetch bid details', details: err.message });
  }
});

// End a bid early (Farmer only)
router.post('/end/:bidId', async (req, res) => {
  try {
    const { bidId } = req.params;
    const { farmerId } = req.body;

    const bid = await Bid.findOne({ bidId, farmerId });
    if (!bid) {
      return res.status(404).json({ error: 'Bid not found or you are not authorized' });
    }

    if (bid.status !== 'active') {
      return res.status(400).json({ error: 'Bid is not active' });
    }

    // End the bid and determine winner
    bid.status = 'ended';
    
    if (bid.bids.length > 0) {
      // Find the highest bid
      const highestBid = bid.bids.reduce((max, current) => 
        current.bidAmount > max.bidAmount ? current : max
      );
      
      bid.winnerId = highestBid.buyerId;
      bid.winnerName = highestBid.buyerName;
      bid.winningAmount = highestBid.bidAmount;
    }

    await bid.save();

    // Update winner's stats if there is one
    if (bid.winnerId) {
      const winner = await User.findOne({ buyerId: bid.winnerId });
      if (winner) {
        winner.wonBids = (winner.wonBids || 0) + 1;
        await winner.save();
      }
    }

    res.json({
      message: 'Bid ended successfully',
      winner: bid.winnerId ? {
        buyerId: bid.winnerId,
        buyerName: bid.winnerName,
        winningAmount: bid.winningAmount
      } : null
    });

  } catch (err) {
    console.error('Error ending bid:', err);
    res.status(500).json({ error: 'Failed to end bid', details: err.message });
  }
});

// Get buyer's bid history
router.get('/buyer/:buyerId/history', async (req, res) => {
  try {
    const { buyerId } = req.params;

    const bids = await Bid.find({ 
      'bids.buyerId': buyerId 
    }).sort({ createdAt: -1 });

    // Transform to show buyer's specific bids
    const bidHistory = bids.map(bid => {
      const buyerBids = bid.bids.filter(b => b.buyerId === buyerId);
      const isWinner = bid.winnerId === buyerId;
      
      return {
        bidId: bid.bidId,
        cropName: bid.cropName,
        quantity: bid.quantity,
        unit: bid.unit,
        quality: bid.quality,
        farmerName: bid.farmerName,
        startingPrice: bid.startingPrice,
        currentPrice: bid.currentPrice,
        status: bid.status,
        bidEndDate: bid.bidEndDate,
        myBids: buyerBids,
        myHighestBid: Math.max(...buyerBids.map(b => b.bidAmount)),
        isWinner,
        winningAmount: bid.winningAmount,
        createdAt: bid.createdAt
      };
    });

    res.json({ bidHistory });

  } catch (err) {
    console.error('Error fetching buyer bid history:', err);
    res.status(500).json({ error: 'Failed to fetch bid history', details: err.message });
  }
});

module.exports = router;