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
    
    const auction = await Auction.findById(auctionId);
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
    const auction = await Auction.findById(req.params.auctionId);
    if (!auction) {
      return res.status(404).json({ error: 'Auction not found' });
    }
    
    auction.status = 'completed';
    auction.winner = {
      bidderId: auction.currentBidder,
      bidderName: auction.bids[auction.bids.length - 1].bidderName,
      finalAmount: auction.currentBid
    };
    
    await auction.save();
    
    // Update crop status
    const crop = await Crop.findById(auction.cropId);
    crop.status = 'sold';
    await crop.save();
    
    res.json(auction);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reject/Cancel auction
router.post('/:auctionId/cancel', async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.auctionId);
    if (!auction) {
      return res.status(404).json({ error: 'Auction not found' });
    }
    
    auction.status = 'cancelled';
    await auction.save();
    
    // Update crop status
    const crop = await Crop.findById(auction.cropId);
    crop.status = 'listed';
    await crop.save();
    
    res.json(auction);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
