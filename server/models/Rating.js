const mongoose = require('mongoose');

const RatingSchema = new mongoose.Schema({
  farmerId: { type: String, required: true },
  buyerId: { type: String, required: true },
  auctionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Auction' },
  qualityRating: { type: Number, min: 1, max: 5, required: true },
  timelinessRating: { type: Number, min: 1, max: 5, required: true },
  overallRating: { type: Number, min: 1, max: 5 },
  review: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// Calculate overall rating before saving
RatingSchema.pre('save', function(next) {
  this.overallRating = (this.qualityRating + this.timelinessRating) / 2;
  next();
});

module.exports = mongoose.model('Rating', RatingSchema);
