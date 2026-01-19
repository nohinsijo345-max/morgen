const mongoose = require('mongoose');

const bidHistorySchema = new mongoose.Schema({
  bidId: {
    type: String,
    required: true,
    ref: 'Bid'
  },
  userId: {
    type: String,
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  userType: {
    type: String,
    enum: ['farmer', 'buyer'],
    required: true
  },
  
  // Bid details for history
  cropName: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  unit: {
    type: String,
    required: true
  },
  quality: {
    type: String,
    required: true
  },
  
  // Participation details
  participationType: {
    type: String,
    enum: ['creator', 'bidder'],
    required: true
  },
  
  // For bidders
  myBids: [{
    bidAmount: Number,
    bidTime: Date
  }],
  myHighestBid: {
    type: Number,
    default: 0
  },
  
  // Bid outcome
  bidStatus: {
    type: String,
    enum: ['active', 'ended', 'cancelled', 'completed'],
    required: true
  },
  isWinner: {
    type: Boolean,
    default: false
  },
  winnerName: {
    type: String,
    default: null
  },
  winningAmount: {
    type: Number,
    default: null
  },
  
  // Contact exchange (for winner and farmer)
  contactExchanged: {
    type: Boolean,
    default: false
  },
  contactDetails: {
    email: String,
    phone: String,
    address: {
      state: String,
      district: String,
      city: String,
      pinCode: String
    }
  },
  
  // Timestamps
  participatedAt: {
    type: Date,
    default: Date.now
  },
  bidEndedAt: {
    type: Date,
    default: null
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

// Update lastUpdated on save
bidHistorySchema.pre('save', function(next) {
  this.lastUpdated = Date.now();
  next();
});

// Indexes for efficient queries
bidHistorySchema.index({ userId: 1, userType: 1 });
bidHistorySchema.index({ bidId: 1 });
bidHistorySchema.index({ bidStatus: 1 });
bidHistorySchema.index({ participatedAt: -1 });

module.exports = mongoose.model('BidHistory', bidHistorySchema);