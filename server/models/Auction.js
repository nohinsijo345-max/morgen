const mongoose = require('mongoose');

const AuctionSchema = new mongoose.Schema({
  cropId: { type: mongoose.Schema.Types.ObjectId, ref: 'Crop', required: true },
  farmerId: { type: String, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  startingPrice: { type: Number, required: true },
  currentBid: { type: Number, default: 0 },
  currentBidder: { type: String, default: null },
  status: { 
    type: String, 
    enum: ['pending', 'active', 'completed', 'cancelled'], 
    default: 'pending' 
  },
  bids: [{
    bidderId: String,
    bidderName: String,
    amount: Number,
    timestamp: { type: Date, default: Date.now }
  }],
  winner: {
    bidderId: String,
    bidderName: String,
    finalAmount: Number
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Auction', AuctionSchema);
