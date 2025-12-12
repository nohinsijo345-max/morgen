const router = require('express').Router();
const Auction = require('../models/Auction');
const Crop = require('../models/Crop');

// Create new auction
router.post('/create', async (req, res) => {
  try {
    const { cropId, farmerId, startTime, endTime, startingPrice } = req.body;
    
    const crop = await Crop.findById(cropId);
    if (!crop) {
      return res.status(404).json({ error: 'Crop not found' });
    }
    
    const auction = new Auction({
      cropId,
      farmerId,
      startTime,
      endTime,
      startingPrice,
      currentBid: startingPrice
    });
    
    await auction.save();
    
    // Update crop status
    crop.status = 'in_auction';
    await crop.save();
    
    res.status(201).json(auction);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Place bid
router.post('/:auctionId/bid', async (req, res) => {
  try {
    const { auctionId } = req.params;
    const { bidderId, bidderName, amount } = req.body;
    
    const auction = await Auction.findById(auctionId).populate('cropId');
    if (!auction) {
      return res.status(404).json({ error: 'Auction not found' });
    }
    
    if (auction.status !== 'active') {
      return res.status(400).json({ error: 'Auction is not active' });
    }
    
    if (amount <= auction.currentBid) {
      return res.status(400).json({ error: 'Bid must be higher than current bid' });
    }
    
    auction.bids.push({ bidderId, bidderName, amount });
    auction.currentBid = amount;
    auction.currentBidder = bidderId;
    
    await auction.save();
    
    // Send notification to farmer about new bid
    const Update = require('../models/Update');
    const User = require('../models/User');
    
    const farmer = await User.findOne({ farmerId: auction.farmerId });
    if (farmer) {
      const update = new Update({
        userId: farmer._id,
        title: 'New Bid Received',
        message: `${bidderName} placed a bid of ₹${amount} on your ${auction.cropId?.name || 'crop'} auction. Current highest bid: ₹${amount}`,
        category: 'auction',
        isActive: true
      });
      await update.save();
    }
    
    res.json(auction);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get active auctions
router.get('/active', async (req, res) => {
  try {
    const auctions = await Auction.find({ status: 'active' })
      .populate('cropId')
      .sort({ createdAt: -1 });
    res.json(auctions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get auction by ID
router.get('/:auctionId', async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.auctionId).populate('cropId');
    if (!auction) {
      return res.status(404).json({ error: 'Auction not found' });
    }
    res.json(auction);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Accept bid (farmer)
router.post('/:auctionId/accept', async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.auctionId).populate('cropId');
    if (!auction) {
      return res.status(404).json({ error: 'Auction not found' });
    }
    
    const winnerBid = auction.bids[auction.bids.length - 1];
    
    auction.status = 'completed';
    auction.winner = {
      bidderId: auction.currentBidder,
      bidderName: winnerBid.bidderName,
      finalAmount: auction.currentBid
    };
    
    await auction.save();
    
    // Update crop status
    const crop = await Crop.findById(auction.cropId);
    crop.status = 'sold';
    await crop.save();
    
    // Send notifications
    const Update = require('../models/Update');
    const User = require('../models/User');
    
    // Notify winning buyer
    const winner = await User.findOne({ buyerId: auction.currentBidder });
    if (winner) {
      const winnerUpdate = new Update({
        userId: winner._id,
        title: 'Auction Won!',
        message: `Congratulations! You won the auction for ${auction.cropId?.name || 'crop'} with a bid of ₹${auction.currentBid}. Please proceed with payment and delivery arrangements.`,
        category: 'auction',
        isActive: true
      });
      await winnerUpdate.save();
    }
    
    // Notify farmer
    const farmer = await User.findOne({ farmerId: auction.farmerId });
    if (farmer) {
      const farmerUpdate = new Update({
        userId: farmer._id,
        title: 'Auction Completed',
        message: `Your ${auction.cropId?.name || 'crop'} auction has been completed! Winner: ${winnerBid.bidderName} with ₹${auction.currentBid}. Please arrange delivery.`,
        category: 'auction',
        isActive: true
      });
      await farmerUpdate.save();
    }
    
    res.json(auction);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reject/Cancel auction
router.post('/:auctionId/cancel', async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.auctionId).populate('cropId');
    if (!auction) {
      return res.status(404).json({ error: 'Auction not found' });
    }
    
    auction.status = 'cancelled';
    await auction.save();
    
    // Update crop status
    const crop = await Crop.findById(auction.cropId);
    crop.status = 'listed';
    await crop.save();
    
    // Notify all bidders about cancellation
    const Update = require('../models/Update');
    const User = require('../models/User');
    
    // Get unique bidders
    const uniqueBidders = [...new Set(auction.bids.map(bid => bid.bidderId))];
    
    for (const bidderId of uniqueBidders) {
      const bidder = await User.findOne({ buyerId: bidderId });
      if (bidder) {
        const update = new Update({
          userId: bidder._id,
          title: 'Auction Cancelled',
          message: `The auction for ${auction.cropId?.name || 'crop'} has been cancelled by the farmer. Your bid has been refunded.`,
          category: 'auction',
          isActive: true
        });
        await update.save();
      }
    }
    
    res.json(auction);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
