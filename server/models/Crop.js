const mongoose = require('mongoose');

const CropSchema = new mongoose.Schema({
  farmerId: { type: String, required: true },
  farmerName: { type: String, required: true },
  name: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['vegetables', 'fruits', 'grains', 'spices', 'other'],
    required: true 
  },
  quantity: { type: Number, required: true },
  unit: { type: String, enum: ['kg', 'quintal', 'ton', 'piece'], default: 'kg' },
  basePrice: { type: Number, required: true },
  msp: { type: Number }, // Minimum Support Price set by admin
  
  // Harvest Management
  plantedDate: { type: Date },
  harvestDate: { type: Date, required: true },
  daysToHarvest: { type: Number },
  autoNotified: { type: Boolean, default: false }, // Auto-notify at 3 days
  
  // Status & Availability
  status: { 
    type: String, 
    enum: ['growing', 'ready', 'listed', 'in_auction', 'sold', 'expired'], 
    default: 'growing' 
  },
  
  // Images
  images: [String],
  
  // Location
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] }
  },
  district: { type: String },
  panchayat: { type: String },
  
  // Quality & Certification
  organic: { type: Boolean, default: false },
  quality: { type: String, enum: ['A', 'B', 'C'], default: 'A' },
  
  // AI Insights
  aiHealthScore: { type: Number, min: 0, max: 100 },
  aiPricePrediction: {
    nextWeekPrice: Number,
    trend: { type: String, enum: ['up', 'down', 'stable'] },
    confidence: Number
  },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Index for geospatial queries
CropSchema.index({ location: '2dsphere' });

// Calculate days to harvest before saving
CropSchema.pre('save', function(next) {
  if (this.harvestDate) {
    const today = new Date();
    const harvest = new Date(this.harvestDate);
    this.daysToHarvest = Math.ceil((harvest - today) / (1000 * 60 * 60 * 24));
  }
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Crop', CropSchema);