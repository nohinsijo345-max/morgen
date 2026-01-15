const mongoose = require('mongoose');

const BidSchema = new mongoose.Schema({
  bidId: { 
    type: String, 
    unique: true, 
    required: true 
  },
  
  // Farmer who created the bid
  farmerId: { 
    type: String, 
    required: true,
    ref: 'User'
  },
  farmerName: { 
    type: String, 
    required: true 
  },
  
  // Crop details
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
    enum: ['kg', 'quintal', 'ton'], 
    default: 'kg' 
  },
  quality: { 
    type: String, 
    enum: ['Premium', 'Grade A', 'Grade B', 'Standard'], 
    required: true 
  },
  
  // Dates
  harvestDate: { 
    type: Date, 
    required: true 
  },
  expiryDate: { 
    type: Date, 
    required: true 
  },
  bidEndDate: { 
    type: Date, 
    required: true 
  },
  
  // Pricing
  startingPrice: { 
    type: Number, 
    required: true 
  },
  currentPrice: { 
    type: Number, 
    required: true 
  },
  
  // Bid participants
  bids: [{
    buyerId: { 
      type: String, 
      required: true,
      ref: 'User'
    },
    buyerName: { 
      type: String, 
      required: true 
    },
    bidAmount: { 
      type: Number, 
      required: true 
    },
    bidTime: { 
      type: Date, 
      default: Date.now 
    }
  }],
  
  // Status
  status: { 
    type: String, 
    enum: ['active', 'ended', 'cancelled', 'completed'], 
    default: 'active' 
  },
  
  // Winner details (when bid ends)
  winnerId: { 
    type: String, 
    ref: 'User',
    default: null 
  },
  winnerName: { 
    type: String, 
    default: null 
  },
  winningAmount: { 
    type: Number, 
    default: null 
  },
  
  // Location (farmer's location)
  state: { 
    type: String, 
    required: true 
  },
  district: { 
    type: String, 
    required: true 
  },
  city: { 
    type: String, 
    required: true 
  },
  
  // Metadata
  totalBids: { 
    type: Number, 
    default: 0 
  },
  uniqueBidders: { 
    type: Number, 
    default: 0 
  },
  
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Update the updatedAt field before saving
BidSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for efficient queries
BidSchema.index({ farmerId: 1 });
BidSchema.index({ status: 1 });
BidSchema.index({ bidEndDate: 1 });
BidSchema.index({ state: 1, district: 1 });

module.exports = mongoose.model('Bid', BidSchema, 'Bids');