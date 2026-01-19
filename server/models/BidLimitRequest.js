const mongoose = require('mongoose');

const BidLimitRequestSchema = new mongoose.Schema({
  buyerId: { type: String, required: true },
  buyerName: { type: String, required: true },
  currentLimit: { type: Number, required: true },
  requestedLimit: { type: Number, required: true },
  reason: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  },
  requestedAt: { type: Date, default: Date.now },
  processedAt: { type: Date },
  processedBy: { type: String }, // Admin ID who processed the request
  adminNotes: { type: String } // Admin notes when approving/rejecting
});

module.exports = mongoose.model('BidLimitRequest', BidLimitRequestSchema);