const router = require('express').Router();
const Bid = require('../models/Bid');
const BidHistory = require('../models/BidHistory');
const User = require('../models/User');
const Update = require('../models/Update');
const Connection = require('../models/Connection');

// Generate next Bid ID
const generateBidId = async () => {
  try {
    // Get all bids and sort by bidId to find the highest number
    const allBids = await Bid.find({ 
      bidId: { $regex: /^BID\d+$/ } 
    }).sort({ createdAt: -1 }).limit(100);
    
    if (!allBids || allBids.length === 0) {
      return 'BID001';
    }
    
    // Extract all numbers and find the maximum
    const numbers = allBids
      .map(bid => parseInt(bid.bidId.replace('BID', '')))
      .filter(num => !isNaN(num));
    
    const maxNumber = Math.max(...numbers, 0);
    const nextNumber = maxNumber + 1;
    
    // Format with at least 3 digits
    const paddedNumber = String(nextNumber).padStart(3, '0');
    const newBidId = `BID${paddedNumber}`;
    
    // Double check this ID doesn't exist
    const exists = await Bid.findOne({ bidId: newBidId });
    if (exists) {
      // If it exists, try the next number
      return `BID${String(nextNumber + 1).padStart(3, '0')}`;
    }
    
    return newBidId;
  } catch (err) {
    console.error('Error generating bid ID:', err);
    // Generate a random ID as fallback
    const randomNum = Math.floor(Math.random() * 10000) + 1000;
    return `BID${randomNum}`;
  }
};

// Function to automatically end expired bids and send notifications
const processExpiredBids = async () => {
  try {
    const now = new Date();
    const expiredBids = await Bid.find({
      status: 'active',
      bidEndDate: { $lte: now },
      notificationsSent: { $ne: true }
    });

    console.log(`🔄 Processing ${expiredBids.length} expired bids...`);

    for (const bid of expiredBids) {
      await endBidAndNotify(bid);
    }
  } catch (error) {
    console.error('❌ Error processing expired bids:', error);
  }
};

// Function to end a bid and send notifications to all participants
const endBidAndNotify = async (bid) => {
  try {
    console.log(`🏁 Ending bid ${bid.bidId} - ${bid.cropName}`);
    
    // Determine winner
    let winner = null;
    if (bid.bids.length > 0) {
      const highestBid = bid.bids.reduce((max, current) => 
        current.bidAmount > max.bidAmount ? current : max
      );
      
      bid.winnerId = highestBid.buyerId;
      bid.winnerName = highestBid.buyerName;
      bid.winningAmount = highestBid.bidAmount;
      
      // Get winner contact details
      winner = await User.findOne({ buyerId: highestBid.buyerId });
      if (winner) {
        bid.winnerContact = {
          email: winner.email,
          phone: winner.phone,
          address: {
            state: winner.state,
            district: winner.district,
            city: winner.city,
            pinCode: winner.pinCode
          }
        };
      }
    }

    // Update bid status
    bid.status = 'ended';
    bid.completedAt = new Date();
    bid.notificationsSent = true;
    await bid.save();

    // Get farmer details
    const farmer = await User.findOne({ farmerId: bid.farmerId });
    
    // Create/Update bid history for all participants
    await updateBidHistory(bid, farmer, winner);
    
    // Send notifications to all participants
    await sendBidCompletionNotifications(bid, farmer, winner);
    
    console.log(`✅ Bid ${bid.bidId} ended successfully. Winner: ${bid.winnerName || 'None'}`);
    
  } catch (error) {
    console.error(`❌ Error ending bid ${bid.bidId}:`, error);
  }
};

// Function to update bid history for all participants
const updateBidHistory = async (bid, farmer, winner) => {
  try {
    // Create/update farmer's bid history
    await BidHistory.findOneAndUpdate(
      { bidId: bid.bidId, userId: bid.farmerId },
      {
        bidId: bid.bidId,
        userId: bid.farmerId,
        userName: bid.farmerName,
        userType: 'farmer',
        cropName: bid.cropName,
        quantity: bid.quantity,
        unit: bid.unit,
        quality: bid.quality,
        participationType: 'creator',
        bidStatus: bid.status,
        isWinner: false,
        winnerName: bid.winnerName,
        winningAmount: bid.winningAmount,
        contactExchanged: !!winner,
        contactDetails: winner ? {
          email: winner.email,
          phone: winner.phone,
          address: {
            state: winner.state,
            district: winner.district,
            city: winner.city,
            pinCode: winner.pinCode
          }
        } : null,
        bidEndedAt: bid.completedAt
      },
      { upsert: true, new: true }
    );

    // Create/update bid history for all bidders
    const uniqueBidders = [...new Set(bid.bids.map(b => b.buyerId))];
    
    for (const buyerId of uniqueBidders) {
      const buyerBids = bid.bids.filter(b => b.buyerId === buyerId);
      const buyerHighestBid = Math.max(...buyerBids.map(b => b.bidAmount));
      const isWinner = bid.winnerId === buyerId;
      
      const buyer = await User.findOne({ buyerId });
      if (!buyer) continue;

      await BidHistory.findOneAndUpdate(
        { bidId: bid.bidId, userId: buyerId },
        {
          bidId: bid.bidId,
          userId: buyerId,
          userName: buyer.name,
          userType: 'buyer',
          cropName: bid.cropName,
          quantity: bid.quantity,
          unit: bid.unit,
          quality: bid.quality,
          participationType: 'bidder',
          myBids: buyerBids,
          myHighestBid: buyerHighestBid,
          bidStatus: bid.status,
          isWinner,
          winnerName: bid.winnerName,
          winningAmount: bid.winningAmount,
          contactExchanged: isWinner,
          contactDetails: isWinner && farmer ? {
            email: farmer.email,
            phone: farmer.phone,
            address: {
              state: farmer.state,
              district: farmer.district,
              city: farmer.city,
              pinCode: farmer.pinCode
            }
          } : null,
          bidEndedAt: bid.completedAt
        },
        { upsert: true, new: true }
      );
    }
    
    console.log(`📝 Updated bid history for ${uniqueBidders.length + 1} participants`);
    
  } catch (error) {
    console.error('❌ Error updating bid history:', error);
  }
};

// Function to send notifications to all participants
const sendBidCompletionNotifications = async (bid, farmer, winner) => {
  try {
    const notifications = [];

    // Notification to farmer
    if (farmer) {
      const farmerNotification = new Update({
        userId: farmer._id,
        title: winner ? 'Bid Completed - Winner Declared!' : 'Bid Ended - No Winner',
        message: winner 
          ? `Your bid for ${bid.cropName} has ended! Winner: ${winner.name} with ₹${bid.winningAmount.toLocaleString()}. Contact: ${winner.phone}, ${winner.email}`
          : `Your bid for ${bid.cropName} has ended with no bids received.`,
        category: 'bidding',
        isActive: true,
        metadata: {
          bidId: bid.bidId,
          type: 'bid_completed',
          cropName: bid.cropName,
          winnerId: bid.winnerId,
          winnerName: bid.winnerName,
          winningAmount: bid.winningAmount,
          winnerContact: winner ? {
            phone: winner.phone,
            email: winner.email,
            address: winner.state + ', ' + winner.district
          } : null
        }
      });
      notifications.push(farmerNotification);
    }

    // Notifications to all bidders
    const uniqueBidders = [...new Set(bid.bids.map(b => b.buyerId))];
    
    for (const buyerId of uniqueBidders) {
      const buyer = await User.findOne({ buyerId });
      if (!buyer) continue;

      const isWinner = bid.winnerId === buyerId;
      
      const buyerNotification = new Update({
        userId: buyer._id,
        title: isWinner ? '🎉 Congratulations! You Won the Bid!' : 'Bid Ended',
        message: isWinner 
          ? `Congratulations! You won the bid for ${bid.cropName} with ₹${bid.winningAmount.toLocaleString()}! Farmer contact: ${farmer.phone}, ${farmer.email}`
          : `The bid for ${bid.cropName} has ended. Winner: ${bid.winnerName} with ₹${bid.winningAmount.toLocaleString()}`,
        category: 'bidding',
        isActive: true,
        metadata: {
          bidId: bid.bidId,
          type: isWinner ? 'bid_won' : 'bid_lost',
          cropName: bid.cropName,
          winnerId: bid.winnerId,
          winnerName: bid.winnerName,
          winningAmount: bid.winningAmount,
          isWinner,
          farmerContact: isWinner && farmer ? {
            phone: farmer.phone,
            email: farmer.email,
            address: farmer.state + ', ' + farmer.district
          } : null
        }
      });
      notifications.push(buyerNotification);
    }

    // Save all notifications
    await Update.insertMany(notifications);
    console.log(`📢 Sent ${notifications.length} notifications for bid ${bid.bidId}`);
    
  } catch (error) {
    console.error('❌ Error sending notifications:', error);
  }
};

// Run expired bid processing every minute
setInterval(processExpiredBids, 60000);

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

    // Create initial bid history for farmer
    const farmerBidHistory = new BidHistory({
      bidId,
      userId: farmerId,
      userName: farmer.name,
      userType: 'farmer',
      cropName,
      quantity,
      unit: unit || 'kg',
      quality,
      participationType: 'creator',
      bidStatus: 'active'
    });
    await farmerBidHistory.save();

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

    // Update/create bid history for this buyer
    const buyerBids = bid.bids.filter(b => b.buyerId === buyerId);
    const buyerHighestBid = Math.max(...buyerBids.map(b => b.bidAmount));

    await BidHistory.findOneAndUpdate(
      { bidId: bid.bidId, userId: buyerId },
      {
        bidId: bid.bidId,
        userId: buyerId,
        userName: buyer.name,
        userType: 'buyer',
        cropName: bid.cropName,
        quantity: bid.quantity,
        unit: bid.unit,
        quality: bid.quality,
        participationType: 'bidder',
        myBids: buyerBids,
        myHighestBid: buyerHighestBid,
        bidStatus: 'active'
      },
      { upsert: true, new: true }
    );

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

    // Use our comprehensive end bid function
    await endBidAndNotify(bid);

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

    const bidHistory = await BidHistory.find({ 
      userId: buyerId,
      userType: 'buyer'
    }).sort({ participatedAt: -1 });

    res.json({ bidHistory });

  } catch (err) {
    console.error('Error fetching buyer bid history:', err);
    res.status(500).json({ error: 'Failed to fetch bid history', details: err.message });
  }
});

// Get farmer's bid history
router.get('/farmer/:farmerId/history', async (req, res) => {
  try {
    const { farmerId } = req.params;

    const bidHistory = await BidHistory.find({ 
      userId: farmerId,
      userType: 'farmer'
    }).sort({ participatedAt: -1 });

    res.json({ bidHistory });

  } catch (err) {
    console.error('Error fetching farmer bid history:', err);
    res.status(500).json({ error: 'Failed to fetch bid history', details: err.message });
  }
});

// Get all bid history for a specific bid (shows all participants)
router.get('/:bidId/history', async (req, res) => {
  try {
    const { bidId } = req.params;

    const bidHistory = await BidHistory.find({ bidId }).sort({ participatedAt: -1 });
    const bid = await Bid.findOne({ bidId });

    if (!bid) {
      return res.status(404).json({ error: 'Bid not found' });
    }

    res.json({ 
      bid,
      participants: bidHistory 
    });

  } catch (err) {
    console.error('Error fetching bid history:', err);
    res.status(500).json({ error: 'Failed to fetch bid history', details: err.message });
  }
});

module.exports = router;